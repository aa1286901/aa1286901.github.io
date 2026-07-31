/**
 * Колос — Пекарня
 * Электронное меню — мобильная оптимизация
 */

// Данные о товарах
const products = [
    // === ХИНКАЛ ===
    {
        id: 1,
        name: 'Курзе с мясом',
        description: 'Традиционные дагестанские курзе с сочной мясной начинкой',
        weight: '1 кг',
        calories: 280,
        price: 680,
        category: 'fabric',
        image: 'assets/images/kurze_miaso.svg'
    },
    {
        id: 2,
        name: 'Курзе с творогом',
        description: 'Нежные курзе с домашним творогом и зеленью',
        weight: '1 кг',
        calories: 220,
        price: 450,
        category: 'fabric',
        image: 'assets/images/kurze_tvorog.svg'
    },
    {
        id: 3,
        name: 'Курзе с картошкой',
        description: 'Сытные курзе с картофельным пюре и луком',
        weight: '1 кг',
        calories: 240,
        price: 300,
        category: 'fabric',
        image: 'assets/images/kurze_kartoshka.svg'
    },
    {
        id: 4,
        name: 'Курзе с курицей',
        description: 'Диетические курзе с нежным куриным филе',
        weight: '1 кг',
        calories: 200,
        price: 500,
        category: 'fabric',
        image: 'assets/images/kurze_kuritsa.svg'
    },
    {
        id: 5,
        name: 'Пельмени мясные',
        description: 'Классические пельмени с рубленым мясом',
        weight: '1 кг',
        calories: 320,
        price: 680,
        category: 'fabric',
        image: 'assets/images/pelmeni_miasnye.svg'
    },
    {
        id: 6,
        name: 'Пельмени куриные',
        description: 'Сочные пельмени с куриным фаршем',
        weight: '1 кг',
        calories: 280,
        price: 500,
        category: 'fabric',
        image: 'assets/images/pelmeni_kuritsnye.svg'
    },
    {
        id: 7,
        name: 'Манты с картофелем и мясом',
        description: 'Манты с комбинированной начинкой на пару',
        weight: '1 кг',
        calories: 300,
        price: 660,
        category: 'fabric',
        image: 'assets/images/manty_kartofel_miaso.svg'
    },
    {
        id: 8,
        name: 'Манты с мясом',
        description: 'Традиционные манты с рубленым мясом на пару',
        weight: '1 кг',
        calories: 310,
        price: 680,
        category: 'fabric',
        image: 'assets/images/manty_miaso.svg'
    },
    {
        id: 9,
        name: 'Парной с ореховой травой',
        description: 'Паровой хинкал с ароматной травой',
        weight: '1 кг',
        calories: 180,
        price: 400,
        category: 'fabric',
        image: 'assets/images/parnoy_oreh.svg'
    },
    {
        id: 10,
        name: 'Парной хинкал',
        description: 'Классический паровой хинкал',
        weight: '1 кг',
        calories: 170,
        price: 380,
        category: 'fabric',
        image: 'assets/images/parnoy_hinkal.svg'
    },
    {
        id: 11,
        name: 'Парной зебра',
        description: 'Двухцветный хинкал на пару',
        weight: '1 кг',
        calories: 190,
        price: 500,
        category: 'fabric',
        image: 'assets/images/parnoy_zebra.svg'
    },
    {
        id: 12,
        name: 'Хинкал тонкий',
        description: 'Тонкие лепешки хинкала',
        weight: '1 кг',
        calories: 150,
        price: 230,
        category: 'fabric',
        image: 'assets/images/hinkal_tonkiy.svg'
    },
    {
        id: 13,
        name: 'Хинкал лакский',
        description: 'Маленькие квадратики из пресного теста',
        weight: '1 кг',
        calories: 140,
        price: 230,
        category: 'fabric',
        image: 'assets/images/hinkal_laksky.svg'
    },
    {
        id: 14,
        name: 'Хинкал аварский',
        description: 'Ромбовидные кусочки в бульоне',
        weight: '1 кг',
        calories: 160,
        price: 300,
        category: 'fabric',
        image: 'assets/images/hinkal_aversky.svg'
    },
    // === ГОРЯЧИЕ БЛЮДА ===
    {
        id: 15,
        name: 'Куриные отбивные',
        description: 'Сочные отбивные в золотистой панировке',
        weight: '1 кг',
        calories: 350,
        price: 1030,
        category: 'hot',
        image: 'assets/images/otbivnye_kuritsnye.svg'
    },
    {
        id: 16,
        name: 'Куриные отбивные с грибами',
        description: 'С шампиньонами в сливочном соусе',
        weight: '280 г',
        calories: 380,
        price: 1040,
        category: 'hot',
        image: 'assets/images/otbivnye_gribyami.svg'
    },
    {
        id: 17,
        name: 'Куриные котлеты',
        description: 'Домашние котлеты из куриного фарша',
        weight: '200 г',
        calories: 300,
        price: 920,
        category: 'hot',
        image: 'assets/images/kotlety_kuritsnye.svg'
    },
    {
        id: 18,
        name: 'Тефтели говяжьи',
        description: 'Нежные тефтели в томатном соусе',
        weight: '250 г',
        calories: 280,
        price: 900,
        category: 'hot',
        image: 'assets/images/tefteli_govyazhi.svg'
    },
    {
        id: 19,
        name: 'Долма',
        description: 'Виноградные листья с мясом и рисом',
        weight: '250 г',
        calories: 260,
        price: 900,
        category: 'hot',
        image: 'assets/images/dolma.svg'
    },
    {
        id: 20,
        name: 'Голубцы',
        description: 'С мясом и рисом в томатном соусе',
        weight: '300 г',
        calories: 270,
        price: 900,
        category: 'hot',
        image: 'assets/images/golubtsy.svg'
    },
    {
        id: 21,
        name: 'Фрикадельки куриные',
        description: 'Воздушные фрикадельки в бульоне',
        weight: '200 г',
        calories: 220,
        price: 650,
        category: 'hot',
        image: 'assets/images/frikadelki_kuritsnye.svg'
    },
    {
        id: 22,
        name: 'Фрикадельки говяжьи',
        description: 'Сочные фрикадельки с травами',
        weight: '220 г',
        calories: 290,
        price: 900,
        category: 'hot',
        image: 'assets/images/frikadelki_govyazhi.svg'
    },
    {
        id: 23,
        name: 'Наггетсы',
        description: 'Хрустящие куриные наггетсы',
        weight: '180 г',
        calories: 340,
        price: 500,
        category: 'hot',
        image: 'assets/images/naggetsy.svg'
    },
    {
        id: 24,
        name: 'Сырники',
        description: 'Домашние сырники из творога',
        weight: '200 г',
        calories: 250,
        price: 500,
        category: 'hot',
        image: 'assets/images/syrniki.svg'
    },
    // === ЧУДУ ===
    {
        id: 25,
        name: 'Чуду картошка с курицей',
        description: 'Тонкое дагестанское чуду с картофелем и курицей',
        weight: '350 г',
        price: 300,
        category: 'chudu',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 26,
        name: 'Чуду картошка с мясом',
        description: 'Тонкое дагестанское чуду с картофелем и мясом',
        weight: '350 г',
        price: 300,
        category: 'chudu',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 27,
        name: 'Чуду с творогом',
        description: 'Тонкое дагестанское чуду с творогом и зеленью',
        weight: '350 г',
        price: 300,
        category: 'chudu',
        image: 'assets/images/placeholder.svg'
    },
    // === ВЫПЕЧКА ===
    {
        id: 28,
        name: 'Хлеб домашний',
        description: 'Мягкий домашний хлеб с хрустящей корочкой',
        price: 40,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 29,
        name: 'Цельнозерновой',
        description: 'Полезный хлеб из цельнозерновой муки',
        price: 30,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 30,
        name: 'Цельнозерновой семечки лён',
        description: 'Цельнозерновой хлеб с семечками и льном',
        price: 45,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 31,
        name: 'Молочный',
        description: 'Нежный молочный хлеб с воздушным мякишем',
        price: 90,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 32,
        name: 'Буханка',
        description: 'Классическая буханка с золотистой корочкой',
        price: 40,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 33,
        name: 'Бездрожжевая буханка',
        description: 'Хлеб на закваске без дрожжей',
        price: 30,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 34,
        name: 'Булочка цельнозерновая',
        description: 'Маленькая булочка из цельнозерновой муки',
        price: 25,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 35,
        name: 'Булочка кукурузная',
        description: 'Воздушная булочка из кукурузной муки',
        price: 25,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 36,
        name: 'Бургерная булочка',
        description: 'Идеальная булочка для бургеров с кунжутом',
        price: 40,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 37,
        name: 'Булочки сладкие разные',
        description: 'Ассорти сладких булочек с разными начинками',
        price: 60,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 38,
        name: 'Симит',
        description: 'Кольцевой хлеб с кунжутом, турецкая классика',
        price: 25,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 39,
        name: 'Багет',
        description: 'Хрустящий французский багет',
        price: 18,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 40,
        name: 'Кукурузный багет',
        description: 'Багет с добавлением кукурузной муки',
        price: 20,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 41,
        name: 'Батон',
        description: 'Нарезной батон для завтраков и бутербродов',
        price: 40,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 42,
        name: 'Хайчу',
        description: 'Традиционная дагестанская лепешка хайчу',
        price: 75,
        category: 'bakery',
        image: 'assets/images/placeholder.svg'
    },
    // === ПИРОЖКИ ===
    {
        id: 43,
        name: 'Пирожки курица с грибами',
        description: 'Жареные пирожки с курицей и грибами',
        weight: '100 г',
        price: 50,
        category: 'pies',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 44,
        name: 'Пирожки с картошкой',
        description: 'Жареные пирожки с картофельным пюре',
        weight: '100 г',
        price: 40,
        category: 'pies',
        image: 'assets/images/placeholder.svg'
    },
    {
        id: 45,
        name: 'Пирожки с сосиской',
        description: 'Жареные пирожки с сосиской',
        weight: '100 г',
        price: 50,
        category: 'pies',
        image: 'assets/images/placeholder.svg'
    }
];

