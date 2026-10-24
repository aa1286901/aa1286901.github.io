// Книга «Мабда аль-Кираа»: три части; урок — data/lessons/part<часть>/lesson_<номер>.json
const PARTS = [
  {
    id: 1,
    ar: "الْجُزْءُ الْأَوَّلُ",
    ru: "Часть первая",
    lessons: [
      ["اَلدَّرْسُ الْأَوَّلُ", "Книга, перо и доска"],
      ["اَلدَّرْسُ الثَّانِي", "В классе"],
      ["اَلدَّرْسُ الثَّالِثُ", "Портфель, пенал и комната"],
      ["اَلدَّرْسُ الرَّابِعُ", "Чай и еда"],
      ["اَلدَّرْسُ الْخَامِسُ", "Шкаф, кровать и хлеб"],
      ["اَلدَّرْسُ السَّادِسُ", "Животные во дворе"],
      ["اَلدَّرْسُ السَّابِعُ", "Нож, мяч и молоко"],
      ["اَلدَّرْسُ الثَّامِنُ", "Семья"],
      ["اَلدَّرْسُ التَّاسِعُ", "Лес, сад и животные"],
      ["اَلدَّرْسُ الْعَاشِرُ", "Посуда за столом"],
      ["اَلدَّرْسُ الْحَادِيَ عَشَرَ", "Богатый и бедный"],
      ["اَلدَّرْسُ الثَّانِيَ عَشَرَ", "Множественное число"],
      ["اَلدَّرْسُ الثَّالِثَ عَشَرَ", "Семья и школы"],
      ["اَلدَّرْسُ الرَّابِعَ عَشَرَ", "Учёба и ходьба"],
      ["اَلدَّرْسُ الْخَامِسَ عَشَرَ", "Покупки и рынок"],
      ["اَلدَّرْسُ السَّادِسُ عَشَرَ", "Повар, кухня и рынок"],
      ["اَلدَّرْسُ السَّابِعُ عَشَرَ", "Инструменты и качества"],
      ["اَلدَّرْسُ الثَّامِنُ عَشَرَ", "Замок, сундук и ключ"],
      ["اَلدَّرْسُ التَّاسِعُ عَشَرَ", "Улица, рано и поздно"],
      ["اَلدَّرْسُ الْعِشْرُونَ", "Фрукты и бахча"],
      ["اَلدَّرْسُ الْحَادِي وَالْعِشْرُونَ", "Числа и деньги"],
      ["اَلدَّرْسُ الثَّانِي وَالْعِشْرُونَ", "Десятки и покупки"],
      ["اَلدَّرْسُ الثَّالِثُ وَالْعِشْرُونَ", "Время, дни и месяцы"],
      ["اَلدَّرْسُ الرَّابِعُ وَالْعِشْرُونَ", "Омовение и намаз"],
      ["اَلدَّرْسُ الْخَامِسُ وَالْعِشْرُونَ", "Человек и части тела"],
      ["اَلدَّرْسُ السَّادِسُ وَالْعِشْرُونَ", "Лицо, руки и цвета"],
      ["اَلدَّرْسُ السَّابِعُ وَالْعِشْرُونَ", "Руки, ноги и борода"],
      ["اَلدَّرْسُ الثَّامِنُ وَالْعِشْرُونَ", "Поезд и время"],
      ["اَلدَّرْسُ التَّاسِعُ وَالْعِشْرُونَ", "Щедрый и скупой"],
      ["اَلدَّرْسُ الثَّلَاثُونَ", "Мужчины и женщины"],
      ["اَلدَّرْسُ الْحَادِي وَالثَّلَاثُونَ", "Учёные и невежды"],
      ["اَلدَّرْسُ الثَّانِي وَالثَّلَاثُونَ", "Мама и дочь"],
      ["اَلدَّرْسُ الثَّالِثُ وَالثَّلَاثُونَ", "Чистота и одежда"],
      ["اَلدَّرْسُ الرَّابِعُ وَالثَّلَاثُونَ", "Сад, дом и младенец"],
      ["اَلدَّرْسُ الْخَامِسُ وَالثَّلَاثُونَ", "Металлы и инструменты"],
      ["اَلدَّرْسُ السَّادِسُ وَالثَّلَاثُونَ", "Одежда и покупки"],
      ["اَلدَّرْسُ السَّابِعُ وَالثَّلَاثُونَ", "Головные уборы и обувь"],
      ["اَلدَّرْسُ الثَّامِنُ وَالثَّلَاثُونَ", "Деньги, лавка и тёплая одежда"],
      ["اَلدَّرْسُ التَّاسِعُ وَالثَّلَاثُونَ", "Звонок, часы и путешествие"],
      ["اَلدَّرْسُ الْأَرْبَعُونَ", "Небо, земля и погода"],
      ["اَلدَّرْسُ الْحَادِي وَالْأَرْبَعُونَ", "Весы, рынок и долг"],
      ["اَلدَّرْسُ الثَّانِي وَالْأَرْبَعُونَ", "Родственники и имена"],
      ["اَلدَّرْسُ الثَّالِثُ وَالْأَرْبَعُونَ", "Болезнь и лечение"],
      ["اَلدَّرْسُ الرَّابِعُ وَالْأَرْبَعُونَ", "Друзья и враги"],
      ["اَلدَّرْسُ الْخَامِسُ وَالْأَرْبَعُونَ", "Украшения и металлы"],
      ["اَلدَّرْسُ السَّادِسُ وَالْأَرْبَعُونَ", "Портной и ремёсла"],
      ["اَلدَّرْسُ السَّابِعُ وَالْأَرْبَعُونَ", "Крестьянский труд"],
      ["اَلدَّرْسُ الثَّامِنُ وَالْأَرْبَعُونَ", "Тот, который…"],
      ["اَلدَّرْسُ التَّاسِعُ وَالْأَرْبَعُونَ", "Домашние и дикие животные"],
      ["اَلدَّرْسُ الْخَمْسُونَ", "Фрукты и овощи"],
      ["اَلدَّرْسُ الْحَادِي وَالْخَمْسُونَ", "Внук и бабушка"],
      ["اَلدَّرْسُ الثَّانِي وَالْخَمْسُونَ", "Собака и её тень"],
    ],
    exercises: ["تَمْرِينَاتٌ", "Упражнения"],
  },
  {
    id: 2,
    ar: "الْجُزْءُ الثَّانِي",
    ru: "Часть вторая",
    lessons: [
      ["فَرِيدٌ", "Фарид"],
      ["فِي الْكُتَّابِ", "В начальной школе"],
      ["كَلْبُ فَرِيدٍ", "Собака Фарида"],
      ["اَلْكُتَّابُ", "Начальная школа"],
      ["مَنْفَعَةُ الْقِرَاءَةِ", "Польза чтения"],
      ["اَلدُّبُّ", "Медведь"],
      ["اَلْوَلَدُ وَالصَّدَى", "Мальчик и эхо"],
      ["اَلصَّيَّادُ وَالدُّبُّ", "Охотник и медведь"],
      ["أَسَدٌ وَثَعْلَبٌ", "Лев и лиса"],
      ["أَعْضَاءُ الْإِنْسَانِ", "Органы человека"],
      ["أَعْضَاءُ الْإِنْسَانِ", "Органы человека"],
      ["اَلثَّعْلَبُ وَالْعُنْقُودُ", "Лиса и гроздь"],
      ["عُصْفُورُ مَرْيَمَ", "Птичка Марьяма"],
      ["سُلَحْفَاةٌ وَأَرْنَبٌ", "Черепаха и заяц"],
      ["حَسَنْ أَفَنْدِي وَابْنُهُ مُحَمَّدْ", "Хасан Афанди и его сын Мухаммад"],
      ["اَلصَّبِيُّ الَّذِي يُحِبُّ اللَّعِبَ", "Мальчик, который любит играть"],
      ["تَوْفِيقٌ ذَاهِبٌ إِلَى الْمَدْرَسَةِ", "Тавфик отправляется в школу"],
      ["اَلذِّئْبُ وَالْخَرُوفُ الصَّغِيرُ", "Волк и ягнёнок"],
      ["اَلْكَلْبُ", "Собака"],
      ["اَللَّعِبُ", "Игра"],
      ["اَلْقِرْدُ وَالنَّجَّارُ", "Обезьяна и плотник"],
      ["بِلَا أَبٍ", "Без отца (сирота)"],
      ["طَيَاشَةُ سَلِيمٍ", "Безрассудность Салима"],
      ["مَنْ ظَلَمَ غَيْرَهُ ظُلِمَ", "Кто притеснит кого-либо, сам будет притеснён"],
      ["اَلْغُرَابُ وَالثَّعْلَبُ", "Ворона и лиса"],
      ["اَلْعَالِمُ وَابْنَتُهُ", "Учёный и его дочь"],
      ["اَلشِّبْلُ وَالْفَارُ", "Львёнок и мышь"],
      ["اَلتِّلْغِرَافُ", "Телеграмма"],
      ["اَلصُّرْصُورُ وَالنَّمْلَةُ", "Стрекоза и муравей"],
      ["اَلنَّاسِكُ وَالْمَكَرَةُ", "Отшельник и обманщики"],
      ["اَلْكُرَةُ", "Мяч"],
      ["لَا تُزْعِجْ بِضَجِيجِكَ مَرِيضًا عَلَى فِرَاشِهِ", "Не беспокой шумом больного"],
      ["اَلصَّيَّادُ وَالسَّمَكَةُ", "Рыбак и рыба"],
      ["اَلْوَزُّ وَالْكُرْكِيُّ", "Гусь и журавль"],
      ["اَلذُّبَابَةُ", "Муха"],
      ["اَلْحِمَارُ وَالثَّوْرُ", "Осёл и бык"],
      ["اَلْعَنْزَةُ وَالذِّئْبُ", "Волк и коза"],
      ["اَلدُّرُوسُ", "Уроки"],
      ["اِصْطَدْتُ دُبًّا", "Я убил медведя"],
      ["اَلْكَلْبَةُ وَاللَّبُؤَةُ", "Сука и львица"],
      ["اَلْيَرَاعَةُ وَالْقِرَدَةُ وَالطَّائِرُ", "Светлячок, обезьяны и птица"],
      ["اَلْفَأْرُ", "Мышь"],
      ["اَلذُّبَابَةُ وَالثَّوْرُ", "Муха и бык"],
      ["اَلثَّعْلَبُ", "Лиса"],
      ["اَلْأَسَدُ وَالْمُسَافِرُ", "Лев и путешественник"],
      ["اَلنَّاسِكُ", "Аскет"],
      ["اَلثَّعْلَبُ وَمَكْرُهُ", "Лиса и его хитрость"],
      ["مُصَاحَبَةُ الْأَشْرَارِ", "Дружба со зловредными (плохими)"],
      ["مَنْ عَلَّمَ؟", "Кто обучил?"],
      ["اَلْعَنْزَةُ وَالدُّبُّ", "Коза и медведь"],
      ["اَللِّصَّانِ وَالْحِمَارِ", "Осёл и два вора"],
      ["اَلذِّئْبُ", "Волк"],
      ["اَلْحَمَامَةُ وَالثَّعْلَبُ وَمَالِكُ الْحَزِينِ", "Голубь, лиса и цапля"],
      ["اَلْغُرَابُ", "Ворона"],
      ["رَجَعْتُ بِخُفَّيْ حُنَيْنٍ", "Я вернул туфли Хунейна"],
      ["اَلْبَبْغَاءُ", "Попугай"],
      ["اَلسُّلَحْفَاةُ وَالْبَطَّتَانِ", "Черепаха и две утки"],
      ["اَلْحُوتُ", "Кит"],
      ["اَلْعُلْجُومُ وَالسَّرَطَانُ", "Жаба и рак"],
      ["أَيُّ الثَّلَاثَةِ أَشَدُّ حُمْقًا؟", "Какой из трёх глупее?"],
    ],
  },
  {
    id: 3,
    ar: "الْجُزْءُ الثَّالِثُ",
    ru: "Часть третья",
    lessons: [
      ["عِنْدَ الْمُعَلِّمِ الْمَرِيضِ", "Возле больного учителя"],
      ["عِنْدَ الْمُعَلِّمِ الْمَرِيضِ", "Возле больного учителя"],
      ["عَاقِبَةُ الْحِرْصِ", "Последствие алчности"],
      ["الرَّجُلُ وَأَوْلَادُهُ", "Мужчина и его дети"],
      ["الْمَطَرُ", "Дождь"],
      ["الْحَمَامَةُ وَالنَّمْلَةُ", "Голубь и муравей"],
      ["الْأَسَدُ", "Лев"],
      ["الْأَسَدُ وَالْأَرْنَبُ وَالْوُحُوشُ", "Лев, заяц и дикие животные"],
      ["حُقُوقُ الْوَالِدَيْنِ", "Долг перед родителями"],
      ["اَلْخُطَّافُ", "Ласточка"],
      ["عُمَرُ بْنُ الْخَطَّابِ وَالْعَجُوزُ", "Ночной обход Умара"],
      ["عُمَرُ بْنُ الْخَطَّابِ وَالْعَجُوزُ", "Умар кормит сирот"],
      ["اَلنَّعَامَةُ", "Страус"],
      ["اَلطَّبِيبُ وَالصَّبِيُّ الْمَرِيضُ", "Врач и больной мальчик"],
      ["كِسْرَى وَالْفَلَّاحُ", "Хосров и крестьянин"],
      ["جَائِزَةُ الْكَسَلِ", "Приз за лень"],
      ["الْفِيلُ", "Слон"],
      ["عَلِيُّ بْنُ أَبِي طَالِبٍ وَالسَّارِقُ", "Али и вор"],
      ["اَلثَّعَالِبُ وَالذِّئْبُ", "Лисы и волк-судья"],
      ["لَطَائِفُ", "Забавные истории"],
    ],
  },
];
// Урок задаётся ключом «часть-номер», например "2-4"
// Упражнения в конце части — без номера, ключ «часть-ex»
const LESSONS = PARTS.flatMap((p) => [
  ...p.lessons.map(([title, ruTitle], i) => ({ key: `${p.id}-${i + 1}`, part: p.id, n: i + 1, title, ruTitle })),
  ...(p.exercises ? [{ key: `${p.id}-ex`, part: p.id, n: null, title: p.exercises[0], ruTitle: p.exercises[1] }] : []),
]);


