// Generation Provider Interface
class GenerationProvider {
  async start(projectId, materials, cornices) {
    throw new Error('Must be implemented');
  }

  async getStatus(projectId) {
    throw new Error('Must be implemented');
  }
}

// Mock Provider - для MVP
class MockGenerationProvider extends GenerationProvider {
  constructor() {
    super();
    this.timers = {};
  }

  async start(projectId, materials, cornices) {
    // Создаём статус проекта
    await Api.request('/generation/start.php', {
      method: 'POST',
      body: JSON.stringify({ projectId, materials, cornices }),
    });

    // Mock прогресс
    this.runMockProgress(projectId);
  }

  async runMockProgress(projectId) {
    const steps = [
      { progress: 25, delay: 800 },
      { progress: 50, delay: 1600 },
      { progress: 75, delay: 2400 },
      { progress: 100, delay: 3500 },
    ];

    for (const step of steps) {
      await new Promise(r => {
        this.timers[projectId] = setTimeout(r, step.delay - (steps[steps.indexOf(step) - 1]?.delay || 0));
      });
      
      // Обновляем статус в БД
      await Api.request('/generation/start.php', {
        method: 'POST',
        body: JSON.stringify({ projectId, progress: step.progress }),
      });
    }

    // Завершаем
    await Api.request('/generation/start.php', {
      method: 'POST',
      body: JSON.stringify({ projectId, status: 'completed' }),
    });
  }

  async getStatus(projectId) {
    return Api.getGenerationStatus(projectId);
  }
}

// Real AI Provider - для будущего подключения
class RealAIProvider extends GenerationProvider {
  constructor(apiUrl, apiKey) {
    super();
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async start(projectId, materials, cornices) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ projectId, materials, cornices }),
    });

    const data = await response.json();
    return data;
  }

  async getStatus(projectId) {
    return Api.getGenerationStatus(projectId);
  }
}

// Factory
const GenerationService = {
  provider: null,

  init() {
    // Сейчас используем Mock, в будущем заменить на RealAIProvider
    this.provider = new MockGenerationProvider();
  },

  async start(projectId, materials, cornices) {
    return this.provider.start(projectId, materials, cornices);
  },

  async getStatus(projectId) {
    return this.provider.getStatus(projectId);
  },
};
