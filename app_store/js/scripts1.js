// Получаем элементы
const appList = document.getElementById("app-list");
const categories = document.querySelectorAll(".category");

// Глобальная переменная для приложений
let apps = [];

// Функция загрузки данных из apps.json
async function loadApps() {
  try {
    const response = await fetch("apps.json"); // Загружаем JSON
    if (!response.ok) throw new Error("Ошибка загрузки JSON");
    apps = await response.json(); // Преобразуем в объект

    renderApps("#Social"); // Отображаем категорию по умолчанию
  } catch (error) {
    console.error("Ошибка загрузки приложений:", error);
  }
}

// Функция для рендера списка приложений
function renderApps(filter = "#Social") {
  appList.innerHTML = ""; // Очищаем список

  const filteredApps = apps.filter((app) => {
    // Проверяем, есть ли категория в названии приложения
    const appCategories = app.appName.split("|").map((s) => s.trim()); 
    return appCategories.includes(filter);
  });

  if (filteredApps.length === 0) {
    appList.innerHTML = "<p>Нет приложений в этой категории</p>";
    return;
  }

  filteredApps.forEach((app) => {
    const appCard = document.createElement("div");
    appCard.classList.add("app-card");

    // Получаем название категории из `app.appName`
    const appCategories = app.appName.split("|").map((s) => s.trim()); 

    appCard.innerHTML = `
      <img src="${app.appImage}" alt="${app.appName}" class="app-icon">
      <div class="app-info">
        <h2>${appCategories[0]}</h2> <!-- Теперь тут правильное название -->
        <p>${app.appDescription}</p>
        <small>Версия: ${app.appVersion}</small>
      </div>
    `;

    appList.appendChild(appCard);
  });
}

// Добавляем слушатели на кнопки категорий
categories.forEach((category) => {
  category.addEventListener("click", () => {
    categories.forEach((cat) => cat.classList.remove("active"));
    category.classList.add("active");

    const filter = category.getAttribute("data-category");
    renderApps(filter);
  });
});

// Запускаем загрузку JSON после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  loadApps();
});