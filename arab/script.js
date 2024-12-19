// Перемешиваем массив
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Состояние для текущего выбранного урока
let selectedLesson = 'all'; // По умолчанию показываем все уроки

// Состояние статистики
let correctAnswers = 0;
let incorrectAnswers = 0;

// Функция обновления выбранного урока
function updateLesson() {
    const lessonSelect = document.getElementById('lessonSelect');
    selectedLesson = lessonSelect.value;
    currentIndex = 0; // Сброс индекса
    showWord();
    updateStats(); // Обновляем статистику
}

// Переменные для состояния
let currentIndex = 0;
let options = [];

// Функция для генерации вариантов ответа
function generateOptions(filteredWords) {
    const correctWord = filteredWords[currentIndex];
    const otherWords = filteredWords.filter((word) => word !== correctWord);

    // Перемешивание массива случайных элементов
    const shuffledOtherWords = shuffleArray(otherWords).slice(0, 5); // 5 случайных слов

    // Добавляем правильный ответ и перемешиваем
    options = shuffleArray([correctWord, ...shuffledOtherWords]);
}

// Функция для отображения арабского слова и вариантов ответа
function showWord() {
    const arabicWord = document.getElementById("arabicWord");
    const optionsContainer = document.getElementById("optionsContainer");

    // Фильтрация слов по выбранному уроку
    const filteredWords = words.filter(word => selectedLesson === 'all' || word.lesson === parseInt(selectedLesson));

    if (filteredWords.length > 0) {
        arabicWord.textContent = filteredWords[currentIndex].arabic;
        optionsContainer.innerHTML = ""; // Очистка старых кнопок

        // Генерация вариантов
        generateOptions(filteredWords);

        // Отображение вариантов ответа
        options.forEach((option) => {
            const button = document.createElement("button");
            button.textContent = option.translation;
            button.classList.add("option");
            button.onclick = () => checkAnswer(option.translation, filteredWords);
            optionsContainer.appendChild(button);
        });

        // Очистка результата
        document.getElementById("result").textContent = "";
    } else {
        arabicWord.textContent = "Нет слов для выбранного урока";
        optionsContainer.innerHTML = "";
    }
}

// Функция проверки ответа
function checkAnswer(selectedTranslation, filteredWords) {
    const correctTranslation = filteredWords[currentIndex].translation;
    const result = document.getElementById("result");

    if (selectedTranslation === correctTranslation) {
        correctAnswers++;
        result.textContent = "✅ Правильно!";
        result.style.color = "#25d366"; // Зеленый цвет
        flashEffect("success");
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % filteredWords.length; // Цикличный переход
            showWord();
        }, 1000);
    } else {
        incorrectAnswers++;
        result.textContent = "❌ Неправильно. Попробуйте ещё раз.";
        result.style.color = "#dc3545"; // Красный цвет
        flashEffect("error");
    }
    updateStats(); // Обновляем статистику
}

// Функция обновления статистики
function updateStats() {
    const statsContainer = document.getElementById("stats");
    statsContainer.innerHTML = `
        <p>Правильных ответов: <strong>${correctAnswers}</strong></p>
        <p>Неправильных ответов: <strong>${incorrectAnswers}</strong></p>
    `;
}

// Функция для обработки вспышки
function flashEffect(type) {
    const container = document.getElementById("statusContainer");
    container.classList.add(type); // Добавляем класс успеха/ошибки

    setTimeout(() => {
        container.classList.remove(type); // Убираем класс после анимации
    }, 400); // Время вспышки
}

// Отображение слова при загрузке
window.onload = () => {
    showWord();
    updateStats();
};