// Получаем элементы
const appList = document.getElementById("app-list");
const categories = document.querySelectorAll(".category");
const searchInput = document.getElementById("search-input");

// Глобальная переменная для приложений и текущего фильтра
let apps = [];
let currentFilter = "#Design"; // По умолчанию

// Функция загрузки данных из apps.json
async function loadApps() {
  try {
    const response = await fetch("https://raw.githubusercontent.com/IAppsRepo/IAppsRepo.github.io/refs/heads/main/Repo.json");
    if (!response.ok) throw new Error("Ошибка загрузки JSON");
    apps = await response.json();
    renderApps(currentFilter); // Отображаем категорию по умолчанию
  } catch (error) {
    console.error("Ошибка загрузки приложений:", error);
  }
}

// Функция для рендера списка приложений
function renderApps(filter = "#Design", searchQuery = "") {
  appList.innerHTML = ""; // Очищаем список

  let filteredApps = apps; // Начинаем с полного списка приложений

  // Если есть поисковый запрос, фильтруем по нему все приложения
  if (searchQuery) {
    filteredApps = apps.filter((app) => {
      const appName = app.appName.split("|")[0].trim().toLowerCase();
      return appName.includes(searchQuery.toLowerCase());
    });
  } else {
    // Если поиска нет, фильтруем по категории
    filteredApps = apps.filter((app) => {
      const categories = app.appName.split("|").map((s) => s.trim());
      return categories.includes(filter);
    });
  }

  if (filteredApps.length === 0) {
    appList.innerHTML = "<p>Нет приложений по вашему запросу</p>";
    return;
  }

  filteredApps.forEach((app) => {
    const appCard = document.createElement("div");
    appCard.classList.add("app-card");
    const appCategories = app.appName.split("|").map((s) => s.trim());

    const formattedDescription = app.appDescription
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/\n/g, "<br>")
      .replace(/iApps Store/g, "Apps by Ahmedov");

    const appNameEncoded = encodeURIComponent(appCategories[0]);

    appCard.innerHTML = `
      <div class="app-header" onClick="window.open('https://apps.apple.com/search?term=${appNameEncoded}', '_blank')">
        <img src="${app.appImage}" alt="${app.appName}" class="app-icon">
        <div class="app-info">
          <h2>${appCategories[0]}</h2>
          <small>Версия: ${app.appVersion}</small>
        </div>
      </div>
      <p class="app-description">${formattedDescription}</p>
    `;

    appList.appendChild(appCard);
  });
}

// Слушатели на кнопки категорий
categories.forEach((category) => {
  category.addEventListener("click", () => {
    categories.forEach((cat) => cat.classList.remove("active"));
    category.classList.add("active");

    currentFilter = category.getAttribute("data-category");
    const searchQuery = searchInput.value.trim();
    renderApps(currentFilter, searchQuery);
  });
});

// Слушатель для поля поиска
searchInput.addEventListener("input", () => {
  const searchQuery = searchInput.value.trim();
  renderApps(currentFilter, searchQuery);
});

// Запускаем загрузку JSON после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  loadApps();
});