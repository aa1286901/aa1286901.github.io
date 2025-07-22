// Загрузка приложений из apps.json
fetch('apps.json?'+ Math.random())
  .then(response => response.json())
  .then(data => {
    const menu = document.getElementById('menu-list');

    data.routes.forEach(app => {
      const item = document.createElement('div');
      item.className = 'menu-item';

      const encodedPlistUrl = encodeURIComponent(`https://raw.githubusercontent.com/aa1286901/aa1286901.github.io/refs/heads/master/apps1/plist/${app.bundleId}.plist`);
      item.setAttribute('onclick', `window.location.href='itms-services://?action=download-manifest&url=${encodedPlistUrl}'`);

      item.innerHTML = `
        <span class="icon">
          <img src="${app.img}" alt="${app.title}">
        </span>
        <div class="text-block">
          <span class="text">${app.title}</span>
          <span class="note">${app.category}</span>
        </div>
        <span class="arrow">›</span>
      `;
      
      menu.appendChild(item);
    });
  })
  .catch(error => {
    console.error('Ошибка при загрузке JSON:', error);
  });

// Установка темы при загрузке
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  document.documentElement.setAttribute('data-theme', 'light');
}

// Переключение темы вручную
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}
