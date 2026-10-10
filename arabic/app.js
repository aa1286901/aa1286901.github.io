// Данные урока (words, story, sentences) вынесены в lesson_<id>.json
const LESSONS = [
  { id: 1, title: "عِنْدَ الْمُعَلِّمِ الْمَرِيضِ", ruTitle: "Возле больного учителя" },
  { id: 2, title: "عِنْدَ الْمُعَلِّمِ الْمَرِيضِ", ruTitle: "Возле больного учителя" },
  { id: 3, title: "عَاقِبَةُ الْحِرْصِ", ruTitle: "Последствие алчности" },
  { id: 4, title: "الرَّجُلُ وَأَوْلَادُهُ", ruTitle: "Мужчина и его дети" },
  { id: 5, title: "الْمَطَرُ", ruTitle: "Дождь" },
  { id: 6, title: "الْحَمَامَةُ وَالنَّمْلَةُ", ruTitle: "Голубь и муравей" },
  { id: 7, title: "الْأَسَدُ", ruTitle: "Лев" },
  { id: 8, title: "الْأَسَدُ وَالْأَرْنَبُ وَالْوُحُوشُ", ruTitle: "Лев, заяц и дикие животные" },
  { id: 9, title: "حُقُوقُ الْوَالِدَيْنِ", ruTitle: "Долг перед родителями" },
];

// Шаги размера текста рассказа
const STORY_SIZES = [19, 21, 23, 26, 29, 32];
const SIZE_LABELS = ["Очень мелкий", "Мелкий", "Обычный", "Крупный", "Очень крупный", "Максимальный"];
const SIZE_KEY = "arabic.storySize";
const PROGRESS_KEY = "arabic.progress";
const FILTER_KEY = "arabic.filter";
const HARAKAT_KEY = "arabic.harakat";

// Слово считается выученным после двух ответов «Знаю» подряд
const LEARNED = 2;
// Через сколько карточек вернуть слово после «Не знаю»
const RETRY_GAP = 3;

const FUNCTION_TYPES = ["предлог", "союз", "частица", "междометие"];
const OTHER_TYPES = ["местоимение", "наречие", "числительное", "имя собственное"];
const FILTERS = [
  { id: "all", label: "Все", test: () => true },
  { id: "new", label: "Не выученные", test: (w) => !isLearned(w) },
  { id: "noun", label: "Существительные", test: (w) => w.type === "существительное" },
  { id: "verb", label: "Глаголы", test: (w) => w.type === "глагол" },
  { id: "adj", label: "Прилагательные", test: (w) => w.type === "прилагательное" },
  { id: "func", label: "Служебные", test: (w) => FUNCTION_TYPES.includes(w.type) },
  { id: "other", label: "Другие", test: (w) => OTHER_TYPES.includes(w.type) },
];

let lessonId = null;
let words = [];
let dict = new Map();
let story = [];
let sentences = [];
let deck = []; // индексы слов в текущем наборе карточек
let pos = 0;
const lessonData = new Map(); // id → Promise с JSON урока
const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const stripHarakat = (s) => s.replace(/[ً-ْٰ]/g, "");
const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

// localStorage может быть недоступен (приватный режим) — тогда просто не сохраняем
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
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

// ── Прогресс: { [урок]: { [слово]: число «Знаю» подряд } } ──
let progress = store.get(PROGRESS_KEY, {});
if (typeof progress !== "object" || progress === null) progress = {};

const boxOf = (w, id = lessonId) => progress[id]?.[w.arabic] ?? 0;
const isLearned = (w, id = lessonId) => boxOf(w, id) >= LEARNED;
function setBox(w, box) {
  (progress[lessonId] ??= {})[w.arabic] = box;
  store.set(PROGRESS_KEY, progress);
}

// ── Список уроков на главном экране ─────────────────────
function renderLessonList() {
  $("lessonList").innerHTML = LESSONS.map(
    (l) =>
      `<button class="lesson-item" type="button" data-lesson="${l.id}"><span class="lesson-num">${l.id}</span><span class="lesson-info"><span class="lesson-ru">${esc(l.ruTitle)}</span><span class="lesson-sub"><span class="lesson-count" id="count-${l.id}"></span><span class="lesson-ar" lang="ar" dir="rtl">${esc(l.title)}</span></span></span><svg class="chevron" width="8" height="14" viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`,
  ).join("");
  document.querySelectorAll(".lesson-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      location.hash = "#lesson-" + btn.dataset.lesson;
    });
  });
  renderCounts();
}