// Шаги размера текста рассказа
const STORY_SIZES = [19, 21, 23, 26, 29, 32];
const SIZE_LABELS = ["Очень мелкий", "Мелкий", "Обычный", "Крупный", "Очень крупный", "Максимальный"];
const SIZE_KEY = "arabic.storySize";
const PROGRESS_KEY = "arabic.progress";
const FILTER_KEY = "arabic.filter";
const HARAKAT_KEY = "arabic.harakat";
const THEME_KEY = "arabic.theme";
const TILT_KEY = "arabic.tilt"; // наклон книг от датчика движения (по умолчанию выключен)
let tiltSensor = () => {};
let sayBtn = null; // кнопка, чей текст сейчас звучит
let sayId = 0; // номер последнего чтения: конец старого чтения не учитываем
const LAST_KEY = "arabic.lastLesson";
const PLACE_KEY = "arabic.place"; // где остановились: урок, карточка, ветки дерева, прокрутка

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
let ends = []; // знак в конце каждой строки рассказа; по умолчанию точка
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

// ── Место в книге ───────────────────────────────────────
let place = store.get(PLACE_KEY, {});
if (typeof place !== "object" || place === null) place = {};
const savePlace = () => store.set(PLACE_KEY, place);
const lessonPlace = (id = lessonId) => (place["lesson-" + id] ||= {});
// Книга открывается там, где её оставили: «Мабда» — на последнем уроке, если из него не выходили,
// иначе на последней открытой части
function bookHref(i) {
  if (BOOKS[i].href !== "#mabda") return BOOKS[i].href;
  if (plan.mabda) return "#lesson-" + plan.mabda.key;
  if (place.mabda) return "#lesson-" + place.mabda;
  return place.mabdaPart ? "#mabda-" + place.mabdaPart : "#mabda";
}
const lineText = (line) => (line || []).map((t) => t.arabic).join(" ");

const lessonFile = (key) => {
  const [p, n] = key.split("-");
  return n === "ex" ? `data/lessons/part${p}/exercises.json` : `data/lessons/part${p}/lesson_${n}.json`;
};

