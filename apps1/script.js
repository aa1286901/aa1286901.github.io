// Загрузка приложений из apps.json
fetch('apps.json')
  .then(response => response.json())
  .then(data => {
    const menu = document.getElementById('menu-list');

    data.routes.forEach(app => {
      const item = document.createElement('div');
      item.className = 'menu-item';

      const installUrl = `itms-services://?action=download-manifest&url=https://install.getappbox.com/install/scl/fi/${app.fi}/queryparam-rlkey-value-${app.rlkey}/manifest.plist`;

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

      item.addEventListener('click', () => {
        window.location.href = installUrl;
      });

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