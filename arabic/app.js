// Данные урока (words, story) вынесены в lesson_<id>.json
const LESSONS = [
  { id: 1, title: "عِنْدَ الْمُعَلِّمِ الْمَرِيضِ", ruTitle: "Возле больного учителя" },
  { id: 2, title: "عِنْدَ الْمُعَلِّمِ الْمَرِيضِ", ruTitle: "Возле больного учителя" },
  { id: 3, title: "عَاقِبَة الْجَشَعِ", ruTitle: "Последствие жадности" },
  { id: 4, title: "الرَّجُلُ وَأَوْلَادُهُ", ruTitle: "Мужчина и его дети" },
  { id: 5, title: "المَطَرُ", ruTitle: "Дождь" },
  { id: 6, title: "الْحَمَامَةُ وَالنَّمْلَةُ", ruTitle: "Голубь и муравей" },
  { id: 7, title: "الْأَسَدُ", ruTitle: "Лев" },
];

let words = [];
let dict = new Map();
let story = [];
let current = 0;
const $ = (id) => document.getElementById(id);
const arDigits = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// ── Список уроков: строится из LESSONS для главного экрана и меню ──
function renderLessonLists() {
  const html = LESSONS.map(
    (l) =>
      `<button class="lesson-item" data-lesson="${l.id}"><strong>${arDigits(l.id)}</strong><span class="lesson-info"><span>${esc(l.title)}</span><small>${esc(l.ruTitle)}</small></span></button>`,
  ).join("");
  document.querySelectorAll(".lesson-list").forEach((list) => (list.innerHTML = html));
}
renderLessonLists();

// ── Hash-роутер: #lesson-N ──────────────────────────────
function parseHash() {
  const m = location.hash.match(/^#lesson-(\d+)$/);
  return m ? Number(m[1]) : null;
}

function showWelcome() {
  document.body.classList.add("view-welcome");
  document.title = "Арабский — Уроки";
}

function showLesson(id) {
  document.body.classList.remove("view-welcome");
  const lesson = LESSONS.find((l) => l.id === id);
  if (lesson) {
    $("lessonNumber").textContent = "УРОК " + arDigits(id);
    $("lessonTitle").textContent = lesson.title;
    $("lessonTitleRu").textContent = lesson.ruTitle || "";
    document.title = `${lesson.ruTitle} — Урок ${id}`;
  }
  markActiveLesson(id);
}

async function openLesson(id) {
  try {
    const res = await fetch(`lesson_${id}.json`);
    if (!res.ok) throw new Error(`Файл lesson_${id}.json не найден`);
    const data = await res.json();
    if (!Array.isArray(data.words) || !Array.isArray(data.story))
      throw new Error("Неверная структура JSON");
    words = data.words;
    story = data.story;
    dict = new Map(words.map((w) => [w.arabic, w]));
    current = 0;
    renderWord();
    renderStory();
    initHandlers();
    showLesson(id);
  } catch (err) {
    alert(err.message);
    location.hash = "";
  }
}

async function route() {
  const id = parseHash();
  if (id === null) {
    showWelcome();
  } else {
    const lessonExists = LESSONS.some((lesson) => lesson.id === id);
    if (lessonExists) await openLesson(id);
    else {
      alert("Этот урок пока недоступен");
      location.hash = "";
    }
  }
}

window.addEventListener("hashchange", route);

// ── Рендер ──────────────────────────────────────────────
function renderWord() {
  if (!words.length) return;
  const w = words[current];
  $("arabicWord").textContent = w.arabic;
  $("translation").querySelector(".translation-text").textContent = w.translation;
  $("translation").classList.remove("revealed");
  $("partOfSpeech").textContent = w.type;
  $("topCounter").textContent = `${arDigits(current + 1)} / ${arDigits(words.length)}`;
}
function renderStory() {
  $("storyText").innerHTML = story
    .map(
      (line) =>
        `<span class="story-line">${line
          .map(
            ({ arabic, translation, type, lemma }) =>
              `<span class="story-word" data-arabic="${esc(arabic)}" data-translation="${esc(translation)}" data-type="${esc(type)}" data-lemma="${esc(lemma)}">${esc(arabic)}</span>`,
          )
          .join(" ")}.</span>`,
    )
    .join(" ");
}
function showWord(i) {
  if (!words.length) return;
  current = (i + words.length) % words.length;
  renderWord();
}
function setMode(mode) {
  const wordsMode = mode === "words";
  $("wordsScreen").classList.toggle("active", wordsMode);
  $("storyScreen").classList.toggle("active", !wordsMode);
  $("wordsTab").classList.toggle("active", wordsMode);
  $("storyTab").classList.toggle("active", !wordsMode);
  $("wordsTab").setAttribute("aria-selected", wordsMode);
  $("storyTab").setAttribute("aria-selected", !wordsMode);
}

// ── Боковое меню уроков ─────────────────────────────────
// Навешивается сразу: drawer должен открываться и с экрана
// «Выберите урок», и из урока.
function toggleDrawer(open) {
  $("lessonDrawer").classList.toggle("open", open);
  $("drawerOverlay").classList.toggle("show", open);
  $("lessonDrawer").setAttribute("aria-hidden", String(!open));
  $("menuBtn").setAttribute("aria-expanded", String(open));
}

function markActiveLesson(id) {
  document.querySelectorAll(".lesson-item").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.lesson) === id);
  });
}