// Число слов и выученных подгружается в фоне; ошибка просто оставляет строку пустой
function renderCounts() {
  LESSONS.forEach((l) =>
    loadLesson(l.id)
      .then((data) => {
        const n = data.words.length;
        const learned = data.words.filter((w) => isLearned(w, l.id)).length;
        $("count-" + l.id).textContent =
          `${n} ${plural(n, "слово", "слова", "слов")}` + (learned ? ` · ${learned} выучено` : "");
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
  renderCounts();
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
    lessonId = id;
    words = data.words;
    story = data.story;
    sentences = Array.isArray(data.sentences) ? data.sentences : [];
    dict = new Map(words.map((w) => [w.arabic, w]));
    buildDeck();
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

// ── Фильтр карточек ─────────────────────────────────────
let filter = store.get(FILTER_KEY, "all");
if (!FILTERS.some((f) => f.id === filter)) filter = "all";

function renderChips() {
  $("filterChips").innerHTML = FILTERS.map((f) => {
    const n = words.filter(f.test).length;
    // Пустые группы прячем; «Все» и «Не выученные» видны всегда
    if (!n && f.id !== "all" && f.id !== "new" && f.id !== filter) return "";
    const active = f.id === filter;
    return `<button class="chip${active ? " active" : ""}" type="button" role="tab" aria-selected="${active}" data-filter="${f.id}">${f.label}<span class="chip-count">${n}</span></button>`;
  }).join("");
  // Выбранный фильтр всегда в зоне видимости
  const chips = $("filterChips");
  const active = chips.querySelector(".chip.active");
  if (active) chips.scrollLeft = active.offsetLeft - chips.clientWidth / 2 + active.offsetWidth / 2;
}

$("filterChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip || chip.dataset.filter === filter) return;
  filter = chip.dataset.filter;
  store.set(FILTER_KEY, filter);
  buildDeck();
});

function buildDeck() {
  const f = FILTERS.find((x) => x.id === filter) || FILTERS[0];
  deck = words.map((_, i) => i).filter((i) => f.test(words[i]));
  pos = 0;
  renderChips();
  renderWord();
}

// ── Карточки ────────────────────────────────────────────
function renderWord() {
  const card = $("wordCard");
  card.classList.remove("revealed");
  card.classList.toggle("empty", !deck.length);
  if (!deck.length) {
    const allLearned = filter === "new";
    $("emptyTitle").textContent = allLearned ? "Все слова выучены" : "Здесь пока нет слов";
    $("emptyText").textContent = allLearned
      ? "Можно повторить все слова урока или начать учить их заново."
      : "Выберите другой набор карточек.";
    $("emptyReset").hidden = !allLearned;
    return;
  }
  const w = words[deck[pos]];
  // Первое значение крупно, остальные (после «;») — мельче
  const [main, ...rest] = w.translation.split(";");
  $("arabicWord").textContent = w.arabic;
  $("translationMain").textContent = main.trim();
  $("translationRest").textContent = rest.join(";").trim();
  $("cardFace").setAttribute("aria-label", "Показать перевод");
  $("partOfSpeech").textContent = w.type;
  $("learnedMark").hidden = !isLearned(w);
  $("topCounter").textContent = `${pos + 1} из ${deck.length}`;
  $("progressBar").style.width = `${((pos + 1) / deck.length) * 100}%`;
}

function showWord(i) {
  if (!deck.length) return;
  pos = (i + deck.length) % deck.length;
  renderWord();
}

function nextCard() {
  if (pos + 1 < deck.length) return showWord(pos + 1);
  // Набор пройден: «Не выученные» собираем заново из оставшихся слов
  if (filter === "new") return buildDeck();
  showWord(0);
}

function grade(known) {
  if (!deck.length) return;
  const idx = deck[pos];
  const w = words[idx];
  setBox(w, known ? boxOf(w) + 1 : 0);
  // «Не знаю» — слово вернётся через несколько карточек
  if (!known && deck.length > 1) deck.splice(Math.min(pos + 1 + RETRY_GAP, deck.length), 0, idx);
  renderChips();
  nextCard();
}

$("cardFace").onclick = () => {
  const open = $("wordCard").classList.toggle("revealed");
  $("cardFace").setAttribute("aria-label", open ? "Скрыть перевод" : "Показать перевод");
};
$("gradeNo").onclick = () => grade(false);
$("gradeYes").onclick = () => grade(true);
$("prevWord").onclick = () => showWord(pos - 1);
$("nextWord").onclick = () => showWord(pos + 1);
$("randomWord").onclick = () => {
  if (deck.length < 2) return;
  let n;
  do n = Math.floor(Math.random() * deck.length);
  while (n === pos);
  showWord(n);
};
$("emptyAll").onclick = () => {
  filter = "all";
  store.set(FILTER_KEY, filter);
  buildDeck();
};
$("emptyReset").onclick = () => {
  delete progress[lessonId];
  store.set(PROGRESS_KEY, progress);
  buildDeck();
};

let startX = 0;
$("wordCard").addEventListener("touchstart", (e) => (startX = e.changedTouches[0].clientX), { passive: true });
$("wordCard").addEventListener(
  "touchend",
  (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) showWord(pos + (dx < 0 ? 1 : -1));
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
let showHarakat = store.get(HARAKAT_KEY, true) !== false;

function renderStory() {
  $("storyText").innerHTML = story
    .map(
      (line, li) =>
        `<span class="story-line" data-line="${li}">${line
          .map(
            ({ arabic, translation, type, lemma }) =>
              `<span class="story-word" data-arabic="${esc(arabic)}" data-translation="${esc(translation)}" data-type="${esc(type)}" data-lemma="${esc(lemma)}">${esc(showHarakat ? arabic : stripHarakat(arabic))}</span>`,
          )
          .join(" ")}.</span>`,
    )
    .join(" ");
}

function closeSheet() {
  $("wordSheet").classList.remove("show");
  $("wordSheet").setAttribute("aria-hidden", "true");
  $("sheetOverlay").hidden = true;
  document.querySelectorAll(".story-word.selected, .story-line.current").forEach((x) => {
    x.classList.remove("selected", "current");
  });
}

function setSentenceOpen(open) {
  $("sentenceText").hidden = !open;
  $("sentenceToggle").setAttribute("aria-expanded", String(open));
  $("sentenceToggle").textContent = open ? "Скрыть перевод предложения" : "Перевод предложения";
}

$("storyText").addEventListener("click", (e) => {
  const el = e.target.closest(".story-word");
  if (!el) return;
  toggleSizer(false);
  closeSheet();
  el.classList.add("selected");
  const line = el.closest(".story-line");
  line.classList.add("current");
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
  // Перевод всего предложения — по кнопке
  const sentence = sentences[Number(line.dataset.line)];
  $("sentenceBlock").hidden = !sentence;
  $("sentenceText").textContent = sentence || "";
  setSentenceOpen(false);
  $("sheetOverlay").hidden = false;
  $("wordSheet").setAttribute("aria-hidden", "false");
  $("wordSheet").classList.add("show");
});
$("sentenceToggle").onclick = (e) => {
  e.stopPropagation();
  setSentenceOpen($("sentenceText").hidden);
};
$("sheetOverlay").onclick = closeSheet;
$("wordSheet").onclick = closeSheet;

// ── Огласовки в рассказе ────────────────────────────────
function applyHarakat() {
  $("harakatSwitch").setAttribute("aria-checked", String(showHarakat));
}
$("harakatSwitch").onclick = () => {
  showHarakat = !showHarakat;
  store.set(HARAKAT_KEY, showHarakat);
  applyHarakat();
  closeSheet();
  renderStory();
};
applyHarakat();

// ── Размер текста рассказа ──────────────────────────────
let sizeIndex = store.get(SIZE_KEY, 2);
if (!Number.isInteger(sizeIndex) || sizeIndex < 0 || sizeIndex >= STORY_SIZES.length) sizeIndex = 2;

function applySize() {
  document.documentElement.style.setProperty("--story-size", STORY_SIZES[sizeIndex] + "px");
  $("sizeDots").innerHTML = STORY_SIZES.map((_, i) => `<span class="${i <= sizeIndex ? "on" : ""}"></span>`).join("");
  $("sizeLabel").textContent = SIZE_LABELS[sizeIndex];
  $("sizeDown").disabled = sizeIndex === 0;
  $("sizeUp").disabled = sizeIndex === STORY_SIZES.length - 1;
  store.set(SIZE_KEY, sizeIndex);
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
