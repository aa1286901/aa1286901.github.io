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
const LAST_KEY = "arabic.lastLesson";

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
  document.querySelectorAll("#lessonList .lesson-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      location.hash = "#lesson-" + btn.dataset.lesson;
    });
  });
  renderCounts();
}

// Число слов и выученных подгружается в фоне; ошибка просто оставляет строку пустой
function renderCounts() {
  return Promise.all(
    LESSONS.map((l) =>
      loadLesson(l.id)
        .then((data) => {
          const n = data.words.length;
          const learned = data.words.filter((w) => isLearned(w, l.id)).length;
          $("count-" + l.id).textContent =
            `${n} ${plural(n, "слово", "слова", "слов")}` + (learned ? ` · ${learned} выучено` : "");
          return { n, learned };
        })
        .catch(() => ({ n: 0, learned: 0 })),
    ),
  );
}
renderLessonList();

// ── Hash-роутер: / книги, #mabda уроки, #lesson-N, #nahw ─
function parseHash() {
  const m = location.hash.match(/^#lesson-(\d+)$/);
  return m ? Number(m[1]) : null;
}

// view: home | welcome | nahw | lesson (у урока своего класса нет)
function setView(view) {
  closeSheet();
  closeQawl();
  toggleSizer(false);
  document.body.classList.remove("view-home", "view-welcome", "view-nahw", "view-quiz");
  if (view !== "lesson") document.body.classList.add("view-" + view);
}

// Главный экран: обложки книг, общий прогресс и «Продолжить»
function showHome() {
  setView("home");
  document.title = "Arabic";
  const last = LESSONS.find((l) => l.id === store.get(LAST_KEY, null));
  $("resume").hidden = !last;
  if (last) {
    $("resume").href = "#lesson-" + last.id;
    $("resumeTitle").textContent = `Урок ${last.id} · ${last.ruTitle}`;
  }
  renderCounts().then((stats) => {
    const n = stats.reduce((a, x) => a + x.n, 0);
    const learned = stats.reduce((a, x) => a + x.learned, 0);
    $("mabdaMeta").textContent =
      `${LESSONS.length} ${plural(LESSONS.length, "урок", "урока", "уроков")} · ${n} ${plural(n, "слово", "слова", "слов")}`;
    $("mabdaBar").style.width = n ? (learned / n) * 100 + "%" : "0";
    $("mabdaNote").textContent = learned ? `Выучено ${learned} из ${n}` : "Пока ничего не выучено";
  });
}

function showWelcome() {
  setView("welcome");
  document.title = "Уроки — Arabic";
  renderCounts();
}

function showLesson(id) {
  setView("lesson");
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
    store.set(LAST_KEY, id);
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
    location.hash = "#mabda";
  }
}

