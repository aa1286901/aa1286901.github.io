let sentences = [];
let current = 0;
let correctAnswers = 0;
let totalSeen = 0;

async function loadSentences() {
  const res = await fetch("sentences.json");
  sentences = await res.json();
  nextSentence();
}
function updateProgress() {
  totalSeen++;
  const progressDiv = document.getElementById("progress");
  progressDiv.textContent = `${correctAnswers} из ${totalSeen} предложений`;
}
let showingArabic = true;

function nextSentence() {
  current = Math.floor(Math.random() * sentences.length);
  showingArabic = true;
  updateSentence();
  document.getElementById("translationInput").value = "";
  document.getElementById("result").textContent = "";
  document.getElementById("parts").innerHTML = "";
  updateProgress();
}

function nextSentence() {
  current = Math.floor(Math.random() * sentences.length);
  document.getElementById("sentence").innerHTML = makeClickableWords(sentences[current].sentence);
  document.getElementById("translationInput").value = "";
  document.getElementById("result").textContent = "";
  document.getElementById("parts").innerHTML = "";
  updateProgress();
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function checkTranslation() {
  const input = document.getElementById("translationInput").value;
  const correct = sentences[current].translation;
  const resultDiv = document.getElementById("result");

  if (input.trim() === "") {
    resultDiv.textContent = "Введите перевод.";
    resultDiv.style.color = "orange";
    return;
  }

  if (normalize(input) === normalize(correct)) {
    resultDiv.textContent = "Верно!";
    resultDiv.style.color = "lightgreen";
    correctAnswers++;
  } else {
    resultDiv.textContent = `${correct}`;
    resultDiv.style.color = "red";
  }

  updateProgress();
}

function makeClickableWords(sentenceText) {
  const sentenceObj = sentences[current];
  const wordsWithInfo = sentenceObj.parts;

  return sentenceText.split(" ").map(word => {
    const info = wordsWithInfo.find(p => p.word.replace(/[^\u0600-\u06FF]/g, "") === word.replace(/[^\u0600-\u06FF]/g, ""));
    if (info) {
      return `<span data-tooltip="${info.type}">${word}</span>`;
    }
    return word;
  }).join(" ");
}

function showParts() {
  const parts = sentences[current].parts;
  const partsDiv = document.getElementById("parts");
  partsDiv.innerHTML = "<strong>Разбор:</strong><ul>" + parts.map(p => `<li>${p.word} — ${p.type}</li>`).join("") + "</ul>";
}

function showParts() {
  const parts = sentences[current].parts;
  const partsHTML = "<strong>Разбор:</strong><ul>" + parts.map(p => `<li>${p.word} — ${p.type}</li>`).join("") + "</ul>";
  document.getElementById("slidePartsContent").innerHTML = partsHTML;
  document.getElementById("slideUpPanel").classList.add("show");
}

function hideParts() {
  document.getElementById("slideUpPanel").classList.remove("show");
}

window.onload = loadSentences;