// DOM элементы
const menuContainer = document.getElementById('menuContainer');
const searchInput = document.getElementById('searchInput');
const noResults = document.getElementById('noResults');
const categoryButtons = document.querySelectorAll('.category-btn');

// Состояние
let currentCategory = 'all';
let currentSearch = '';

// Категории
const categories = {
    bakery: { name: 'Выпечка', icon: 'fas fa-cheese' },
    pies: { name: 'Пирожки', icon: 'fa-cookie-bite' },
    fabric: { name: 'Полуфабрикаты', icon: 'fas fa-utensils' },
    hot: { name: 'Горячие блюда', icon: 'fa-fire' },
    chudu: { name: 'Чуду', icon: 'fa-pizza-slice' }
};

// WhatsApp номер
const WA_PHONE = '+79896506131';

/**
 * Форматирование цены
 */
function formatPrice(price) {
    return price.toLocaleString('ru-RU') + ' ₽';
}

/**
 * Создание ссылки WhatsApp для заказа блюда
 */
function getWhatsAppLink(product) {
    const text = `Здравствуйте! Хочу заказать: ${product.name} — ${formatPrice(product.price)}`;
    return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;
}

/**
 * Создание карточки блюда
 */
function createDishCard(product) {
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.dataset.category = product.category;
    card.dataset.name = product.name.toLowerCase();

    const weightHTML = product.weight
        ? `<span class="dish-weight"><i class="fas fa-weight-hanging"></i> ${product.weight}</span>`
        : '';

    const caloriesHTML = product.calories
        ? `<span class="dish-calories"><i class="fas fa-fire"></i> ${product.calories}</span>`
        : '';

    card.innerHTML = `
        <div class="dish-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy"
                 onerror="this.src='assets/images/placeholder.svg'">
        </div>
        <div class="dish-info">
            <div class="dish-top">
                <h3 class="dish-name">${product.name}</h3>
                <span class="dish-price">${formatPrice(product.price)}</span>
            </div>
            <p class="dish-description">${product.description}</p>
            <div class="dish-bottom">
                <div class="dish-meta">
                    ${weightHTML}
                    ${caloriesHTML}
                </div>
                <a href="${getWhatsAppLink(product)}" class="dish-order-btn" target="_blank" rel="noopener">
                    <i class="fab fa-whatsapp"></i>
                    <span>Заказать</span>
                </a>
            </div>
        </div>
    `;

    return card;
}