async function route() {
  if (location.hash === "#amil-quiz") return showQuiz();
  if (TREE_BOOKS[location.hash]) return showNahw(location.hash);
  if (location.hash === "#mabda") return showWelcome();
  const id = parseHash();
  if (id === null) {
    showHome();
  } else {
    const lessonExists = LESSONS.some((lesson) => lesson.id === id);
    if (lessonExists) await openLesson(id);
    else {
      alert("Этот урок пока недоступен");
      location.hash = "#mabda";
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

// ── Грамматика: дерево главы об имени ───────────────────
// Уровни идут сверху вниз: корень, под ним сетка его тем, под выбранной темой — сетка её тем…
// Книги-деревья: адрес → файл и подписи
const TREE_BOOKS = {
  "#nahw": { file: "nahw_ism.json", book: "Шарх аль-Унмузадж", eyebrow: "النَّحْوُ", said: "قَالَ:" },
  "#amil": { file: "mia_amil.json", book: "Сто управляющих слов", eyebrow: "مِئَةُ عَامِلٍ", sub: "", quiz: true },
};
const treeCache = new Map(); // адрес → JSON книги
let nahwBook = null; // текущая книга из TREE_BOOKS
let nahwData = null;
let nahwNodes = []; // все узлы по порядку обхода; индекс — data-i у плашки
let nahwParent = []; // индекс родителя для каждого узла
let nahwPath = [0]; // раскрытые узлы от корня вниз

const CHEVRON = `<svg width="12" height="8" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const kidsOf = (i) => nahwNodes[i].children || [];
// Подпись числа ветвей: у узла может быть своё слово (cw), иначе «темы»
const topicCount = (n, cw = ["тема", "темы", "тем"]) => `${n} ${plural(n, ...cw)}`;

function indexNodes(n, parent) {
  const i = nahwNodes.push(n) - 1;
  nahwParent[i] = parent;
  n._i = i;
  (n.children || []).forEach((c) => indexNodes(c, i));
}

// Колонок: 1 тема — 1, 2 или 4 — по 2, остальное — по 3
const colsFor = (n) => (n === 1 ? 1 : n === 2 || n === 4 ? 2 : 3);

function nodeCard(i, level, cls = "") {
  const n = nahwNodes[i];
  const k = kidsOf(i).length;
  const open = nahwPath[level + 1] === i;
  const toggle = k
    ? `<button class="nb-open" type="button" data-open="${i}" data-level="${level}" aria-expanded="${open}" aria-label="Темы: ${k}">${CHEVRON}</button>`
    : "";
  return `<div class="nb${open ? " open" : ""}${k ? " has-kids" : ""} ${cls}"><button class="nb-box" type="button" data-i="${i}"><span class="nb-ar" lang="ar" dir="rtl">${esc(n.ar)}</span>${n.ru ? `<span class="nb-ru">${esc(n.ru)}</span>` : ""}${k ? `<span class="nb-count">${topicCount(n.total ?? k, n.cw)}</span>` : ""}</button>${toggle}</div>`;
}

function renderNahw(scrollTo) {
  let html = `<div class="nb-level nb-top">${nodeCard(0, -1, "root")}</div>`;
  nahwPath.forEach((p, level) => {
    const kids = kidsOf(p).map((c) => c._i);
    if (!kids.length) return;
    const head = level
      ? `<div class="nb-head"><span class="nb-head-ar" lang="ar" dir="rtl">${esc(nahwNodes[p].ar)}</span><span class="nb-head-ru">${nahwNodes[p].ru ? esc(nahwNodes[p].ru) + " · " : ""}${topicCount(nahwNodes[p].total ?? kids.length, nahwNodes[p].cw)}</span></div>`
      : "";
    html += `<div class="nb-link" id="nb-link-${level}" aria-hidden="true"></div>${head}<div class="nb-level" style="--cols:${colsFor(kids.length)}">${kids.map((c) => nodeCard(c, level)).join("")}</div>`;
  });
  $("nahwTree").innerHTML = html;
  if (scrollTo != null) {
    const el = $("nb-link-" + scrollTo);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
}

// Раскрыть узел: путь до него от корня
function openNode(i) {
  const chain = [];
  for (let j = i; j != null; j = nahwParent[j]) chain.unshift(j);
  nahwPath = kidsOf(i).length ? chain : chain.slice(0, -1);
  renderNahw(nahwPath.length - 1);
}

async function loadTreeBook(hash) {
  if (!treeCache.has(hash)) {
    const book = TREE_BOOKS[hash];
    const res = await fetch(book.file);
    if (!res.ok) throw new Error(`Файл ${book.file} не найден`);
    treeCache.set(hash, await res.json());
  }
  return treeCache.get(hash);
}

async function showNahw(hash) {
  setView("nahw");
  const book = TREE_BOOKS[hash];
  $("nahwEyebrow").textContent = book.eyebrow;
  $("quizEntry").hidden = !book.quiz;
  if (book.quiz) quizEntryStats(hash);
  if (nahwBook === book) return;
  try {
    nahwData = await loadTreeBook(hash);
    nahwBook = book;
    const root = nahwData.tree;
    document.title = `${root.ru} — Arabic`;
    $("nahwTitle").textContent = root.ar;
    $("nahwSub").textContent = book.sub ?? `${root.ru} · ${book.book}`;
    $("nahwSub").hidden = !$("nahwSub").textContent;
    nahwNodes = [];
    nahwParent = [];
    indexNodes(root, null);
    nahwPath = [0];
    renderNahw();
    $("nahwScroll").scrollTop = 0;
  } catch (err) {
    alert(err.message);
    location.hash = "";
  }
}

$("nahwTree").addEventListener("click", (e) => {
  const open = e.target.closest("button[data-open]");
  if (open) {
    const i = Number(open.dataset.open);
    const level = Number(open.dataset.level);
    const isOpen = nahwPath[level + 1] === i;
    nahwPath = nahwPath.slice(0, level + 1);
    if (!isOpen) nahwPath.push(i);
    renderNahw(isOpen ? null : level + 1);
    return;
  }
  const box = e.target.closest("button[data-i]");
  if (box) openQawl(Number(box.dataset.i));
});

$("nahwTitle").onclick = () => openQawl(0);

// ── Окно с определением из книги ────────────────────────
let qawlIndex = null;

function openQawl(i) {
  const n = nahwNodes[i];
  if (!n) return;
  qawlIndex = i;
  const fill = (block, el, text) => {
    $(block).hidden = !text;
    $(el).textContent = text || "";
  };
  $("qawlRu").textContent = n.ru;
  $("qawlTerm").textContent = n.ar;
  fill("qawlQuoteBlock", "qawlQuote", n.qawl);
  fill("qawlTrBlock", "qawlTr", n.qawlRu);
  fill("qawlDefBlock", "qawlDef", n.qawl ? "" : n.def);
  // Примеры: одной строкой (ex) или списком с переводом из книги (exs)
  const exs = n.exs || [];
  fill("qawlExBlock", "qawlEx", n.ex);
  $("qawlEx").hidden = !n.ex;
  if (exs.length) $("qawlExBlock").hidden = false;
  $("qawlExs").innerHTML = exs
    .map((x) => `<li><span class="qawl-ex-ar" lang="ar" dir="rtl">${esc(x.ar)}</span>${x.ru ? `<span class="qawl-ex-ru">${esc(x.ru)}</span>` : ""}</li>`)
    .join("");
  $("qawlSaid").hidden = !nahwBook.said;
  $("qawlSaid").textContent = nahwBook.said || "";
  $("qawlPage").textContent = n.p ? `${nahwBook.book}, стр. ${n.p}` : "";
  const kids = kidsOf(i).length;
  $("qawlBranch").hidden = !kids || nahwPath.includes(i);
  $("qawlBranch").textContent = `Показать: ${topicCount(kids, n.cw)}`;
  $("qawlExTitle").textContent = exs.length > 1 ? "Примеры" : "Пример";
  $("qawlLayer").hidden = false;
  requestAnimationFrame(() => $("qawlLayer").classList.add("show"));
  $("qawlModal").scrollTop = 0;
  $("qawlClose").focus({ preventScroll: true });
}

function closeQawl() {
  const layer = $("qawlLayer");
  if (layer.hidden) return;
  layer.classList.remove("show");
  setTimeout(() => {
    if (!layer.classList.contains("show")) layer.hidden = true;
  }, 220);
}

$("qawlClose").onclick = closeQawl;
$("qawlOverlay").onclick = closeQawl;
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeQawl();
});
$("qawlBranch").onclick = () => {
  closeQawl();
  openNode(qawlIndex);
};

// ── Тренажёр «Ста управляющих слов» ─────────────────────
// Вопрос о слове: «какой это вид?» или «что оно делает?»; ответы и пояснения — из книги
const QUIZ_KEY = "arabic.amilQuiz"; // { "вид|слово": сколько раз подряд верно }
const QUIZ_LEN = 10;
let quizStore = store.get(QUIZ_KEY, {});
if (typeof quizStore !== "object" || quizStore === null) quizStore = {};
let quizItems = []; // { n, type, key }
let quizTypes = [];
let quizRound = [];
let quizPos = 0;
let quizRight = 0;

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const plainAr = (s) => stripHarakat(s).replace(/[ٱأإآ]/g, "ا").replace(/\s*\(.*?\)\s*/g, "").trim();

function collectQuiz(root) {
  quizItems = [];
  quizTypes = [];
  const walk = (n, type) => {
    if (n.k === "type") quizTypes.push((type = n));
    if (n.k === "amil") quizItems.push({ n, type, key: `${plainAr(type.ar)}|${plainAr(n.ar)}` });
    (n.children || []).forEach((c) => walk(c, type));
  };
  walk(root, null);
}

const quizLearnedCount = () => quizItems.filter((it) => (quizStore[it.key] || 0) >= LEARNED).length;

async function quizEntryStats(hash) {
  try {
    collectQuiz((await loadTreeBook(hash)).tree);
    const k = quizLearnedCount();
    $("quizEntrySub").textContent = k
      ? `Выучено ${k} из ${quizItems.length}`
      : "Вид и действие каждого из ста слов";
  } catch {}
}

// Слово может стоять в нескольких видах (مَا, لَا) — тогда верны все они
function correctTypes(it) {
  const w = plainAr(it.n.ar);
  return quizTypes.filter((t) => quizItems.some((x) => x.type === t && plainAr(x.n.ar) === w));
}

function makeQuestion(it) {
  const mode = Math.random() < 0.5 ? "type" : "act";
  const right = correctTypes(it);
  const label = (t) => (mode === "type" ? t.ar : t.act);
  const rightLabels = new Set(right.map(label));
  const pool = shuffle([...new Set(quizTypes.map(label))].filter((l) => !rightLabels.has(l)));
  const opts = shuffle([label(it.type), ...pool.slice(0, 3)]);
  return { it, mode, opts, rightLabels };
}

function startQuiz() {
  // Сначала слова, которые знаешь хуже всего
  const ranked = shuffle([...quizItems]).sort((a, b) => (quizStore[a.key] || 0) - (quizStore[b.key] || 0));
  quizRound = ranked.slice(0, QUIZ_LEN).map(makeQuestion);
  quizPos = 0;
  quizRight = 0;
  $("quizDone").hidden = true;
  $("quizBody").hidden = false;
  renderQuestion();
}

function renderQuizMeta() {
  $("quizStep").textContent = `Вопрос ${Math.min(quizPos + 1, quizRound.length)} из ${quizRound.length}`;
  $("quizLearned").textContent = `Выучено ${quizLearnedCount()} из ${quizItems.length}`;
  $("quizBar").style.width = (quizPos / quizRound.length) * 100 + "%";
}

function renderQuestion() {
  const q = quizRound[quizPos];
  renderQuizMeta();
  $("quizQ").textContent = q.mode === "type" ? "К какому виду относится?" : "Что делает это слово?";
  $("quizWord").textContent = q.it.n.ar;
  $("quizOpts").className = "quiz-opts " + q.mode;
  $("quizOpts").innerHTML = q.opts
    .map((o, i) => `<button class="quiz-opt" type="button" data-o="${i}"${q.mode === "type" ? ' lang="ar" dir="rtl"' : ""}>${esc(o)}</button>`)
    .join("");
  $("quizFb").hidden = true;
  $("quizNext").hidden = true;
  $("quizBody").scrollTop = 0;
}

function answerQuiz(i) {
  const q = quizRound[quizPos];
  if (q.answered) return;
  q.answered = true;
  const ok = q.rightLabels.has(q.opts[i]);
  if (ok) quizRight++;
  quizStore[q.it.key] = ok ? (quizStore[q.it.key] || 0) + 1 : 0;
  store.set(QUIZ_KEY, quizStore);
  document.querySelectorAll("#quizOpts .quiz-opt").forEach((b, k) => {
    b.disabled = true;
    if (q.rightLabels.has(q.opts[k])) b.classList.add("right");
    else if (k === i) b.classList.add("wrong");
  });
  const t = q.it.type;
  $("quizVerdict").textContent = ok ? "Верно" : "Неверно";
  $("quizVerdict").className = "quiz-verdict " + (ok ? "ok" : "bad");
  $("quizAnswer").innerHTML = `<span lang="ar" dir="rtl">${esc(t.ar)}</span> — ${esc(t.act)}`;
  $("quizBookAr").textContent = q.it.n.qawl || "";
  $("quizBookRu").textContent = q.it.n.qawlRu || "";
  $("quizBook").hidden = !q.it.n.qawl;
  $("quizFb").hidden = false;
  $("quizNext").hidden = false;
  $("quizNext").textContent = quizPos + 1 < quizRound.length ? "Дальше" : "Итог";
  renderQuizMeta();
  requestAnimationFrame(() => $("quizFb").scrollIntoView({ behavior: "smooth", block: "nearest" }));
}

function nextQuiz() {
  quizPos++;
  if (quizPos < quizRound.length) return renderQuestion();
  renderQuizMeta();
  $("quizBar").style.width = "100%";
  $("quizStep").textContent = "Готово";
  $("quizBody").hidden = true;
  $("quizNext").hidden = true;
  $("quizDone").hidden = false;
  $("quizDoneTitle").textContent = `${quizRight} из ${quizRound.length}`;
  $("quizDoneText").textContent =
    quizRight === quizRound.length ? "Все ответы верные. Слово считается выученным после двух верных ответов подряд." : "Слова с ошибками попадут в следующий круг первыми.";
}

async function showQuiz() {
  setView("quiz");
  document.title = "Тренажёр — Arabic";
  try {
    collectQuiz((await loadTreeBook("#amil")).tree);
    startQuiz();
  } catch (err) {
    alert(err.message);
    location.hash = "#amil";
  }
}

$("quizOpts").addEventListener("click", (e) => {
  const b = e.target.closest(".quiz-opt");
  if (b) answerQuiz(Number(b.dataset.o));
});
$("quizNext").onclick = nextQuiz;
$("quizAgain").onclick = startQuiz;

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