function loadLesson(id) {
  if (!lessonData.has(id)) {
    const p = fetch(lessonFile(id)).then((res) => {
      if (!res.ok) throw new Error(`Файл ${lessonFile(id)} не найден`);
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
// Раньше в книге была только третья часть, и уроки звались просто номером
for (const k of Object.keys(progress))
  if (/^\d+$/.test(k)) {
    progress["3-" + k] ??= progress[k];
    delete progress[k];
  }
for (const k of Object.keys(place)) {
  const m = k.match(/^lesson-(\d+)$/);
  if (m) {
    place["lesson-3-" + m[1]] ??= place[k];
    delete place[k];
  }
}
if (typeof place.mabda === "number") place.mabda = "3-" + place.mabda;
store.set(PROGRESS_KEY, progress);
savePlace();

const boxOf = (w, id = lessonId) => progress[id]?.[w.arabic] ?? 0;
const isLearned = (w, id = lessonId) => boxOf(w, id) >= LEARNED;
function setBox(w, box) {
  (progress[lessonId] ??= {})[w.arabic] = box;
  store.set(PROGRESS_KEY, progress);
}

// ── «Мабда»: список частей, а в части — список уроков ──
const PENCIL = `<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHEVRON_RIGHT = `<svg class="chevron" width="8" height="14" viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
let listPart = null; // открытая часть; null — список частей

function renderLessonList() {
  const items = listPart
    ? LESSONS.filter((l) => l.part === listPart).map(
        (l) =>
          `<button class="lesson-item" type="button" data-lesson="${l.key}"><span class="lesson-num">${l.n ?? PENCIL}</span><span class="lesson-info"><span class="lesson-ru">${esc(l.ruTitle)}</span><span class="lesson-sub"><span class="lesson-count" id="count-${l.key}"></span><span class="lesson-ar" lang="ar" dir="rtl">${esc(l.title)}</span></span></span>${CHEVRON_RIGHT}</button>`,
      )
    : PARTS.map(
        (p) =>
          `<button class="lesson-item" type="button" data-part="${p.id}"><span class="lesson-num">${p.id}</span><span class="lesson-info"><span class="lesson-ru">${esc(p.ru)}</span><span class="lesson-sub"><span class="lesson-count" id="count-part-${p.id}">${p.lessons.length} ${plural(p.lessons.length, "урок", "урока", "уроков")}</span><span class="lesson-ar" lang="ar" dir="rtl">${esc(p.ar)}</span></span></span>${CHEVRON_RIGHT}</button>`,
      );
  $("lessonList").innerHTML = items.join("");
  renderCounts();
}

$("lessonList").addEventListener("click", (e) => {
  const b = e.target.closest(".lesson-item");
  if (!b) return;
  location.hash = b.dataset.part ? "#mabda-" + b.dataset.part : "#lesson-" + b.dataset.lesson;
});

// Число слов и выученных подгружается в фоне; ошибка просто оставляет строку пустой
function renderCounts() {
  const count = (l) =>
    loadLesson(l.key)
      .then((data) => ({ n: data.words.length, lines: data.story.length, learned: data.words.filter((w) => isLearned(w, l.key)).length }))
      .catch(() => ({ n: 0, learned: 0 }));
  if (!listPart) {
    // у части: сколько уроков и сколько слов уже выучено
    return Promise.all(
      PARTS.map((p) =>
        Promise.all(LESSONS.filter((l) => l.part === p.id).map(count)).then((all) => {
          const learned = all.reduce((a, c) => a + c.learned, 0);
          const el = $("count-part-" + p.id);
          if (el) el.textContent = `${p.lessons.length} ${plural(p.lessons.length, "урок", "урока", "уроков")}` + (learned ? ` · ${learned} выучено` : "");
        }),
      ),
    );
  }
  return Promise.all(
    LESSONS.filter((l) => l.part === listPart).map((l) =>
      count(l).then(({ n, lines, learned }) => {
        const el = $("count-" + l.key);
        // упражнения — без карточек, считаем предложения
        if (el && !n && lines) el.textContent = `${lines} ${plural(lines, "предложение", "предложения", "предложений")}`;
        if (el && n) el.textContent = `${n} ${plural(n, "слово", "слова", "слов")}` + (learned ? ` · ${learned} выучено` : "");
      }),
    ),
  );
}

// ── Hash-роутер: / книги, #mabda уроки, #lesson-N, #nahw ─
function parseHash() {
  const m = location.hash.match(/^#lesson-(\d+-(?:\d+|ex))$/);
  return m ? m[1] : null;
}

// view: home | welcome | nahw | lesson (у урока своего класса нет)
let currentView = "home";
let prevView = null;

function setView(view) {
  closeSheet();
  closeSettings();
  closeQawl();
  closeReader();
  hideNetError();
  toggleSizer(false);
  stopSpeech();
  closeRetell();
  closeToday();
  document.body.classList.remove("view-main", "view-home", "view-welcome", "view-nahw", "view-quiz", "view-today", "view-train", "view-settings");
  if (view !== "lesson") document.body.classList.add("view-" + view);
  if (view !== currentView) {
    prevView = currentView;
    currentView = view;
  }
}

// Главный экран: обложки листаются вбок, под активной — описание книги
const BOOKS = [
  {
    href: "#mabda",
    kind: "الْقِرَاءَةُ",
    title: "مَبْدَأُ الْقِرَاءَةِ",
    author: "صِبْغَةُ اللهِ بِيكْبُولَاط",
    desc: "Рассказы с переводом и карточки всех слов: три части книги.",
  },
  {
    href: "#amil",
    kind: "النَّحْوُ",
    title: "مِئَةُ عَامِلٍ فِي النَّحْوِ",
    author: "عَبْدُ الْقَاهِرِ الْجُرْجَانِيُّ",
    desc: "Сто управляющих слов: тринадцать видов, значения и примеры из книги, тренажёр.",
  },
  {
    href: "#nahw",
    kind: "النَّحْوُ",
    title: "شَرْحُ الْأُنْمُوذَجِ",
    author: "جَمَالُ الدِّينِ الْأَرْدَبِيلِيُّ",
    desc: "Глава об имени деревом терминов: определения из книги с переводом.",
  },
];
const HOME_BOOK_KEY = "arabic.homeBook";
let homeBook = store.get(HOME_BOOK_KEY, 0);
if (!Number.isInteger(homeBook) || homeBook < 0 || homeBook >= BOOKS.length) homeBook = 0;

function slideStep() {
  const slides = $("carousel").children;
  return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : 1;
}

function setHomeBook(i) {
  if (i === homeBook && $("bpTitle").textContent) return;
  homeBook = i;
  store.set(HOME_BOOK_KEY, i);
  const b = BOOKS[i];
  // Книги слева и справа от центральной разворачиваются к ней, как в Cover Flow
  [...$("carousel").children].forEach((el, k) => {
    el.classList.toggle("active", k === i);
    el.classList.toggle("left", k < i);
    el.classList.toggle("right", k > i);
  });
  [...$("dots").children].forEach((el, k) => el.classList.toggle("on", k === i));
  $("showcase").dataset.book = i;
  const panel = $("bookPanel");
  panel.classList.remove("swap");
  void panel.offsetWidth; // перезапуск анимации смены книги
  panel.classList.add("swap");
  $("bpKind").textContent = b.kind;
  $("bpTitle").textContent = b.title;
  $("bpAuthor").textContent = b.author;
  $("bpDesc").textContent = b.desc;
  $("bpOpen").href = b.href;
  if (typeof renderBookTask === "function" && $("bpTask")) renderBookTask();
}

function scrollToBook(i, smooth = true) {
  $("carousel").scrollTo({ left: i * slideStep(), behavior: smooth ? "smooth" : "auto" });
}

function showHome() {
  setView("home");
  lastTab = "library";
  document.title = "Arabic";
  const fromBook = ["welcome", "nahw", "quiz"].includes(prevView) && !skipCloseAnim;
  skipCloseAnim = false;
  requestAnimationFrame(() => {
    scrollToBook(homeBook, false);
    setHomeBook(homeBook);
    if (fromBook) requestAnimationFrame(() => closeBookAnimated(homeBook));
  });
}

{
  let raf = 0;
  $("carousel").addEventListener("scroll", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const i = Math.round($("carousel").scrollLeft / slideStep());
      setHomeBook(Math.max(0, Math.min(BOOKS.length - 1, i)));
    });
  }, { passive: true });
  // Нажатие на соседнюю обложку сначала подвигает её в центр
  $("carousel").addEventListener("click", (e) => {
    const slide = e.target.closest(".slide");
    if (!slide) return;
    const i = Number(slide.dataset.i);
    e.preventDefault();
    if (i !== homeBook) scrollToBook(i);
    else openBookAnimated(i);
  });
}

function showWelcome(part = null) {
  setView("welcome");
  // Вышли из урока или части сами — в следующий раз книга откроется здесь
  const p = PARTS.find((x) => x.id === part);
  if (prevView === "lesson") delete place.mabda;
  if (p) place.mabdaPart = part;
  else delete place.mabdaPart;
  savePlace();
  listPart = p ? part : null;
  $("welcomeTitle").textContent = p ? p.ru : "Части книги";
  $("welcomeAr").textContent = p ? p.ar : "الْأَجْزَاءُ";
  $("welcomeBack").setAttribute("href", p ? "#mabda" : tabHref());
  $("welcomeBack").setAttribute("aria-label", p ? "Назад: Части" : "Назад");
  document.title = (p ? p.ru : "Мабда аль-Кираа") + " — Arabic";
  renderLessonList();
}

function showLesson(id) {
  setView("lesson");
  const lesson = LESSONS.find((l) => l.key === id);
  if (lesson) {
    $("lessonNumber").textContent = `Часть ${lesson.part} · ${lesson.n ? "Урок " + lesson.n : "Упражнения"}`;
    $("lessonTitle").textContent = lesson.title;
    $("lessonTitleRu").textContent = lesson.ruTitle || "";
    $("backBtn").setAttribute("href", "#mabda-" + lesson.part);
    document.title = `${lesson.ruTitle} — ${lesson.n ? "Урок " + lesson.n : "Часть " + lesson.part}`;
  }
}

async function openLesson(id) {
  // Пока урок грузится — экран урока с заглушками вместо пустоты
  showLesson(id);
  $("mainContent").classList.add("is-loading");
  try {
    const data = await loadLesson(id);
    if (!Array.isArray(data.words) || !Array.isArray(data.story))
      throw new Error("Неверная структура JSON");
    lessonId = id;
    store.set(LAST_KEY, id);
    words = data.words;
    story = data.story;
    sentences = Array.isArray(data.sentences) ? data.sentences : [];
    ends = Array.isArray(data.ends) ? data.ends : [];
    dict = new Map(words.map((w) => [w.arabic, w]));
    // Где остановились в этом уроке: вкладка, карточка, прокрутка рассказа
    const saved = { ...lessonPlace(id) };
    place.mabda = id;
    buildDeck();
    const at = deck.findIndex((i) => words[i].arabic === saved.word);
    if (at > 0) showWord(at);
    renderStory();
    // Без карточек (упражнения) — сразу текст, вкладки не нужны
    $("modeTabs").hidden = !words.length;
    setMode(saved.mode === "story" || !words.length ? "story" : "words");
    showLesson(id);
    savePlace();
    $("mainContent").classList.remove("is-loading");
    // прокрутку ставим, когда текст уже на экране
    $("storyScreen").querySelector(".story-card").scrollTop = saved.scroll || 0;
    runPendingAction();
  } catch (err) {
    showNetError(() => openLesson(id), "#mabda-" + id.split("-")[0]);
  } finally {
    $("mainContent").classList.remove("is-loading");
  }
}

let routedOnce = false;
async function route() {
  routedOnce = true;
  // «Сегодня» — панель поверх «Главной»
  if (location.hash === "#today") {
    history.replaceState(null, "", location.pathname + location.search);
    showMain();
    return openToday();
  }
  if (location.hash === "#library") return showHome();
  if (location.hash === "#settings") return showSettingsTab();
  if (location.hash === "#unm-train") return showTrain();
  if (location.hash === "#amil-quiz") return showQuiz();
  if (TREE_BOOKS[location.hash]) return showNahw(location.hash);
  if (location.hash === "#mabda") return showWelcome();
  const part = location.hash.match(/^#mabda-(\d+)$/);
  if (part) return showWelcome(Number(part[1]));
  // старые ссылки «#lesson-5» вели в третью часть
  const legacy = location.hash.match(/^#lesson-(\d+)$/);
  if (legacy) return location.replace("#lesson-3-" + legacy[1]);
  const id = parseHash();
  if (id === null) {
    showMain();
  } else {
    const lessonExists = LESSONS.some((lesson) => lesson.key === id);
    if (lessonExists) await openLesson(id);
    else {
      showNetError(null, "#mabda", "Урок не найден", "Такого урока в книге пока нет.");
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
  stopSpeech();
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
  if (lessonId) {
    lessonPlace().word = w.arabic;
    savePlace();
  }
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
  logActivity();
  if (words.every((x) => isLearned(x))) markStep("words");
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

// Смахивание карточки, как в Tinder: вправо — «Знаю», влево — «Не знаю»
{
  const card = $("wordCard");
  const yes = card.querySelector(".stamp.yes");
  const no = card.querySelector(".stamp.no");
  let drag = null;
  let suppressClick = false;
  const setDrag = (dx) => {
    card.style.transform = `translateX(${dx}px) rotate(${dx / 22}deg)`;
    yes.style.opacity = Math.max(0, Math.min(1, dx / 90));
    no.style.opacity = Math.max(0, Math.min(1, -dx / 90));
  };
  const reset = () => {
    card.style.transform = "";
    yes.style.opacity = no.style.opacity = 0;
  };
  card.addEventListener("pointerdown", (e) => {
    if (!deck.length || e.button > 0 || e.target.closest(".grade-nav, .card-nav, .empty-state, .chips")) return;
    drag = { x: e.clientX, y: e.clientY, dx: 0, on: false, id: e.pointerId };
  });
  card.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.on) {
      if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) return (drag = null);
      if (Math.abs(dx) < 10) return;
      drag.on = true;
      card.classList.add("dragging");
      card.setPointerCapture(e.pointerId);
    }
    drag.dx = dx;
    setDrag(dx);
  });
  const end = () => {
    if (!drag) return;
    const { dx, on } = drag;
    drag = null;
    card.classList.remove("dragging");
    if (!on) return;
    suppressClick = true;
    setTimeout(() => (suppressClick = false), 50);
    const limit = Math.min(110, card.offsetWidth * 0.28);
    if (Math.abs(dx) < limit) {
      // не дотянули — карточка возвращается на место
      card.animate([{ transform: card.style.transform }, { transform: "none" }], { duration: 250, easing: "cubic-bezier(.2,.8,.2,1)" });
      return reset();
    }
    const dir = Math.sign(dx);
    const fly = card.animate(
      [{ transform: card.style.transform }, { transform: `translateX(${dir * innerWidth}px) rotate(${dir * 24}deg)` }],
      { duration: 240, easing: "ease-in", fill: "forwards" },
    );
    fly.finished.then(() => {
      fly.cancel();
      reset();
      grade(dir > 0);
      card.classList.remove("card-in");
      void card.offsetWidth;
      card.classList.add("card-in");
    });
  };
  card.addEventListener("pointerup", end);
  card.addEventListener("pointercancel", () => {
    if (drag?.on) reset();
    drag = null;
    card.classList.remove("dragging");
  });
  // После перетаскивания не открываем перевод случайным касанием
  card.addEventListener("click", (e) => suppressClick && e.stopPropagation(), true);
}

// Прокрутка рассказа и дерева запоминается, когда палец отпустил
{
  let t = 0;
  const remember = (fn) => () => {
    clearTimeout(t);
    t = setTimeout(fn, 300);
  };
  $("storyScreen").querySelector(".story-card").addEventListener(
    "scroll",
    remember(() => {
      if (!lessonId || currentView !== "lesson") return;
      lessonPlace().scroll = Math.round($("storyScreen").querySelector(".story-card").scrollTop);
      savePlace();
    }),
    { passive: true },
  );
  $("nahwScroll").addEventListener(
    "scroll",
    remember(() => {
      if (!nahwHash || currentView !== "nahw") return;
      treePlace().scroll = Math.round($("nahwScroll").scrollTop);
      savePlace();
    }),
    { passive: true },
  );
}

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
  if (lessonId) {
    lessonPlace().mode = mode;
    savePlace();
  }
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
          .join(" ")}${esc(ends[li] ?? ".")}</span>`,
    )
    .join(" ");
}

function closeSheet() {
  if ($("wordSheet").classList.contains("show")) stopSpeech();
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
  // у пропуска в упражнении произносить нечего
  document.querySelector('#wordSheet .sheet-head .say').hidden = el.dataset.type === "пропуск";
  // Словарная форма и значения из карточек урока
  const entry = dict.get(el.dataset.lemma);
  $("popupDictBlock").hidden = !entry;
  if (entry) {
    $("popupDictWord").textContent = entry.arabic;
    $("popupDictText").textContent = entry.translation;
  }
  // Перевод всего предложения — по кнопке
  $("saySentence").dataset.say = lineText(story[Number(line.dataset.line)]);
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
// Переключатель есть в меню «Aa» урока и в настройках — держим их в одном состоянии
function applyHarakat() {
  ["harakatSwitch", "setHarakat"].forEach((id) => $(id).setAttribute("aria-checked", String(showHarakat)));
  $("setPreview").textContent = showHarakat ? "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ" : stripHarakat("بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ");
}
function toggleHarakat() {
  showHarakat = !showHarakat;
  store.set(HARAKAT_KEY, showHarakat);
  applyHarakat();
  closeSheet();
  renderStory();
}
$("harakatSwitch").onclick = toggleHarakat;
$("setHarakat").onclick = toggleHarakat;
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
  $("setSizeLabel").textContent = SIZE_LABELS[sizeIndex];
  $("setSizeDown").disabled = $("sizeDown").disabled;
  $("setSizeUp").disabled = $("sizeUp").disabled;
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
$("sizeDown").onclick = $("setSizeDown").onclick = () => {
  sizeIndex = Math.max(0, sizeIndex - 1);
  applySize();
};
$("sizeUp").onclick = $("setSizeUp").onclick = () => {
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
  "#nahw": { file: "data/books/nahw_ism.json", book: "Шарх аль-Унмузадж", eyebrow: "النَّحْوُ", said: "قَالَ:" },
  "#amil": { file: "data/books/mia_amil.json", book: "Сто управляющих слов", eyebrow: "مِئَةُ عَامِلٍ", sub: "", quiz: true },
};
const treeCache = new Map(); // адрес → JSON книги
let nahwBook = null; // текущая книга из TREE_BOOKS
let nahwData = null;
let nahwNodes = []; // все узлы по порядку обхода; индекс — data-i у плашки
let nahwParent = []; // индекс родителя для каждого узла
let nahwPath = [0]; // раскрытые узлы от корня вниз
let nahwHash = null; // адрес открытой книги (#nahw, #amil)
const treePlace = () => (place[nahwHash] ||= {});

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
  return `<div class="nb${open ? " open" : ""}${k ? " has-kids" : ""}${isAssigned(i) ? " assigned" : ""} ${cls}"><button class="nb-box" type="button" data-i="${i}"><span class="nb-ar" lang="ar" dir="rtl">${esc(n.ar)}</span>${n.ru ? `<span class="nb-ru">${esc(n.ru)}</span>` : ""}${k ? `<span class="nb-count">${topicCount(n.total ?? k, n.cw)}</span>` : ""}</button>${toggle}</div>`;
}

function renderNahw(scrollTo) {
  if (nahwHash) {
    treePlace().path = nahwPath;
    savePlace();
  }
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
  $("nahwScreen").querySelector(".navbar .back").setAttribute("href", tabHref());
  const book = TREE_BOOKS[hash];
  $("nahwEyebrow").textContent = book.eyebrow;
  $("quizEntry").hidden = !book.quiz;
  if (book.quiz) quizEntryStats(hash);
  if (nahwBook === book) return;
  if (!treeCache.has(hash)) {
    $("nahwTitle").textContent = "";
    $("nahwSub").textContent = "";
    $("nahwTree").innerHTML = `<div class="skel-grid"><span class="skeleton wide"></span>${'<span class="skeleton"></span>'.repeat(4)}</div>`;
  }
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
    // Раскрытые ветки и прокрутка — как были в прошлый раз
    nahwHash = hash;
    const saved = treePlace();
    const path = Array.isArray(saved.path) ? saved.path : [];
    const valid = path[0] === 0 && path.every((p, k) => !k || nahwParent[p] === path[k - 1]);
    nahwPath = valid ? path : [0];
    renderNahw();
    $("nahwScroll").scrollTop = valid ? saved.scroll || 0 : 0;
  } catch (err) {
    nahwBook = null;
    nahwHash = null;
    showNetError(() => showNahw(hash), "");
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
  $("qawlExRow").hidden = !n.ex;
  if (exs.length) $("qawlExBlock").hidden = false;
  $("qawlExs").innerHTML = exs
    .map((x) => `<li><span class="qawl-ex-ar" lang="ar" dir="rtl">${esc(x.ar)}</span>${x.ru ? `<span class="qawl-ex-ru">${esc(x.ru)}</span>` : ""}<button class="say say-float" type="button" data-say="${esc(x.ar)}" aria-label="Произнести пример">${SAY_ICON}</button></li>`)
    .join("");
  $("qawlSaid").hidden = !nahwBook.said;
  $("qawlSaid").textContent = nahwBook.said || "";
  $("qawlPage").textContent = n.p ? `${nahwBook.book}, стр. ${n.p}` : "";
  const kids = kidsOf(i).length;
  $("qawlBranch").hidden = !kids || nahwPath.includes(i);
  applyAssignBtn(i);
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
  stopSpeech();
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
  stopSpeech();
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
  logActivity();
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
    showNetError(showQuiz, "#amil");
  }
}

$("quizOpts").addEventListener("click", (e) => {
  const b = e.target.closest(".quiz-opt");
  if (b) answerQuiz(Number(b.dataset.o));
});
$("quizNext").onclick = nextQuiz;
$("quizAgain").onclick = startQuiz;

// ── Тема: как в системе, светлая или тёмная ─────────────
let theme = store.get(THEME_KEY, "auto");
if (!["auto", "light", "dark"].includes(theme)) theme = "auto";

function applyTheme() {
  const root = document.documentElement;
  if (theme === "auto") delete root.dataset.theme;
  else root.dataset.theme = theme;
  // Цвет строки состояния: при выбранной теме — её цвет, иначе по системе
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    const dark = theme === "dark" || (theme === "auto" && m.media.includes("dark"));
    m.content = dark ? "#000000" : "#F2F2F7";
  });
  document.querySelectorAll("#setTheme button").forEach((b) => {
    const on = b.dataset.theme === theme;
    b.classList.toggle("on", on);
    b.setAttribute("aria-checked", String(on));
  });
}
// ── Наклон книг от движения телефона ────────────────────
function applyTiltSetting() {
  $("setTilt").setAttribute("aria-checked", String(store.get(TILT_KEY, false) === true));
}
$("setTilt").onclick = () => {
  const on = store.get(TILT_KEY, false) !== true;
  store.set(TILT_KEY, on);
  applyTiltSetting();
  tiltSensor(on, true);
};
applyTiltSetting();

// ── «Анимации всегда» ───────────────────────────────────
function applyMotion() {
  $("setMotion").setAttribute("aria-checked", String(document.documentElement.dataset.motion === "on"));
}
$("setMotion").onclick = () => {
  const on = document.documentElement.dataset.motion !== "on";
  if (on) document.documentElement.dataset.motion = "on";
  else delete document.documentElement.dataset.motion;
  store.set(MOTION_KEY, on);
  applyMotion();
};
applyMotion();

// ── Длительность заставки ───────────────────────────────
const SPLASH_KEY = "arabic.splashSec";
function applySplashSetting() {
  const sec = Number(document.documentElement.dataset.splashSec) || 5;
  document.querySelectorAll("#setSplash button").forEach((b) => {
    const on = Number(b.dataset.sec) === sec;
    b.classList.toggle("on", on);
    b.setAttribute("aria-checked", String(on));
  });
}
$("setSplash").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-sec]");
  if (!b) return;
  const sec = Number(b.dataset.sec);
  store.set(SPLASH_KEY, sec);
  document.documentElement.dataset.splashSec = sec;
  document.documentElement.style.setProperty("--splash-total", sec + "s");
  applySplashSetting();
});
// Посмотреть заставку сразу: страница перезагружается с ?splash
$("setSplashShow").onclick = () => location.replace("./?splash" + location.hash);
applySplashSetting();

$("setTheme").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-theme]");
  if (!b) return;
  theme = b.dataset.theme;
  store.set(THEME_KEY, theme);
  applyTheme();
});
applyTheme();

// ── Произношение: арабский текст читает голос телефона ──
// Голос и скорость речи выбираются в настройках самого iPhone; чуть медленнее обычного — удобнее учить
const SPEECH_RATE = 0.8;
const SAY_ICON =
  '<svg class="ic-play" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.5v5h3.8l4.7 4v-13l-4.7 4H3.5z" fill="currentColor"/><path d="M15.5 8.8a4.5 4.5 0 0 1 0 6.4M18.3 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
  '<svg class="ic-stop" width="13" height="13" viewBox="0 0 12 12" aria-hidden="true"><rect x="1" y="1" width="10" height="10" rx="2.5" fill="currentColor"/></svg>';
const tts = "speechSynthesis" in window ? window.speechSynthesis : null;
// Язык речи берём у арабского голоса телефона (на iPhone — «ar-001»), сам голос не задаём:
// iPhone читает тем, что отмечен в его настройках
let speechLang = "ar-001";
function loadVoices() {
  const v = tts?.getVoices().find((x) => /^ar([-_]|$)/i.test(x.lang));
  if (v) speechLang = v.lang;
}

function setSaying(btn) {
  sayBtn?.classList.remove("playing");
  sayBtn = btn;
  btn?.classList.add("playing");
}

function stopSpeech() {
  if (!sayBtn) return;
  sayId++;
  tts?.cancel();
  setSaying(null);
}

// Длинный текст читаем по фразам: так паузы естественнее и iPhone не обрывает чтение
function speak(text, btn, onEnd) {
  if (!tts) return toast("Этот браузер не умеет читать вслух");
  const parts = String(text)
    .replace(/[«»"“”()[\]]/g, " ")
    .split(/(?<=[.!?؟؛:\n])\s*/)
    .map((x) => x.trim())
    .filter(Boolean);
  if (!parts.length) return;
  const id = ++sayId;
  setSaying(btn);
  const go = () => {
    if (id !== sayId) return;
    parts.forEach((part, k) => {
      const u = new SpeechSynthesisUtterance(part);
      u.lang = speechLang;
      u.rate = SPEECH_RATE;
      if (k === parts.length - 1)
        u.onend = () => {
          if (id !== sayId) return;
          setSaying(null);
          onEnd?.();
        };
      u.onerror = (e) => {
        if (id === sayId && e.error !== "interrupted" && e.error !== "canceled") setSaying(null);
      };
      tts.speak(u);
    });
  };
  // iPhone иногда пропускает новую фразу сразу после остановки старой
  if (tts.speaking || tts.pending) {
    tts.cancel();
    setTimeout(go, 80);
  } else go();
}

// Все кнопки «прослушать»: текст из соседнего элемента или из data-say
document.querySelectorAll(".say").forEach((b) => b.insertAdjacentHTML("afterbegin", SAY_ICON));
document.addEventListener(
  "click",
  (e) => {
    const b = e.target.closest(".say");
    if (!b || b.id === "readerPlay") return;
    e.stopPropagation();
    e.preventDefault();
    if (b === sayBtn) return stopSpeech();
    const text = b.dataset.sayFrom ? $(b.dataset.sayFrom)?.textContent : b.dataset.say;
    if (text) speak(text, b);
  },
  true,
);
document.addEventListener("visibilitychange", () => document.hidden && stopSpeech());

// Настройки: только «Прослушать» — голос меняется в настройках iPhone
$("setVoiceTest").onclick = () =>
  sayBtn === $("setVoiceTest") ? stopSpeech() : speak("بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ. السَّلَامُ عَلَيْكُمْ", $("setVoiceTest"));
if (tts) {
  loadVoices();
  tts.addEventListener?.("voiceschanged", loadVoices);
} else $("setVoiceNote").textContent = "Этот браузер не умеет читать вслух.";

// ── Настройки ───────────────────────────────────────────
function renderSettings() {
  const v = document.querySelector('script[src*="app.js"]')?.src.match(/v=(\w+)/);
  $("setVersion").textContent = v ? v[1] : "—";
}

function openSettings() {
  renderSettings();
  $("setLayer").hidden = false;
  requestAnimationFrame(() => $("setLayer").classList.add("show"));
}

// Вкладка «Настройки»: тот же лист, но на весь экран над вкладками
function showSettingsTab() {
  setView("settings");
  document.title = "Настройки";
  renderSettings();
  $("setLayer").classList.add("page", "show");
  $("setLayer").hidden = false;
}

function closeSettings() {
  const layer = $("setLayer");
  if (layer.classList.contains("page")) {
    layer.classList.remove("page", "show");
    layer.hidden = true;
    return;
  }
  if (layer.hidden || !layer.classList.contains("show")) return;
  layer.classList.remove("show");
  setTimeout(() => {
    if (!layer.classList.contains("show")) layer.hidden = true;
  }, 300);
}

document.addEventListener("keydown", (e) => e.key === "Escape" && closeToday());
$("setDone").onclick = closeSettings;
$("setOverlay").onclick = closeSettings;
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("setLayer").classList.contains("page")) closeSettings();
});
$("setResetWords").onclick = () => {
  if (!confirm("Сбросить прогресс всех слов уроков? Отметки «Знаю» будут удалены.")) return;
  progress = {};
  store.set(PROGRESS_KEY, progress);
};
$("setResetQuiz").onclick = () => {
  if (!confirm("Сбросить прогресс тренажёра «Миату Амиль»?")) return;
  quizStore = {};
  store.set(QUIZ_KEY, quizStore);
};

// ── Открытие книги: обложка распахивается, страница заполняет экран ──
// Анимации выключены, если в системе «Уменьшение движения» и не включено «Анимации всегда»
const MOTION_KEY = "arabic.motion";
const motionOff = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches && document.documentElement.dataset.motion !== "on";
let skipCloseAnim = false;
let flying = false;

// Летающая копия обложки поверх экрана, в размере настоящей книги
function makeFly(i) {
  const slide = $("carousel").children[i];
  const front = slide?.querySelector(".front");
  if (!front || motionOff() || !Element.prototype.animate) return null;
  const r = front.getBoundingClientRect();
  const w = front.offsetWidth;
  const h = front.offsetHeight;
  const box = { left: r.left + r.width / 2 - w / 2, top: r.top + r.height / 2 - h / 2, width: w, height: h };
  const fly = document.createElement("div");
  fly.className = "book-fly";
  fly.style.setProperty("--k", getComputedStyle($("homeScreen")).getPropertyValue("--k"));
  fly.innerHTML = '<div class="fly-page"></div>';
  const cover = front.cloneNode(true);
  cover.className = "fly-cover cover-frame";
  Object.assign(cover.style, { width: w + "px", height: h + "px" });
  fly.appendChild(cover);
  document.body.appendChild(fly);
  return { fly, cover, slide, box };
}

const boxFrame = (b, radius) => ({
  left: b.left + "px",
  top: b.top + "px",
  width: b.width + "px",
  height: b.height + "px",
  borderRadius: radius,
});
const fullFrame = () => boxFrame({ left: 0, top: 0, width: innerWidth, height: innerHeight }, "0px");

async function openBookAnimated(i) {
  if (flying) return;
  const href = bookHref(i);
  const f = makeFly(i);
  if (!f) return (location.hash = href);
  flying = true;
  const { fly, cover, slide, box } = f;
  slide.style.visibility = "hidden";
  // Корешок справа — обложка открывается вокруг правого края
  cover.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(115deg)", opacity: 0.2 }], {
    duration: 420,
    easing: "cubic-bezier(.45,0,.2,1)",
    fill: "forwards",
  });
  await fly.animate([boxFrame(box, "12px"), fullFrame()], {
    duration: 460,
    delay: 170,
    easing: "cubic-bezier(.2,.8,.2,1)",
    fill: "forwards",
  }).finished;
  location.hash = href;
  await new Promise((r) => setTimeout(r, 60));
  await fly.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: "forwards" }).finished;
  fly.remove();
  slide.style.visibility = "";
  flying = false;
}

// Возврат в библиотеку: страница сжимается обратно в книгу и обложка закрывается
async function closeBookAnimated(i) {
  if (flying) return;
  const f = makeFly(i);
  if (!f) return;
  flying = true;
  const { fly, cover, slide, box } = f;
  slide.style.visibility = "hidden";
  cover.style.transform = "rotateY(115deg)";
  cover.style.opacity = "0";
  const shrink = fly.animate([fullFrame(), boxFrame(box, "12px")], {
    duration: 420,
    easing: "cubic-bezier(.2,.8,.2,1)",
    fill: "forwards",
  });
  const close = cover.animate([{ transform: "rotateY(115deg)", opacity: 0.2 }, { transform: "rotateY(0deg)", opacity: 1 }], {
    duration: 380,
    delay: 220,
    easing: "cubic-bezier(.2,.8,.2,1)",
    fill: "forwards",
  });
  await Promise.all([shrink.finished, close.finished]);
  slide.style.visibility = "";
  fly.remove();
  flying = false;
}

$("bpOpen").addEventListener("click", (e) => {
  e.preventDefault();
  openBookAnimated(homeBook);
});

// ── Наклон книг вслед за телефоном (или мышью на компьютере) ──
{
  document.querySelectorAll(".book3d").forEach((book) => {
    const t = document.createElement("span");
    t.className = "tilt";
    book.before(t);
    t.appendChild(book);
  });
  const sc = $("showcase");
  const tilt = { x: 0, y: 0, tx: 0, ty: 0, base: null, raf: 0 };
  const clamp = (v, m) => Math.max(-m, Math.min(m, v));
  const loop = () => {
    tilt.x += (tilt.tx - tilt.x) * 0.12;
    tilt.y += (tilt.ty - tilt.y) * 0.12;
    sc.style.setProperty("--tilt-x", tilt.x.toFixed(2) + "deg");
    sc.style.setProperty("--tilt-y", tilt.y.toFixed(2) + "deg");
    const still = Math.abs(tilt.tx - tilt.x) < 0.01 && Math.abs(tilt.ty - tilt.y) < 0.01;
    tilt.raf = still ? 0 : requestAnimationFrame(loop);
  };
  const aim = (x, y) => {
    tilt.tx = x;
    tilt.ty = y;
    if (!tilt.raf) tilt.raf = requestAnimationFrame(loop);
  };
  const onOrient = (e) => {
    if (currentView !== "home" || e.beta == null || motionOff()) return;
    if (!tilt.base) tilt.base = { b: e.beta, g: e.gamma };
    aim(clamp(-(e.beta - tilt.base.b) * 0.3, 6), clamp((e.gamma - tilt.base.g) * 0.45, 10));
  };
  {
    // Датчик движения — только если наклон включён в настройках.
    // iPhone спрашивает разрешение при каждом запуске приложения, поэтому по умолчанию он выключен.
    const DOE = window.DeviceOrientationEvent;
    const needsAsk = DOE && typeof DOE.requestPermission === "function";
    let listening = false;
    const listen = () => {
      if (!listening) addEventListener("deviceorientation", onOrient);
      listening = true;
    };
    tiltSensor = (on, fromTap) => {
      if (!DOE) return;
      if (!on) {
        removeEventListener("deviceorientation", onOrient);
        listening = false;
        tilt.base = null;
        return aim(0, 0);
      }
      if (!needsAsk) return listen();
      // На iPhone спросить можно только в ответ на касание
      if (fromTap) DOE.requestPermission().then((st) => st === "granted" && listen()).catch(() => {});
      else
        sc.addEventListener("click", function ask() {
          sc.removeEventListener("click", ask);
          if (store.get(TILT_KEY, false)) tiltSensor(true, true);
        });
    };
    if (store.get(TILT_KEY, false)) tiltSensor(true, false);
    sc.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" || motionOff()) return;
      const r = sc.getBoundingClientRect();
      aim(clamp(-((e.clientY - r.top) / r.height - 0.5) * 12, 6), clamp(((e.clientX - r.left) / r.width - 0.5) * 20, 10));
    });
    sc.addEventListener("pointerleave", () => aim(0, 0));
  }
}

// ── Возврат свайпом от левого края, как в iPhone ──
const VIEW_EL = { welcome: "welcomeScreen", nahw: "nahwScreen", quiz: "quizScreen", lesson: "mainContent", train: "trainScreen" };
{
  let edge = null;
  const blocked = () =>
    currentView === "home" ||
    currentView === "main" ||
    !$("reader").hidden ||
    !$("retell").hidden ||
    !$("todayLayer").hidden ||
    !$("setLayer").hidden ||
    !$("qawlLayer").hidden ||
    !$("netLayer").hidden ||
    $("wordSheet").classList.contains("show");
  document.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    if (e.touches.length !== 1 || t.clientX > 24 || blocked()) return;
    const el = $(VIEW_EL[currentView]);
    const back = el?.querySelector(".navbar .back");
    if (back) edge = { x: t.clientX, y: t.clientY, el, href: back.getAttribute("href"), on: false, dx: 0, t: Date.now() };
  }, { passive: true });
  document.addEventListener("touchmove", (e) => {
    if (!edge) return;
    const t = e.touches[0];
    const dx = t.clientX - edge.x;
    const dy = t.clientY - edge.y;
    if (!edge.on) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) return (edge = null);
      if (dx < 8) return;
      edge.on = true;
      edge.el.style.boxShadow = "-12px 0 30px rgba(0,0,0,.18)";
    }
    e.preventDefault();
    edge.dx = Math.max(0, dx);
    edge.el.style.transform = `translateX(${edge.dx}px)`;
  }, { passive: false });
  const done = (el) => {
    el.style.transform = "";
    el.style.boxShadow = "";
  };
  document.addEventListener("touchend", () => {
    if (!edge) return;
    const { el, dx, on, href, t } = edge;
    edge = null;
    if (!on) return;
    const fast = dx / Math.max(1, Date.now() - t) > 0.5;
    if (dx > innerWidth * 0.33 || (fast && dx > 40)) {
      el.animate([{ transform: `translateX(${dx}px)` }, { transform: `translateX(${innerWidth}px)` }], {
        duration: 200,
        easing: "ease-out",
        fill: "forwards",
      }).finished.then((a) => {
        skipCloseAnim = true;
        location.hash = href === "#" ? "" : href;
        setTimeout(() => {
          a.cancel();
          done(el);
          const next = currentView === "home" ? $("homeScreen") : $(VIEW_EL[currentView]);
          next?.classList.add("screen-enter");
          next?.addEventListener("animationend", () => next.classList.remove("screen-enter"), { once: true });
        }, 30);
      });
    } else {
      el.animate([{ transform: `translateX(${dx}px)` }, { transform: "translateX(0)" }], {
        duration: 220,
        easing: "cubic-bezier(.2,.8,.2,1)",
      });
      done(el);
    }
  });
}

// ── Чтение рассказа на весь экран: строка за строкой ──
let readerLine = 0;
let readerTr = false;

function renderReaderLine(smooth = true) {
  const lines = $("readerText").children;
  [...lines].forEach((el, k) => el.classList.toggle("on", k === readerLine));
  lines[readerLine]?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" });
  $("readerCount").textContent = `Строка ${readerLine + 1} из ${story.length}`;
  $("readerTrText").hidden = !readerTr || !sentences[readerLine];
  $("readerTrText").textContent = sentences[readerLine] || "";
  if (readerLine === story.length - 1) markStep(readerPurpose);
  if (lessonId) {
    lessonPlace().line = readerLine;
    savePlace();
  }
}

function openReader() {
  if (!story.length) return;
  closeSheet();
  toggleSizer(false);
  // Каждое слово — отдельный элемент: касание слова показывает его перевод
  $("readerText").innerHTML = story
    .map(
      (line, k) =>
        `<span class="reader-line" data-l="${k}">${line
          .map((t, j) => `<span class="rw" data-w="${j}">${esc(showHarakat ? t.arabic : stripHarakat(t.arabic))}</span>`)
          .join(" ")}${esc(ends[k] ?? ".")}</span>`,
    )
    .join("");
  hideReaderWord();
  const saved = lessonPlace().line;
  readerLine = Number.isInteger(saved) && saved < story.length ? saved : 0;
  $("reader").hidden = false;
  requestAnimationFrame(() => renderReaderLine(false));
}

function closeReader() {
  if (!$("reader").hidden) stopSpeech();
  readerPurpose = "read";
  $("reader").hidden = true;
}

// Перевод слова в режиме чтения
function showReaderWord(el, tok) {
  $("readerText").querySelectorAll(".rw.sel").forEach((x) => x.classList.remove("sel"));
  el.classList.add("sel");
  $("readerWordAr").textContent = tok.arabic;
  $("readerWordTr").textContent = tok.translation;
  $("readerWordType").textContent = tok.type;
  $("readerWordSay").dataset.say = tok.arabic;
  $("readerWordSay").hidden = tok.type === "пропуск";
  const entry = tok.lemma && dict.get(tok.lemma);
  $("readerWordDict").hidden = !entry || entry.arabic === tok.arabic;
  $("readerWordDict").innerHTML = entry
    ? `<span lang="ar" dir="rtl">${esc(entry.arabic)}</span> — ${esc(entry.translation)}`
    : "";
  $("readerWord").hidden = false;
}

function hideReaderWord() {
  $("readerText").querySelectorAll(".rw.sel").forEach((x) => x.classList.remove("sel"));
  $("readerWord").hidden = true;
}
$("readerWord").addEventListener("click", hideReaderWord);

// «Слушать»: строка за строкой, подсветка идёт за голосом
function readerSpeak() {
  speak(lineText(story[readerLine]), $("readerPlay"), () => {
    if (readerLine >= story.length - 1) return;
    readerLine++;
    renderReaderLine();
    readerSpeak();
  });
}
$("readerPlay").insertAdjacentHTML("afterbegin", SAY_ICON);
$("readerPlay").onclick = () => (sayBtn === $("readerPlay") ? stopSpeech() : readerSpeak());

function stepReader(d) {
  logActivity();
  hideReaderWord();
  readerLine = Math.max(0, Math.min(story.length - 1, readerLine + d));
  renderReaderLine();
}

$("readBtn").onclick = openReader;
$("readerClose").onclick = closeReader;
$("readerTr").onclick = () => {
  readerTr = !readerTr;
  $("readerTr").setAttribute("aria-pressed", String(readerTr));
  renderReaderLine();
};
$("readerText").addEventListener("click", (e) => {
  const line = e.target.closest(".reader-line");
  const k = line ? Number(line.dataset.l) : readerLine;
  // Слово — показываем перевод, строку не листаем
  const w = e.target.closest(".rw");
  if (w && line) {
    if (k !== readerLine) {
      readerLine = k;
      renderReaderLine();
    }
    showReaderWord(w, story[k][Number(w.dataset.w)]);
    return;
  }
  // Открыт перевод слова — первое касание его закрывает
  if (!$("readerWord").hidden) return hideReaderWord();
  const playing = sayBtn === $("readerPlay");
  if (k !== readerLine) {
    readerLine = k;
    renderReaderLine();
  } else stepReader(1);
  if (playing) readerSpeak();
});
document.addEventListener("keydown", (e) => {
  if ($("reader").hidden) return;
  if (e.key === "Escape") closeReader();
  else if (e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === " ") stepReader(1);
  else if (e.key === "ArrowUp" || e.key === "ArrowRight") stepReader(-1);
});

// ── Нет сети / не удалось загрузить ──
let netRetryFn = null;

function showNetError(retry, fallback, title, text) {
  const offline = !navigator.onLine;
  $("netTitle").textContent = title || (offline ? "Нет подключения" : "Не удалось загрузить");
  $("netText").textContent =
    text ||
    (offline
      ? "Эта книга ещё не сохранена на устройстве. Подключитесь к интернету и повторите."
      : "Попробуйте ещё раз через минуту.");
  netRetryFn = retry;
  $("netRetry").hidden = !retry;
  $("netHome").href = fallback || "#";
  $("netHome").textContent = fallback === "#mabda" ? "К списку уроков" : fallback === "#amil" ? "К книге" : "К библиотеке";
  $("netLayer").hidden = false;
}

function hideNetError() {
  $("netLayer").hidden = true;
}

$("netRetry").onclick = () => {
  hideNetError();
  netRetryFn?.();
};
$("netHome").addEventListener("click", hideNetError);

// ── Короткие уведомления сверху ──
let toastTimer = 0;
function toast(msg, ms = 2600) {
  const t = $("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), ms);
}
addEventListener("offline", () => toast("Нет сети — работают сохранённые книги"));
addEventListener("online", () => toast("Снова в сети"));

// Кнопки «назад» в шапках круглые, подпись остаётся для экранного диктора
document.querySelectorAll(".navbar .back").forEach((a) => {
  const label = a.textContent.trim();
  a.setAttribute("aria-label", label ? `Назад: ${label}` : "Назад");
});

// ── Заставка: убираем после анимации или по нажатию ─────
const splash = $("splash");
if (splash) {
  const hideSplash = () => {
    splash.remove();
    document.documentElement.classList.remove("splash-on");
    // ?splash из предпросмотра больше не нужен в адресе
    if (/[?&]splash\b/.test(location.search)) history.replaceState(null, "", location.pathname + location.hash);
  };
  splash.addEventListener("animationend", (e) => {
    if (e.target === splash) hideSplash();
  });
  splash.addEventListener("click", hideSplash);
  // на случай, если анимация не сработала
  setTimeout(hideSplash, (Number(document.documentElement.dataset.splashSec) || 5) * 1000 + 600);
}

// ── Задано учителем: план на сегодня ────────────────────
// plan = { days: [дни недели занятий, 0 — Вс], mabda: { key, since, done: { шаг: дата } }, unm: { topics: [узлы], since, trained } }
const PLAN_KEY = "arabic.plan";
const WEEK = [["Пн", 1], ["Вт", 2], ["Ср", 3], ["Чт", 4], ["Пт", 5], ["Сб", 6], ["Вс", 0]];
const DAY_NAMES = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const STEPS = [
  { id: "read", title: "Прочитать текст", sub: "Чтение на весь экран, перевод слова — касанием" },
  { id: "words", title: "Выучить слова", sub: "Карточки урока: смахивайте «знаю» / «не знаю»" },
  { id: "translate", title: "Перевод по тексту", sub: "Переводите строку вслух, проверяйте кнопкой перевода" },
  { id: "retell", title: "Пересказ", sub: "План по шагам и запись своего голоса" },
];
const UNM = "#nahw";
let plan = store.get(PLAN_KEY, {});
if (typeof plan !== "object" || plan === null) plan = {};
plan.days = Array.isArray(plan.days) ? plan.days.filter((d) => Number.isInteger(d) && d >= 0 && d < 7) : [];
if (plan.mabda && !LESSONS.some((l) => l.key === plan.mabda.key)) delete plan.mabda;
const savePlan = () => store.set(PLAN_KEY, plan);

const ymd = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromYmd = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const dayDiff = (a, b) => Math.round((b - a) / 864e5);
const today0 = () => fromYmd(ymd());
const dateLabel = (d) => `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
const relLabel = (n) => (n <= 0 ? "сегодня" : n === 1 ? "завтра" : `через ${n} ${plural(n, "день", "дня", "дней")}`);

// Ближайший день занятий после start (или с него самого)
function nextClass(start, inclusive) {
  if (!plan.days.length) return null;
  for (let k = inclusive ? 0 : 1; k <= 7; k++) {
    const d = addDays(start, k);
    if (plan.days.includes(d.getDay())) return d;
  }
  return null;
}
// Сдать — в ближайшее занятие после того, как задали; прошедшее занятие сдвигается на следующее
function dueOf(task) {
  if (!task) return null;
  const due = nextClass(fromYmd(task.since), false);
  const t = today0();
  return due && due < t ? nextClass(t, true) : due;
}

// Оставшиеся шаги урока раскладываются на дни до занятия (включая его день)
function mabdaSchedule() {
  const m = plan.mabda;
  const due = dueOf(m);
  // сделанное сегодня остаётся в сегодняшнем плане — день не «растёт» после каждой галочки
  const t = ymd();
  const left = STEPS.filter((s) => !m.done?.[s.id] || m.done[s.id] === t);
  const n = due ? Math.max(1, dayDiff(today0(), due) + 1) : Math.max(1, left.length);
  const days = Array.from({ length: n }, () => []);
  left.forEach((s, k) => days[Math.floor((k * n) / left.length)].push(s));
  return { due, days };
}

function markStep(id) {
  const m = plan.mabda;
  if (!m || m.key !== lessonId || m.done?.[id]) return;
  (m.done ||= {})[id] = ymd();
  savePlan();
  logActivity();
  toast(`В плане отмечено: ${STEPS.find((s) => s.id === id).title}`);
}

// Что сделать сегодня: шаги на сегодня + уже отмеченные сегодня
function todayItems() {
  const items = [];
  const t = ymd();
  if (plan.mabda) {
    const m = plan.mabda;
    const { days } = mabdaSchedule();
    days[0].forEach((s) => items.push({ step: s.id, title: s.title, sub: s.sub, done: m.done?.[s.id] === t }));
    if (!items.length && STEPS.some((s) => !m.done?.[s.id]))
      items.push({ step: "review", title: "Повторить слова", sub: "5 минут карточек — чтобы не забыть", done: m.review === t });
  }
  if (plan.unm?.topics?.length)
    items.push({ step: "unm", title: "Повторить темы Унмузаджа", sub: "Термин ↔ определение", done: plan.unm.trained === t });
  return items;
}

// Главный экран: полоска «Сегодня» и задание книги в её карточке
function renderHomeToday() {
  if (currentView === "main") renderMain();
  renderBookTask();
}

function renderBookTask() {
  const href = BOOKS[homeBook]?.href;
  const t = today0();
  let text = "";
  let open = "Открыть";
  if (href === "#mabda" && plan.mabda) {
    const l = LESSONS.find((x) => x.key === plan.mabda.key);
    const due = dueOf(plan.mabda);
    text = `${l.n ? "Урок " + l.n : "Упражнения"}${due ? ` · сдать ${relLabel(dayDiff(t, due))}` : " · задано учителем"}`;
    open = l.n ? `Продолжить урок ${l.n}` : "Продолжить упражнения";
  } else if (href === UNM && plan.unm?.topics?.length) {
    const n = plan.unm.topics.length;
    const due = dueOf(plan.unm);
    text = `${n} ${plural(n, "тема", "темы", "тем")}${due ? ` · сдать ${relLabel(dayDiff(t, due))}` : " · задано учителем"}`;
  }
  $("bpTask").hidden = !text;
  $("bpTask").textContent = text;
  $("bpDesc").hidden = !!text;
  $("bpOpen").textContent = open;
}

function openToday() {
  renderToday();
  $("todayLayer").hidden = false;
  requestAnimationFrame(() => $("todayLayer").classList.add("show"));
  if (plan.unm?.topics?.length && !unmNodes)
    loadUnm()
      .then(renderToday)
      .catch(() => {});
}
function closeToday() {
  const layer = $("todayLayer");
  if (layer.hidden || !layer.classList.contains("show")) return;
  layer.classList.remove("show");
  pickerOpen = false;
  setTimeout(() => {
    if (!layer.classList.contains("show")) layer.hidden = true;
  }, 300);
}
$("todayDone").onclick = closeToday;
$("todayOverlay").onclick = closeToday;

let unmNodes = null; // узлы Унмузаджа в порядке дерева: индекс = номер темы
async function loadUnm() {
  const data = await loadTreeBook(UNM);
  if (!unmNodes) {
    unmNodes = [];
    const walk = (n, parent) => {
      const i = unmNodes.push({ n, parent }) - 1;
      (n.children || []).forEach((c) => walk(c, i));
    };
    walk(data.tree, null);
  }
  return unmNodes;
}

let pickerOpen = false;
function renderToday() {
  const t = today0();
  $("todayDate").textContent = dateLabel(t);
  const items = todayItems();
  const lesson = plan.mabda && LESSONS.find((l) => l.key === plan.mabda.key);
  const CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  $("todayPlan").innerHTML = items.length
    ? items
        .map(
          (x) =>
            `<div class="today-item${x.done ? " done" : ""}"><button class="today-check" type="button" data-check="${x.step}" aria-pressed="${x.done}" aria-label="${x.done ? "Снять отметку" : "Отметить сделанным"}">${CHECK}</button><button class="today-go" type="button" data-go="${x.step}"><span class="today-item-title">${esc(x.title)}</span><span class="today-item-sub">${x.step === "unm" ? esc(x.sub) : esc(lesson ? `Урок ${lesson.n} · ${x.sub}` : x.sub)}</span></button></div>`,
        )
        .join("")
    : `<div class="today-empty">${plan.mabda || plan.unm?.topics?.length ? "На сегодня всё сделано" : "Укажите ниже, что задал учитель, — здесь появится план на каждый день"}</div>`;

  // Что дальше по дням
  let next = "";
  if (plan.mabda) {
    const { due, days } = mabdaSchedule();
    const rows = days
      .map((list, k) => (k && list.length ? `<li><b>${k === 1 ? "Завтра" : dateLabel(addDays(t, k))}</b> — ${list.map((s) => s.title.toLowerCase()).join(", ")}</li>` : ""))
      .join("");
    if (rows) next = `<div class="eyebrow">Дальше</div><ul>${rows}</ul>`;
    if (!due) next += `<p>Отметьте дни занятий — план разложится до ближайшего урока.</p>`;
  }
  $("todayNext").innerHTML = next;
  $("todayNext").hidden = !next;

  // Мабда: заданный урок
  const m = plan.mabda;
  const due = dueOf(m);
  let mabda = `<div class="today-card-head"><span class="today-book">Мабда аль-Кираа</span>${m && due ? `<span class="today-due">сдать ${relLabel(dayDiff(t, due))}</span>` : ""}</div>`;
  if (pickerOpen) {
    const cur = lesson || LESSONS.find((l) => l.key === place.mabda) || LESSONS[0];
    mabda += `<div class="today-picker"><select id="pickPart" aria-label="Часть">${PARTS.map((p) => `<option value="${p.id}"${p.id === cur.part ? " selected" : ""}>${esc(p.ru)}</option>`).join("")}</select><select id="pickLesson" aria-label="Урок"></select></div><div class="today-actions"><button class="pill-btn" type="button" data-act="cancel">Отмена</button><button class="pill-btn primary" type="button" data-act="save">Сохранить</button></div>`;
  } else if (lesson) {
    mabda += `<a class="today-lesson" href="#lesson-${lesson.key}"><span class="today-lesson-num">${lesson.n ?? "✎"}</span><span class="today-lesson-info"><span class="today-lesson-ru">Часть ${lesson.part} · ${esc(lesson.ruTitle)}</span><span class="today-lesson-ar" lang="ar" dir="rtl">${esc(lesson.title)}</span></span></a>${due ? `<div class="today-meta">Сдать: ${dateLabel(due)}</div>` : ""}<div class="today-actions"><button class="pill-btn" type="button" data-act="pick">Изменить</button><button class="pill-btn primary" type="button" data-act="passed">Сдал урок</button></div>`;
  } else {
    mabda += `<p class="today-none">Урок не задан</p><div class="today-actions"><button class="pill-btn primary" type="button" data-act="pick">Указать урок</button></div>`;
  }
  $("todayMabda").innerHTML = mabda;
  if (pickerOpen) fillLessonPick(lesson || LESSONS.find((l) => l.key === place.mabda) || LESSONS[0]);

  // Унмузадж: заданные темы
  const topics = plan.unm?.topics || [];
  const udue = topics.length ? dueOf(plan.unm) : null;
  let unm = `<div class="today-card-head"><span class="today-book">Шарх аль-Унмузадж</span>${udue ? `<span class="today-due">сдать ${relLabel(dayDiff(t, udue))}</span>` : ""}</div>`;
  if (topics.length && unmNodes) {
    unm += `<ul class="today-topics">${topics
      .map((i) => unmNodes[i] && `<li><span class="today-topic-ar" lang="ar" dir="rtl">${esc(unmNodes[i].n.ar)}</span><span class="today-topic-ru">${esc(unmNodes[i].n.ru || "")}</span><button class="today-x" type="button" data-untopic="${i}" aria-label="Убрать тему">×</button></li>`)
      .join("")}</ul><div class="today-actions"><a class="pill-btn" href="#nahw">Темы в дереве</a><a class="pill-btn" href="#unm-train">Тренировка</a><button class="pill-btn primary" type="button" data-act="unmPassed">Сдал</button></div>`;
  } else {
    unm += `<p class="today-none">Темы не заданы. Откройте термин в дереве и нажмите «Задано учителем».</p><div class="today-actions"><a class="pill-btn primary" href="#nahw">Выбрать темы</a></div>`;
  }
  $("todayUnm").innerHTML = unm;

  $("todayDays").innerHTML = WEEK.map(
    ([name, d]) => `<button type="button" class="day-chip${plan.days.includes(d) ? " on" : ""}" data-day="${d}" aria-pressed="${plan.days.includes(d)}">${name}</button>`,
  ).join("");
  renderHomeToday();
}

function fillLessonPick(cur) {
  const part = Number($("pickPart").value);
  $("pickLesson").innerHTML = LESSONS.filter((l) => l.part === part)
    .map((l) => `<option value="${l.key}"${l.key === cur.key ? " selected" : ""}>${l.n ? `${l.n}. ` : ""}${esc(l.ruTitle)}</option>`)
    .join("");
}

// Переход к шагу: урок открывается в нужном режиме
let pendingAction = null;
function goStep(step) {
  if (step === "unm") return (location.hash = "#unm-train");
  if (!plan.mabda) return;
  pendingAction = step === "review" ? "words" : step;
  const hash = "#lesson-" + plan.mabda.key;
  if (location.hash === hash) route();
  else location.hash = hash;
}
function runPendingAction() {
  const a = pendingAction;
  pendingAction = null;
  if (!a) return;
  if (a === "words") return setMode("words");
  setMode("story");
  if (a === "retell") return openRetell();
  readerPurpose = a === "translate" ? "translate" : "read";
  if (a === "translate") {
    readerTr = false;
    $("readerTr").setAttribute("aria-pressed", "false");
  }
  openReader();
  if (a === "translate") toast("Переведите строку вслух, затем проверьте кнопкой перевода справа вверху", 4200);
}
let readerPurpose = "read";

$("todayPlan").addEventListener("click", (e) => {
  const c = e.target.closest("[data-check]");
  if (c) {
    const step = c.dataset.check;
    const t = ymd();
    if (step === "unm") plan.unm.trained = plan.unm.trained === t ? null : t;
    else if (step === "review") plan.mabda.review = plan.mabda.review === t ? null : t;
    else {
      const done = (plan.mabda.done ||= {});
      if (done[step]) delete done[step];
      else done[step] = t;
      logActivity();
    }
    savePlan();
    return renderToday();
  }
  const g = e.target.closest("[data-go]");
  if (g) goStep(g.dataset.go);
});

$("todayMabda").addEventListener("change", (e) => {
  if (e.target.id === "pickPart") fillLessonPick({ key: "" });
});
$("todayMabda").addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const act = b.dataset.act;
  if (act === "pick") pickerOpen = true;
  if (act === "cancel") pickerOpen = false;
  if (act === "save") {
    const key = $("pickLesson").value;
    if (plan.mabda?.key !== key) plan.mabda = { key, since: ymd(), done: {} };
    pickerOpen = false;
    savePlan();
  }
  if (act === "passed") {
    const i = LESSONS.findIndex((l) => l.key === plan.mabda.key);
    const next = LESSONS[i + 1];
    if (!confirm(next ? `Урок сдан? Следующим станет «${next.ruTitle}».` : "Урок сдан? Это последний урок в приложении.")) return;
    plan.passed = (plan.passed || 0) + 1;
    if (next) plan.mabda = { key: next.key, since: ymd(), done: {} };
    else delete plan.mabda;
    savePlan();
    toast("Молодец! Урок сдан");
  }
  renderToday();
});
$("todayUnm").addEventListener("click", (e) => {
  const x = e.target.closest("[data-untopic]");
  if (x) {
    plan.unm.topics = plan.unm.topics.filter((i) => i !== Number(x.dataset.untopic));
    savePlan();
    return renderToday();
  }
  if (e.target.closest('[data-act="unmPassed"]')) {
    if (!confirm("Темы сданы? Список заданных тем очистится.")) return;
    plan.unm = { topics: [], since: ymd() };
    savePlan();
    toast("Молодец! Темы сданы");
    renderToday();
  }
});
$("todayDays").addEventListener("click", (e) => {
  const b = e.target.closest("[data-day]");
  if (!b) return;
  const d = Number(b.dataset.day);
  plan.days = plan.days.includes(d) ? plan.days.filter((x) => x !== d) : [...plan.days, d];
  savePlan();
  renderToday();
});