/**
 * Рендеринг меню
 */
function renderMenu() {
    const filtered = products.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(currentSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    menuContainer.innerHTML = '';

    if (filtered.length === 0) {
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');

    // Группировка по категориям
    const grouped = {};
    filtered.forEach(product => {
        if (!grouped[product.category]) grouped[product.category] = [];
        grouped[product.category].push(product);
    });

    // Рендеринг
    Object.keys(categories).forEach(catKey => {
        if (!grouped[catKey] || grouped[catKey].length === 0) return;

        const cat = categories[catKey];
        const section = document.createElement('div');
        section.className = 'category-section';
        section.id = `category-${catKey}`;

        section.innerHTML = `
            <div class="category-header">
                <h2 class="category-title">
                    <i class="fas ${cat.icon}"></i>
                    ${cat.name}
                </h2>
                <span class="category-count">${grouped[catKey].length} блюд</span>
            </div>
        `;

        const list = document.createElement('div');
        list.className = 'dish-list';

        grouped[catKey].forEach((product, index) => {
            const card = createDishCard(product);
            card.style.animationDelay = `${index * 0.04}s`;
            list.appendChild(card);
        });

        section.appendChild(list);
        menuContainer.appendChild(section);
    });
}

// === ОБРАБОТЧИКИ ===

if (searchInput) {
    let searchTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            currentSearch = e.target.value;
            renderMenu();
        }, 200);
    });
}

categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderMenu();
    });
});

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
});
