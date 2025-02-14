// Получение элементов
const appList = document.getElementById("app-list");
const categories = document.querySelectorAll(".category");

// Функция для отображения приложений
function renderApps(filter = "#Social") {
  appList.innerHTML = ""; // Очистка списка перед отрисовкой

  const filteredApps = apps.filter((app) => app.category === filter);

  filteredApps.forEach((app) => {
    const appCard = document.createElement("div");
    appCard.classList.add("app-card");

    appCard.innerHTML = `
      <img src="${app.image}" alt="${app.name} Icon" class="app-icon">
      <div class="app-info">
        <h2>${app.name}</h2>
        <p>${app.description}</p>
      </div>
      <a href="${app.link}" class="download-button" target="_blank">
        <i class="fas fa-cloud-download-alt"></i>
      </a>
    `;

    appList.appendChild(appCard);
  });
}

// Слушатели для категорий
categories.forEach((category) => {
  category.addEventListener("click", () => {
    // Удаляем активный класс у всех категорий
    categories.forEach((cat) => cat.classList.remove("active"));
    category.classList.add("active");

    // Получаем категорию и отображаем
    const filter = category.getAttribute("data-category");
    renderApps(filter);
  });
});

// Первоначальная отрисовка
renderApps();