// Унмузадж: «Задано учителем» в окне термина
const isAssigned = (i) => nahwHash === UNM && !!plan.unm?.topics?.includes(i);
function applyAssignBtn(i) {
  const b = $("qawlAssign");
  b.hidden = nahwHash !== UNM;
  const on = isAssigned(i);
  b.textContent = on ? "★ Задано учителем" : "☆ Задано учителем";
  b.setAttribute("aria-pressed", String(on));
  b.classList.toggle("on", on);
}
$("qawlAssign").onclick = () => {
  const i = qawlIndex;
  if (!plan.unm?.topics?.length) plan.unm = { topics: [], since: ymd() };
  const on = plan.unm.topics.includes(i);
  plan.unm.topics = on ? plan.unm.topics.filter((x) => x !== i) : [...plan.unm.topics, i];
  savePlan();
  applyAssignBtn(i);
  renderNahw();
  toast(on ? "Тема убрана из задания" : "Тема добавлена в задание на «Сегодня»");
};

// ── Пересказ: план по шагам и запись голоса ──
function openRetell() {
  if (!story.length) return;
  closeSheet();
  toggleSizer(false);
  const n = story.length;
  const size = Math.max(1, Math.ceil(n / 7));
  const steps = [];
  for (let k = 0; k < n; k += size) steps.push([k, Math.min(n, k + size)]);
  const words = (s) => s.split(/\s+/);
  $("retellSteps").innerHTML = steps
    .map(([a, b]) => {
      const ru = sentences.slice(a, b).join(" ");
      const first = words(sentences[a] || "");
      const hint = first.slice(0, 6).join(" ") + (first.length > 6 || b - a > 1 ? " …" : "");
      const ar = story
        .slice(a, b)
        .map((line, k) => esc(lineText(line) + (ends[a + k] ?? ".")))
        .join(" ");
      return `<li class="retell-step" data-stage="0"><span class="retell-hint">${esc(hint)}</span><span class="retell-full">${esc(ru)}</span><span class="retell-ar" lang="ar" dir="rtl">${ar}</span></li>`;
    })
    .join("");
  $("retell").hidden = false;
  $("retellSteps").parentElement.scrollTop = 0;
  showSavedRec();
}

