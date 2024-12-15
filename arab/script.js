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

// Функция для перемешивания массива
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Перемешиваем массив
const shuffledWords = shuffle(words);

// Выводим слова в случайном порядке
shuffledWords.forEach(word => {
    console.log(`Арабский: ${word.arabic} - Перевод: ${word.translation}`);
});



// Переменные для управления состоянием
let currentIndex = 0;

// Функция для отображения арабского слова
function showWord() {
    const arabicWord = document.getElementById("arabicWord");
    arabicWord.textContent = words[currentIndex].arabic;
    document.getElementById("guessInput").value = ""; // Очистка ввода
    document.getElementById("result").textContent = ""; // Очистка результата
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