// Массив с арабскими словами и их переводами
const words = [
    { arabic: "كِتَابٌ", translation: "книга" },
    { arabic: "مِحْبَرَةٌ", translation: "чернильница" },
    { arabic: "كُرَّاسٌ", translation: "брошюра" },
    { arabic: "نَشَّافَةٌ", translation: "полотенце" },
    { arabic: "وَرَقٌ", translation: "листок" },
    { arabic: "هَذَا", translation: "это" },
    { arabic: "خُذْ", translation: "возьми" },
    { arabic: "لَوْحٌ", translation: "доска" },
    { arabic: "مِسْطَرٌ", translation: "линейка" },
    { arabic: "أَيْنَ", translation: "где?" },
    { arabic: "هَاتِ", translation: "дай" }
];

// Переменные для управления состоянием
let currentIndex = 0;

// Функция для отображения арабского слова
function showWord() {
    const arabicWord = document.getElementById("arabicWord");
    arabicWord.textContent = words[currentIndex].arabic;
    document.getElementById("guessInput").value = ""; // Очистка ввода
    document.getElementById("result").textContent = ""; // Очистка результата
    document.getElementById("hint").textContent = ""; // Очистка подсказки
}

// Функция для отображения подсказки (перевода)
function showHint() {
    const hint = document.getElementById("hint");
    hint.textContent = `Подсказка: ${words[currentIndex].translation}`;
    hint.style.color = "#007bff"; // Синий цвет для подсказки
}

// Функция для обработки вспышки
function flashEffect(type) {
    const container = document.getElementById("statusContainer");
    container.classList.add(type); // Добавляем класс успеха/ошибки

    setTimeout(() => {
        container.classList.remove(type); // Убираем класс после анимации
    }, 400); // Время вспышки
}

// Функция для проверки ввода
function checkGuess() {
    const userGuess = document.getElementById("guessInput").value.trim().toLowerCase();
    const correctTranslation = words[currentIndex].translation.toLowerCase();
    const result = document.getElementById("result");

    if (userGuess === correctTranslation) {
        result.textContent = "✅ Правильно!";
        result.style.color = "#25d366"; // Зеленый цвет
        flashEffect("success"); // Вспышка зелёного цвета
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % words.length; // Цикличный переход
            showWord();
        }, 1000);
    } else {
        result.textContent = "❌ Неправильно. Попробуйте ещё раз.";
        result.style.color = "#dc3545"; // Красный цвет
        flashEffect("error"); // Вспышка красного цвета
    }
}

// Отображение слова при загрузке
window.onload = showWord;