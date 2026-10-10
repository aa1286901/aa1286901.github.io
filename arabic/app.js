// Данные урока (words, story) вынесены в lesson_<id>.json
const LESSONS = [
  { id: 1, title: "عِنْدَ الْمُعَلِّمِ الْمَرِيضِ", ruTitle: "Возле больного учителя" },
  { id: 2, title: "عِنْدَ الْمُعَلِّمِ الْمَرِيضِ", ruTitle: "Возле больного учителя" },
  { id: 3, title: "عَاقِبَةُ الْجَشَعِ", ruTitle: "Последствие жадности" },
  { id: 4, title: "الرَّجُلُ وَأَوْلَادُهُ", ruTitle: "Мужчина и его дети" },
  { id: 5, title: "الْمَطَرُ", ruTitle: "Дождь" },
  { id: 6, title: "الْحَمَامَةُ وَالنَّمْلَةُ", ruTitle: "Голубь и муравей" },
  { id: 7, title: "الْأَسَدُ", ruTitle: "Лев" },
];

// Шаги размера текста рассказа
const STORY_SIZES = [19, 21, 23, 26, 29, 32];
const SIZE_LABELS = ["Очень мелкий", "Мелкий", "Обычный", "Крупный", "Очень крупный", "Максимальный"];
const SIZE_KEY = "arabic.storySize";

let words = [];
let dict = new Map();
let story = [];
let current = 0;
const lessonData = new Map(); // id → Promise с JSON урока
const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

function loadLesson(id) {
  if (!lessonData.has(id)) {
    const p = fetch(`lesson_${id}.json`).then((res) => {
      if (!res.ok) throw new Error(`Файл lesson_${id}.json не найден`);
      return res.json();
    });
    p.catch(() => lessonData.delete(id));
    lessonData.set(id, p);
  }
  return lessonData.get(id);
}

// ── Список уроков на главном экране ─────────────────────
function renderLessonList() {
  $("lessonList").innerHTML = LESSONS.map(
    (l) =>
      `<button class="lesson-item" type="button" data-lesson="${l.id}"><span class="lesson-num">${l.id}</span><span class="lesson-info"><span class="lesson-ru">${esc(l.ruTitle)}</span><span class="lesson-sub"><span class="lesson-count" id="count-${l.id}"></span><span class="lesson-ar" lang="ar" dir="rtl">${esc(l.title)}</span></span></span><svg class="chevron" width="8" height="14" viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6" fill="none" stroke="#c4c4c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`,
  ).join("");
  document.querySelectorAll(".lesson-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      location.hash = "#lesson-" + btn.dataset.lesson;
    });
  });
  // Число слов подгружается в фоне; ошибка просто оставляет строку пустой
  LESSONS.forEach((l) =>
    loadLesson(l.id)
      .then((data) => {
        const n = data.words.length;
        $("count-" + l.id).textContent = `${n} ${plural(n, "слово", "слова", "слов")}`;
      })
      .catch(() => {}),
  );
}
renderLessonList();