$("menuBtn").onclick = () => toggleDrawer(true);
$("drawerClose").onclick = () => toggleDrawer(false);
$("drawerOverlay").onclick = () => toggleDrawer(false);

// Выбор урока в списке → переход на #lesson-N (hashchange откроет урок)
document.querySelectorAll(".lesson-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = Number(btn.dataset.lesson);
    toggleDrawer(false);
    if (location.hash === "#lesson-" + id) route();
    else location.hash = "#lesson-" + id;
  });
});

// ── Обработчики урока ───────────────────────────────────
// Только после загрузки JSON: они обращаются к words[current].
let handlersReady = false;
function initHandlers() {
  if (handlersReady) return;
  handlersReady = true;

  $("prevWord").onclick = () => showWord(current - 1);
  $("nextWord").onclick = () => showWord(current + 1);
  $("randomWord").onclick = () => {
    let n;
    do n = Math.floor(Math.random() * words.length);
    while (n === current && words.length > 1);
    showWord(n);
  };
  const toggleTranslation = () => $("translation").classList.toggle("revealed");
  $("translation").onclick = toggleTranslation;
  $("revealHint").onclick = toggleTranslation;
  $("wordsTab").onclick = () => setMode("words");
  $("storyTab").onclick = () => setMode("story");

  $("storyText").addEventListener("click", (e) => {
    const el = e.target.closest(".story-word");
    if (!el) return;
    document
      .querySelectorAll(".story-word.selected")
      .forEach((x) => x.classList.remove("selected"));
    el.classList.add("selected");
    $("popupArabic").textContent = el.dataset.arabic;
    $("popupTranslation").textContent = el.dataset.translation;
    $("popupType").textContent = el.dataset.type;
    // Словарная форма и значения из карточек урока
    const entry = dict.get(el.dataset.lemma);
    $("popupDict").innerHTML = entry
      ? `<span class="popup-dict-word">${esc(entry.arabic)}</span> ${esc(entry.translation)}`
      : "";
    $("wordPopup").classList.add("show");
    clearTimeout(window.popupTimer);
    window.popupTimer = setTimeout(
      () => $("wordPopup").classList.remove("show"),
      3500,
    );
  });

  let startX = 0;
  $("wordCard").addEventListener(
    "touchstart",
    (e) => {
      startX = e.changedTouches[0].clientX;
    },
    { passive: true },
  );
  $("wordCard").addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) showWord(current + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );
}

// ── Инициализация ───────────────────────────────────────
route();