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
  document.body.classList.remove("view-home", "view-welcome", "view-nahw");
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
  if (location.hash === "#nahw") return showNahw();
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
let nahwData = null;
let nahwNodes = []; // все узлы по порядку обхода; индекс — data-i у плашки

// Схема сверху вниз: плашка термина, под ней ветви в ряд (справа налево)
const CHEVRON = `<svg width="12" height="8" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function renderNode(n, depth) {
  const i = nahwNodes.push(n) - 1;
  const kids = n.children || [];
  const open = depth < 0;
  const count = kids.length ? `<span class="tr-count">${kids.length} ${plural(kids.length, "тема", "темы", "тем")}</span>` : "";
  const toggle = kids.length
    ? `<button class="tr-toggle" type="button" data-i="${i}" aria-expanded="${open}" aria-label="Ветви: ${kids.length}">${CHEVRON}</button>`
    : "";
  const sub = kids.length ? `<ul class="tr-kids">${kids.map((c) => renderNode(c, depth + 1)).join("")}</ul>` : "";
  const cls = depth < 0 ? "root" : "d" + Math.min(depth, 2);
  return `<li class="tr-item ${cls}${open ? " open" : ""}" id="tr-${i}"><div class="tr-node"><button class="tr-box" type="button" data-i="${i}"><span class="tr-ar" lang="ar" dir="rtl">${esc(n.ar)}</span><span class="tr-ru">${esc(n.ru)}</span>${count}</button>${toggle}</div>${sub}</li>`;
}

function setBranch(li, open) {
  li.classList.toggle("open", open);
  li.querySelector(":scope > .tr-node > .tr-toggle")?.setAttribute("aria-expanded", open);
}

// Раскрытую ветвь подвинуть в центр экрана
function revealBranch(li) {
  const kids = li.querySelector(":scope > .tr-kids");
  if (kids) requestAnimationFrame(() => kids.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }));
}

function centerTree() {
  const t = $("nahwTree");
  t.scrollLeft = (t.scrollWidth - t.clientWidth) / 2;
  t.scrollTop = 0;
}

async function showNahw() {
  setView("nahw");
  document.title = "Глава об имени — Arabic";
  if (nahwData) return;
  try {
    const res = await fetch("nahw_ism.json");
    if (!res.ok) throw new Error("Файл nahw_ism.json не найден");
    nahwData = await res.json();
    const root = nahwData.tree;
    $("nahwTitle").textContent = root.ar;
    $("nahwSub").textContent = `${root.ru} · Шарх аль-Унмузадж`;
    nahwNodes = [];
    $("nahwTree").innerHTML = `<ul class="tr-root">${renderNode(root, -1)}</ul>`;
    requestAnimationFrame(centerTree);
  } catch (err) {
    alert(err.message);
    location.hash = "";
  }
}

$("nahwTree").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-i]");
  if (!btn) return;
  if (btn.classList.contains("tr-toggle")) {
    const li = btn.closest(".tr-item");
    const open = !li.classList.contains("open");
    setBranch(li, open);
    if (open) revealBranch(li);
  } else openQawl(Number(btn.dataset.i));
});

const setAllNodes = (open) =>
  document.querySelectorAll("#nahwTree .tr-item").forEach((li, k) => {
    if (li.querySelector(".tr-kids")) setBranch(li, open || k === 0);
  });
$("nahwTitle").onclick = () => openQawl(0);
$("nahwExpand").onclick = () => setAllNodes(true);
$("nahwCollapse").onclick = () => {
  setAllNodes(false);
  centerTree();
};

// Мышью схему можно двигать перетаскиванием (на телефоне — обычная прокрутка)
{
  const t = $("nahwTree");
  let drag = null;
  t.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, left: t.scrollLeft, top: t.scrollTop, moved: false };
  });
  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    t.scrollLeft = drag.left - dx;
    t.scrollTop = drag.top - dy;
  });
  window.addEventListener("pointerup", () => {
    if (drag?.moved) t.addEventListener("click", (e) => e.stopPropagation(), { capture: true, once: true });
    drag = null;
  });
}

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
  fill("qawlExBlock", "qawlEx", n.ex);
  $("qawlPage").textContent = n.p ? `Шарх аль-Унмузадж, стр. ${n.p}` : "";
  const kids = (n.children || []).length;
  const li = $("tr-" + i);
  $("qawlBranch").hidden = !kids || li.classList.contains("open");
  $("qawlBranch").textContent = `Показать ветви · ${kids}`;
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
  const li = $("tr-" + qawlIndex);
  closeQawl();
  setBranch(li, true);
  revealBranch(li);
};

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