// ── Hash-роутер: #lesson-N ──────────────────────────────
function parseHash() {
  const m = location.hash.match(/^#lesson-(\d+)$/);
  return m ? Number(m[1]) : null;
}

function showWelcome() {
  closeSheet();
  toggleSizer(false);
  document.body.classList.add("view-welcome");
  document.title = "Arabic";
}

function showLesson(id) {
  document.body.classList.remove("view-welcome");
  const lesson = LESSONS.find((l) => l.id === id);
  if (lesson) {
    $("lessonNumber").textContent = "Урок " + id;
    $("lessonTitle").textContent = lesson.title;
    $("lessonTitleRu").textContent = lesson.ruTitle || "";
    document.title = `${lesson.ruTitle} — Урок ${id}`;
  }
}

async function openLesson(id) {
  try {
    const data = await loadLesson(id);
    if (!Array.isArray(data.words) || !Array.isArray(data.story))
      throw new Error("Неверная структура JSON");
    words = data.words;
    story = data.story;
    dict = new Map(words.map((w) => [w.arabic, w]));
    current = 0;
    renderWord();
    renderStory();
    $("storyScreen").querySelector(".story-card").scrollTop = 0;
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

// ── Карточки ────────────────────────────────────────────
function renderWord() {
  if (!words.length) return;
  const w = words[current];
  // Первое значение крупно, остальные (после «;») — мельче
  const [main, ...rest] = w.translation.split(";");
  $("arabicWord").textContent = w.arabic;
  $("translationMain").textContent = main.trim();
  $("translationRest").textContent = rest.join(";").trim();
  $("wordCard").classList.remove("revealed");
  $("cardFace").setAttribute("aria-label", "Показать перевод");
  $("partOfSpeech").textContent = w.type;
  $("topCounter").textContent = `${current + 1} из ${words.length}`;
  $("progressBar").style.width = `${((current + 1) / words.length) * 100}%`;
}

function showWord(i) {
  if (!words.length) return;
  current = (i + words.length) % words.length;
  renderWord();
}

$("cardFace").onclick = () => {
  const open = $("wordCard").classList.toggle("revealed");
  $("cardFace").setAttribute("aria-label", open ? "Скрыть перевод" : "Показать перевод");
};
$("prevWord").onclick = () => showWord(current - 1);
$("nextWord").onclick = () => showWord(current + 1);
$("randomWord").onclick = () => {
  let n;
  do n = Math.floor(Math.random() * words.length);
  while (n === current && words.length > 1);
  showWord(n);
};

let startX = 0;
$("wordCard").addEventListener("touchstart", (e) => (startX = e.changedTouches[0].clientX), { passive: true });
$("wordCard").addEventListener(
  "touchend",
  (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) showWord(current + (dx < 0 ? 1 : -1));
  },
  { passive: true },
);

// ── Режим: Слова / Текст ────────────────────────────────
function setMode(mode) {
  const wordsMode = mode === "words";
  $("wordsScreen").classList.toggle("active", wordsMode);
  $("storyScreen").classList.toggle("active", !wordsMode);
  $("wordsTab").classList.toggle("active", wordsMode);
  $("storyTab").classList.toggle("active", !wordsMode);
  $("wordsTab").setAttribute("aria-selected", wordsMode);
  $("storyTab").setAttribute("aria-selected", !wordsMode);
  $("mainContent").classList.toggle("story-mode", !wordsMode);
  if (wordsMode) {
    toggleSizer(false);
    closeSheet();
  }
}
$("wordsTab").onclick = () => setMode("words");
$("storyTab").onclick = () => setMode("story");

// ── Рассказ ─────────────────────────────────────────────
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

function closeSheet() {
  $("wordSheet").classList.remove("show");
  $("wordSheet").setAttribute("aria-hidden", "true");
  $("sheetOverlay").hidden = true;
  document.querySelectorAll(".story-word.selected").forEach((x) => x.classList.remove("selected"));
}

$("storyText").addEventListener("click", (e) => {
  const el = e.target.closest(".story-word");
  if (!el) return;
  toggleSizer(false);
  document.querySelectorAll(".story-word.selected").forEach((x) => x.classList.remove("selected"));
  el.classList.add("selected");
  $("popupArabic").textContent = el.dataset.arabic;
  $("popupTranslation").textContent = el.dataset.translation;
  $("popupType").textContent = el.dataset.type;
  // Словарная форма и значения из карточек урока
  const entry = dict.get(el.dataset.lemma);
  $("popupDictBlock").hidden = !entry;
  if (entry) {
    $("popupDictWord").textContent = entry.arabic;
    $("popupDictText").textContent = entry.translation;
  }
  $("sheetOverlay").hidden = false;
  $("wordSheet").setAttribute("aria-hidden", "false");
  $("wordSheet").classList.add("show");
});
$("sheetOverlay").onclick = closeSheet;
$("wordSheet").onclick = closeSheet;

// ── Размер текста рассказа ──────────────────────────────
let sizeIndex = 2;
try {
  const raw = localStorage.getItem(SIZE_KEY);
  const saved = Number(raw);
  if (raw !== null && Number.isInteger(saved) && saved >= 0 && saved < STORY_SIZES.length) sizeIndex = saved;
} catch {}

function applySize() {
  document.documentElement.style.setProperty("--story-size", STORY_SIZES[sizeIndex] + "px");
  $("sizeDots").innerHTML = STORY_SIZES.map((_, i) => `<span class="${i <= sizeIndex ? "on" : ""}"></span>`).join("");
  $("sizeLabel").textContent = SIZE_LABELS[sizeIndex];
  $("sizeDown").disabled = sizeIndex === 0;
  $("sizeUp").disabled = sizeIndex === STORY_SIZES.length - 1;
  try {
    localStorage.setItem(SIZE_KEY, String(sizeIndex));
  } catch {}
}

function toggleSizer(open) {
  $("sizePopover").hidden = !open;
  $("sizeBtn").setAttribute("aria-expanded", String(open));
}

$("sizeBtn").onclick = (e) => {
  e.stopPropagation();
  closeSheet();
  toggleSizer($("sizePopover").hidden);
};
$("sizeDown").onclick = () => {
  sizeIndex = Math.max(0, sizeIndex - 1);
  applySize();
};
$("sizeUp").onclick = () => {
  sizeIndex = Math.min(STORY_SIZES.length - 1, sizeIndex + 1);
  applySize();
};
// Нажатие вне меню размера закрывает его
document.addEventListener("click", (e) => {
  if (!$("sizePopover").hidden && !e.target.closest("#sizePopover, #sizeBtn")) toggleSizer(false);
});
applySize();

// ── Заставка: убираем после анимации или по нажатию ─────
const splash = $("splash");
if (splash) {
  const hideSplash = () => {
    splash.remove();
    document.documentElement.classList.remove("splash-on");
  };
  splash.addEventListener("animationend", (e) => {
    if (e.target === splash) hideSplash();
  });
  splash.addEventListener("click", hideSplash);
  setTimeout(hideSplash, 3000); // на случай, если анимация не сработала
}

// ── Инициализация ───────────────────────────────────────
route();

// PWA: офлайн-кэш и установка на экран «Домой»
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