function closeRetell() {
  if ($("retell").hidden) return;
  stopRec();
  stopSpeech();
  $("retell").hidden = true;
}

$("retellBtn").onclick = openRetell;
$("retellClose").onclick = closeRetell;
// Касание шага: подсказка → перевод → арабский текст → снова подсказка
$("retellSteps").addEventListener("click", (e) => {
  const li = e.target.closest(".retell-step");
  if (li) li.dataset.stage = String((Number(li.dataset.stage) + 1) % 3);
});

// Записи хранятся в IndexedDB этого телефона, по одной на урок
const recDb = () =>
  new Promise((res, rej) => {
    const r = indexedDB.open("arabic-rec", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("rec");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
async function recStore(mode, key, value) {
  try {
    const db = await recDb();
    return await new Promise((res) => {
      const st = db.transaction("rec", mode === "get" ? "readonly" : "readwrite").objectStore("rec");
      const q = mode === "get" ? st.get(key) : mode === "put" ? st.put(value, key) : st.delete(key);
      q.onsuccess = () => res(q.result ?? null);
      q.onerror = () => res(null);
    });
  } catch {
    return null;
  }
}

let recorder = null;
let recTimer = 0;
let recUrl = null;
const recKey = () => "lesson-" + lessonId;
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function showRec(blob) {
  if (recUrl) URL.revokeObjectURL(recUrl);
  recUrl = blob ? URL.createObjectURL(blob) : null;
  $("recAudio").hidden = !blob;
  $("recDel").hidden = !blob;
  if (blob) $("recAudio").src = recUrl;
  else $("recAudio").removeAttribute("src");
  $("recStatus").textContent = blob ? "Ваш пересказ — послушайте себя" : "Запишите пересказ и послушайте себя";
}
async function showSavedRec() {
  showRec(null);
  const key = recKey();
  const blob = await recStore("get", key);
  if (blob && key === recKey() && !$("retell").hidden) showRec(blob);
}

async function startRec() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast("Запись голоса здесь не поддерживается");
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    return toast("Нет доступа к микрофону — разрешите его в настройках iPhone", 3600);
  }
  const type = ["audio/mp4", "audio/webm"].find((t) => MediaRecorder.isTypeSupported?.(t));
  const chunks = [];
  const key = recKey();
  recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  recorder.onstop = async () => {
    stream.getTracks().forEach((t) => t.stop());
    const blob = new Blob(chunks, { type: recorder?.mimeType || type || "audio/mp4" });
    recorder = null;
    $("recBtn").classList.remove("recording");
    if (!blob.size) return showRec(null);
    await recStore("put", key, blob);
    if (key === recKey()) {
      showRec(blob);
      markStep("retell");
    }
  };
  recorder.start();
  const t0 = Date.now();
  $("recBtn").classList.add("recording");
  $("recAudio").hidden = true;
  $("recDel").hidden = true;
  const tick = () => ($("recStatus").textContent = `Идёт запись ${fmtTime((Date.now() - t0) / 1000)} — нажмите, чтобы остановить`);
  tick();
  recTimer = setInterval(tick, 500);
}
function stopRec() {
  clearInterval(recTimer);
  if (recorder && recorder.state !== "inactive") recorder.stop();
}
$("recBtn").onclick = () => (recorder ? stopRec() : startRec());
$("recDel").onclick = async () => {
  if (!confirm("Удалить запись пересказа?")) return;
  await recStore("del", recKey());
  showRec(null);
};

// ── Унмузадж: тренировка «термин ↔ определение» ──
const TRAIN_MODE_KEY = "arabic.unmMode";
let trainMode = store.get(TRAIN_MODE_KEY, "term") === "def" ? "def" : "term";
let trainDeck = [];
let trainPos = 0;
let trainTotal = 0;

const defOf = (n) => ({ ar: n.qawl || "", ru: n.qawlRu || n.def || "" });
function trainTopics() {
  // заданные темы вместе с подтемами
  const set = new Set();
  const add = (i) => {
    set.add(i);
    unmNodes.forEach((x, k) => x.parent === i && add(k));
  };
  (plan.unm?.topics || []).forEach(add);
  return [...set].filter((i) => {
    const d = defOf(unmNodes[i].n);
    return d.ar || d.ru;
  });
}

function startTrain() {
  trainDeck = shuffle(trainTopics());
  trainTotal = trainDeck.length;
  trainPos = 0;
  $("trainDone").hidden = true;
  renderTrain();
}

function renderTrain() {
  $("trainMode").querySelectorAll("button").forEach((b) => {
    const on = b.dataset.mode === trainMode;
    b.classList.toggle("on", on);
    b.setAttribute("aria-checked", String(on));
  });
  const empty = !trainTotal;
  const done = !empty && trainPos >= trainDeck.length;
  ["trainFace", "trainGrade"].forEach((id) => ($(id).hidden = empty || done));
  $("trainDone").hidden = !(empty || done);
  if (empty) {
    $("trainDoneTitle").textContent = "Темы не заданы";
    $("trainDoneText").textContent = "Откройте термин в дереве Унмузаджа и нажмите «Задано учителем».";
    $("trainAgain").hidden = true;
    $("trainStep").textContent = "";
    $("trainLeft").textContent = "";
    return;
  }
  $("trainAgain").hidden = false;
  if (done) {
    $("trainDoneTitle").textContent = "Все темы повторены";
    $("trainDoneText").textContent = `Повторено тем: ${trainTotal}. Перед занятием пройдите ещё раз в обратную сторону.`;
    $("trainBar").style.width = "100%";
    $("trainStep").textContent = "Готово";
    plan.unm.trained = ymd();
    savePlan();
    return;
  }
  const n = unmNodes[trainDeck[trainPos]].n;
  const d = defOf(n);
  const term = `<span class="train-term" lang="ar" dir="rtl">${esc(n.ar)}</span>${n.ru ? `<span class="train-ru">${esc(n.ru)}</span>` : ""}`;
  const def = `${d.ar ? `<span class="train-def-ar" lang="ar" dir="rtl">${esc(d.ar)}</span>` : ""}${d.ru ? `<span class="train-def-ru">${esc(d.ru)}</span>` : ""}`;
  // в обратную сторону показываем только перевод: в арабском определении часто есть сам термин
  $("trainFront").innerHTML = trainMode === "term" ? term : `<span class="train-def-ru big">${esc(d.ru || d.ar)}</span>`;
  $("trainBack").innerHTML = trainMode === "term" ? def : term;
  $("trainBack").hidden = true;
  $("trainHint").hidden = false;
  $("trainGrade").hidden = true;
  $("trainStep").textContent = `Тема ${Math.min(trainPos + 1, trainDeck.length)} из ${trainDeck.length}`;
  $("trainLeft").textContent = `${trainTotal} ${plural(trainTotal, "тема", "темы", "тем")}`;
  $("trainBar").style.width = `${(trainPos / trainDeck.length) * 100}%`;
  $("trainFace").scrollTop = 0;
}

$("trainFace").onclick = () => {
  if (!$("trainBack").hidden) return;
  $("trainBack").hidden = false;
  $("trainHint").hidden = true;
  $("trainGrade").hidden = false;
};
function gradeTrain(ok) {
  logActivity();
  // «Не помню» — тема вернётся через несколько карточек
  if (!ok) trainDeck.splice(Math.min(trainPos + 1 + RETRY_GAP, trainDeck.length), 0, trainDeck[trainPos]);
  trainPos++;
  renderTrain();
}
$("trainNo").onclick = () => gradeTrain(false);
$("trainYes").onclick = () => gradeTrain(true);
$("trainAgain").onclick = startTrain;
$("trainMode").onclick = (e) => {
  const b = e.target.closest("button[data-mode]");
  if (!b || b.dataset.mode === trainMode) return;
  trainMode = b.dataset.mode;
  store.set(TRAIN_MODE_KEY, trainMode);
  startTrain();
};

async function showTrain() {
  setView("train");
  document.title = "Темы Унмузаджа — Arabic";
  try {
    await loadUnm();
    startTrain();
  } catch {
    showNetError(showTrain, "#today");
  }
}

// ── Главная: продолжить, задание, план на сегодня, книги, итоги ──
// Дни, когда занимались: для недели и серии дней подряд
const ACT_KEY = "arabic.activity";
let activity = store.get(ACT_KEY, []);
if (!Array.isArray(activity)) activity = [];
function logActivity() {
  const t = ymd();
  if (activity[activity.length - 1] === t) return;
  activity = [...activity.filter((d) => d !== t), t].slice(-400);
  store.set(ACT_KEY, activity);
}
function streakDays() {
  const set = new Set(activity);
  let d = today0();
  if (!set.has(ymd(d))) d = addDays(d, -1);
  let n = 0;
  while (set.has(ymd(d))) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

const BOOK_RU = ["Мабда аль-Кираа", "Миату Амиль", "Шарх аль-Унмузадж"];
const coverHTML = (i) => document.querySelector(`#carousel .slide[data-i="${i}"] .cover`)?.outerHTML || "";
const learnedWords = () => Object.values(progress).reduce((a, m) => a + Object.values(m || {}).filter((b) => b >= LEARNED).length, 0);
const learnedAmil = () => Object.values(quizStore).filter((v) => v >= LEARNED).length;
const GAUGE_LEN = 276.5; // длина дуги радиусом 88

let lastTab = "main";
const tabHref = () => (lastTab === "library" ? "#library" : "#");

function renderMain() {
  const t = today0();
  const items = todayItems();
  const done = items.filter((x) => x.done).length;
  const next = items.find((x) => !x.done);
  const assigned = !!(plan.mabda || plan.unm?.topics?.length);

  // Кольцо в шапке
  $("goalNum").textContent = String(done);
  $("goalFill").style.strokeDasharray = `${items.length ? (done / items.length) * 97.4 : 0} 97.4`;
  $("goalRing").classList.toggle("all-done", assigned && !next);

  // Продолжить
  const mkey = plan.mabda?.key || place.mabda || "1-1";
  const ml = LESSONS.find((l) => l.key === mkey) || LESSONS[0];
  const topics = plan.unm?.topics?.length || 0;
  const cards = [
    { href: "#lesson-" + ml.key, cover: 0, title: `${ml.n ? "Урок " + ml.n : "Упражнения"} · ${ml.ruTitle}`, sub: `${BOOK_RU[0]} · часть ${ml.part}`, meta: "", id: "cmMabda" },
    { href: "#nahw", cover: 2, title: topics ? `Задано: ${topics} ${plural(topics, "тема", "темы", "тем")}` : "Глава об имени", sub: BOOK_RU[2], meta: "Дерево терминов" },
    { href: "#amil", cover: 1, title: "Сто управляющих слов", sub: BOOK_RU[1], meta: `Тренажёр · выучено ${learnedAmil()}` },
  ];
  $("mContinue").innerHTML = cards
    .map(
      (c) =>
        `<a class="c-card" href="${c.href}"><span class="mini-cover">${coverHTML(c.cover)}</span><span class="c-info"><span class="c-title">${esc(c.title)}</span><span class="c-sub">${esc(c.sub)}</span><span class="c-meta"${c.id ? ` id="${c.id}"` : ""}>${esc(c.meta)}</span></span></a>`,
    )
    .join("");
  loadLesson(ml.key)
    .then((d) => {
      const n = d.words.length;
      const k = d.words.filter((w) => isLearned(w, ml.key)).length;
      if ($("cmMabda")) $("cmMabda").textContent = n ? `Слова · ${Math.round((k / n) * 100)} %` : `${d.story.length} предложений`;
    })
    .catch(() => {});

  // Задано учителем
  let a = "";
  if (plan.mabda) {
    const l = LESSONS.find((x) => x.key === plan.mabda.key);
    const due = dueOf(plan.mabda);
    const dots = STEPS.map((s) => `<i class="${plan.mabda.done?.[s.id] ? "on" : ""}" title="${s.title}"></i>`).join("");
    a += `<button class="a-card" type="button" data-open-today><span class="mini-cover big">${coverHTML(0)}</span><span class="a-info"><span class="a-kicker">${BOOK_RU[0]}</span><span class="a-title">${l.n ? "Урок " + l.n : "Упражнения"} · ${esc(l.ruTitle)}</span><span class="a-ar" lang="ar" dir="rtl">${esc(l.title)}</span>${due ? `<span class="a-due">сдать ${relLabel(dayDiff(t, due))}</span>` : ""}<span class="a-steps">${dots}</span></span></button>`;
  }
  if (topics && unmNodes) {
    const due = dueOf(plan.unm);
    const names = plan.unm.topics.map((i) => unmNodes[i]?.n.ar).filter(Boolean).slice(0, 3);
    a += `<button class="a-card" type="button" data-open-today><span class="mini-cover big">${coverHTML(2)}</span><span class="a-info"><span class="a-kicker">${BOOK_RU[2]}</span><span class="a-title">${topics} ${plural(topics, "тема", "темы", "тем")}</span><span class="a-ar" lang="ar" dir="rtl">${names.map(esc).join(" · ")}</span>${due ? `<span class="a-due">сдать ${relLabel(dayDiff(t, due))}</span>` : ""}</span></button>`;
  } else if (topics) loadUnm().then(renderMain).catch(() => {});
  if (!assigned) a = `<button class="a-card a-empty" type="button" data-open-today><span class="a-plus">+</span><span class="a-info"><span class="a-title">Что задал учитель?</span><span class="c-sub">Укажите урок и дни занятий — план разложится по дням</span></span></button>`;
  $("mAssigned").innerHTML = a;

  // План на сегодня: полукруг, следующий шаг, неделя
  $("gaugeFill").style.strokeDasharray = `${items.length ? (done / items.length) * GAUGE_LEN : 0} ${GAUGE_LEN}`;
  $("gaugeFill").classList.toggle("zero", !done);
  $("goalFill").classList.toggle("zero", !done);
  $("gaugeNum").textContent = items.length ? `${done} из ${items.length}` : "—";
  $("gaugeLink").innerHTML = (assigned ? "из плана на сегодня" : "укажите задание") + ` <span aria-hidden="true">›</span>`;
  $("mNextTitle").textContent = !assigned ? "Указать задание" : next ? "Продолжить" : "На сегодня всё";
  $("mNextSub").textContent = !assigned ? "Что задал учитель" : next ? next.title : "Можно повторить слова";
  $("mNext").dataset.step = next?.step || (assigned && plan.mabda ? "review" : "");
  const monday = addDays(t, -((t.getDay() + 6) % 7));
  const act = new Set(activity);
  $("mWeek").innerHTML = WEEK.map(([name, wd], k) => {
    const d = addDays(monday, k);
    const cls = [act.has(ymd(d)) ? "act" : "", ymd(d) === ymd(t) ? "is-today" : "", plan.days.includes(wd) ? "class" : ""].join(" ");
    return `<span class="wk ${cls}" title="${dateLabel(d)}">${name}</span>`;
  }).join("");
  const st = streakDays();
  $("mStreak").textContent = st
    ? `${st} ${plural(st, "день", "дня", "дней")} подряд — не прерывайте серию`
    : "Занимайтесь каждый день — точкой отмечены дни занятий";

  // Мои книги
  $("mBooks").innerHTML = BOOKS.map(
    (b, i) => `<a class="b-tile" href="${b.href}"><span class="tile-cover">${coverHTML(i)}</span><span class="b-name">${BOOK_RU[i]}</span></a>`,
  ).join("");

  // Итоги
  const passed = plan.passed || 0;
  const lw = learnedWords();
  const stats = [
    [passed, plural(passed, "урок сдан", "урока сдано", "уроков сдано")],
    [lw, plural(lw, "слово выучено", "слова выучено", "слов выучено")],
    [st, plural(st, "день подряд", "дня подряд", "дней подряд")],
  ];
  $("mStats").innerHTML = stats.map(([n, l]) => `<div class="m-stat"><span class="m-stat-num">${n}</span><span class="m-stat-label">${l}</span></div>`).join("");
}

function showMain() {
  setView("main");
  lastTab = "main";
  document.title = "Arabic";
  renderMain();
}

$("goalRing").onclick = openToday;
$("gaugeLink").onclick = openToday;
$("mAssignedHead").onclick = openToday;
$("mAssigned").addEventListener("click", (e) => e.target.closest("[data-open-today]") && openToday());
$("mNext").onclick = () => {
  const step = $("mNext").dataset.step;
  if (!step) return openToday();
  goStep(step);
};

renderHomeToday();

// ── Инициализация ───────────────────────────────────────
route();

// PWA: офлайн-кэш и установка на экран «Домой»
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
