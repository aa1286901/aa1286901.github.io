// --- НАСТРОЙКИ ---
const PHONE_NUMBER = '79634150424'; 

// ИЗМЕНЕНИЕ: Теперь для каждого бренда свой список категорий
const categories = {
    fengbao: [
  { id: 'all', label: 'Все' },
  { id: 'sets', label: 'Наборы инструментов' },
  { id: 'drill', label: 'Шуруповерты и перфораторы' },
  { id: 'impact', label: 'Гайковерты и винтоверты' },
  { id: 'grinder', label: 'УШМ и пилы' },
  { id: 'laser', label: 'Измерительные инструменты и лазеры' },
  { id: 'other', label: 'Другие инструменты' },
  { id: 'bare', label: 'Тушки (без аккумуляторов)' },
  { id: 'battery', label: 'Аккумуляторы и зарядные устройства' },
  { id: 'accessory', label: 'Комплектующие и расходники' }
    ],
    ruiba: [
        { id: 'all', label: 'Все' },
        { id: 'laser', label: 'Лазерные уровни' },
        { id: 'body', label: 'Электроинструмент' },
        { id: 'consumables', label: 'Расходка' },
        { id: 'other', label: 'Другое' }
    ]
};

// --- СОСТОЯНИЕ ---
let currentBrand = 'fengbao';
let currentCategory = 'all';
let productsData = [];
let cart = {}; 

// --- ЭЛЕМЕНТЫ DOM ---
const grid = document.getElementById('product-list');
const catList = document.getElementById('category-list');
const cartBar = document.getElementById('cart-bar');

// 1. Загрузка данных (JSON)
async function loadBrandData(brand) {
    grid.style.opacity = '0.5';
    try {
        const response = await fetch('json/'+`${brand}.json`);
        if(!response.ok) throw new Error('Ошибка JSON');
        
        productsData = await response.json();
        currentBrand = brand;
        currentCategory = 'all'; // При смене бренда всегда сбрасываем на "Все"
        
        renderCategories();
        renderProducts();
        grid.style.opacity = '1';
    } catch (error) {
        console.error(error);
        grid.innerHTML = '<p style="text-align:center; padding:20px;">Ошибка загрузки. Проверь файлы JSON.</p>';
    }
}

// 2. Рендер кнопок категорий (ОБНОВЛЕНО)
function renderCategories() {
    catList.innerHTML = '';
    
    // Берем категории ТОЛЬКО для текущего бренда
    const brandCats = categories[currentBrand] || [];

    brandCats.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `cat-pill ${cat.id === currentCategory ? 'active' : ''}`;
        btn.innerText = cat.label;
        btn.onclick = () => {
            currentCategory = cat.id;
            renderCategories();
            renderProducts();
        };
        catList.appendChild(btn);
    });
}

// 3. Рендер карточек товаров
function renderProducts() {
    grid.innerHTML = '';
    
    const filtered = productsData.filter(item => {
        if (currentCategory === 'all') return true;
        return item.cat === currentCategory;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#555;">В этой категории пусто</div>';
        return;
    }

    filtered.forEach(product => {
        const uniqueId = `${currentBrand}_${product.id}`;
        const currentQty = cart[uniqueId] ? cart[uniqueId].qty : 0;
        const rawPrice = parseInt(product.price.replace(/\D/g, ''));
        
        // Картинка (заглушка)
        const imgText = product.cat === 'sets' ? 'SET' : product.name.split(' ')[0];
        const imgUrl = `img/${product.id}.png`;

        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            ${product.isNew ? '<div class="badge-new">NEW</div>' : ''}
            <div class="card-image-wrapper">
                <img src="${imgUrl}" class="card-image" loading="lazy" alt="${product.name}">
            </div>
            <div class="card-content">
                <h3 class="card-title">${product.name}</h3>
                <p class="card-desc">${product.desc}</p>
                
                <div style="margin-top: auto; margin-bottom: 12px;">
                    <span class="card-price" style="font-size: 17px;">${product.price}</span>
                </div>
                
                <div class="card-actions">
                    <div class="stepper ${currentQty === 0 ? 'is-zero' : ''}" id="stepper-${uniqueId}" style="width: 100%;">
                        <button class="stepper-btn minus" onclick="updateQty('${uniqueId}', -1, ${rawPrice}, '${product.name}')">−</button>
                        <span class="stepper-val" id="val-${uniqueId}" style="flex-grow: 1;">${currentQty}</span>
                        <button class="stepper-btn plus" onclick="updateQty('${uniqueId}', 1, ${rawPrice}, '${product.name}')">
                            <span>+</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 4. Логика Корзины (+/-)
window.updateQty = function(uniqueId, change, price, name) {
    if (!cart[uniqueId]) {
        cart[uniqueId] = { qty: 0, price: price, name: name };
    }
    
    cart[uniqueId].qty += change;
    
    const stepper = document.getElementById(`stepper-${uniqueId}`);
    const valSpan = document.getElementById(`val-${uniqueId}`);
    
    if (stepper && valSpan) {
        if (cart[uniqueId].qty <= 0) {
            stepper.classList.add('is-zero');
            valSpan.innerText = 0;
        } else {
            stepper.classList.remove('is-zero');
            valSpan.innerText = cart[uniqueId].qty;
        }
    }

    if (cart[uniqueId].qty <= 0) delete cart[uniqueId];
    
    updateCartBar();
};

function updateCartBar() {
    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = Object.values(cart).reduce((sum, item) => sum + (item.qty * item.price), 0);
    
    if (totalItems > 0) {
        cartBar.classList.add('active');
        document.querySelector('.cart-count').innerText = `${totalItems} поз.`;
        document.querySelector('.cart-total').innerText = `${totalPrice.toLocaleString()} ₽`;
    } else {
        cartBar.classList.remove('active');
    }
}

// 5. Заказ в WhatsApp
window.checkoutWhatsApp = function() {
    let message = "👋 Здравствуйте! Хочу оформить заказ:\n\n";
    let total = 0;
    
    for (const [key, item] of Object.entries(cart)) {
        const subtotal = item.qty * item.price;
        total += subtotal;
        message += `🔹 ${item.name} — ${item.qty} шт. (${subtotal.toLocaleString()} ₽)\n`;
    }
    
    message += `\n💰 *Итого: ${total.toLocaleString()} ₽*`;
    
    const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

// 6. Переключение вкладок
window.switchBrand = function(brand) {
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    
    const tabs = document.querySelectorAll('.tab-item');
    if(brand === 'fengbao') tabs[0].classList.add('active');
    if(brand === 'ruiba') tabs[1].classList.add('active');

    loadBrandData(brand);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Старт
document.addEventListener('DOMContentLoaded', () => {
    switchBrand('fengbao');
});
