# Fasad AI — MVP

**Fasad AI** — веб-приложение для создания реалистичного дизайна фасадов зданий с облицовкой природным и дагестанским камнем.

Сфотографируйте дом → Выберите материалы → Получите результат.

## Как работает приложение

Приложение — инструмент прораба на встрече с заказчиком.

**Каталог** (вкладка «Каталог») — показать заказчику материал:
- 20 видов камня «Камень Юг»: фактура, фото плитки, характеристики;
- на странице камня — образец облицовки этим камнем: фаска (без фаски, скос, скруглённая, вогнутая, четверть), пиленая или отбитая поверхность, формат, толщина (видно на объёмной плитке), раскладка и шов;
- изделия «из этого камня»: карнизы, наличники и подоконники, замки, зубцы, плинтусы, русты, консоли;
- раздел «Изделия»: все изделия каталога с моделями и размерами, любое можно показать в любом камне.

**Подбор фасада** — сфотографировать дом и выбрать по частям: основная плитка, цоколь, верхний и межэтажный карнизы, цокольный карниз/плинтус, обрамление окон (наличник, замок, подоконник, консоли), зубцы, русты на углах, колонны и пилястры, балюстрада, размер здания. Итог — спецификация: её можно отправить заказчику и сохранить в проекты. По ней будет работать ИИ-генерация изображения (следующий этап).

Образцы плитки и изделия в выбранном камне рисуются прямо на телефоне (`js/stone-preview.js`).

## Каталог

Каталог собирается из PDF «Камень Юг — каталог 2024» скриптом `scripts/fasad_build_catalog.py`. Каждая картинка изделия связывается с подписью под ней по положению на странице, поэтому названия, модели и размеры — как в PDF.

- `data/materials.json` — камень: фактура (`assets/textures/stones/`), фото плитки (`assets/catalog/slabs/`), описание, характеристики, форматы и толщины;
- `data/catalog.json` — разделы изделий с вариантами размеров (`assets/catalog/`) и варианты отделки плитки.

## Технологии

- **Frontend:** HTML5, CSS3, Vanilla JavaScript ES6+
- **Backend:** PHP 8.x (без фреймворков)
- **База данных:** MySQL / MariaDB
- **Каталог материалов:** JSON-файлы
- **Библиотеки:** GSAP (опционально, для анимаций)

## Требования

- PHP 8.0+
- MySQL 5.7+ / MariaDB 10.3+
- Apache (mod_rewrite)
- Расширения PHP: `pdo_mysql`, `fileinfo`, `json`

## Установка

### 1. Загрузка файлов

Загрузите все файлы проекта на ваш хостинг (shared hosting).

### 2. База данных — JSON-файл (без MySQL!)

**Никакой MySQL, никаких паролей, никаких phpMyAdmin!**

База данных хранится в одном файле: `data/db.php` (JSON с PHP-заглушкой в первой строке — по прямой ссылке файл не открывается). Демо-данные для новой установки — `data/seed.json`

В нём уже есть:
- ✅ 1 демо-пользователь (`magomed@fasad.ai` / `demo123`)
- ✅ 3 демо-проекта с материалами и карнизами

**Просто загрузите файлы — и всё работает!**

### 3. Права на директории

```bash
chmod 755 uploads/originals/
chmod 755 uploads/generated/
```

## Локальный запуск

```bash
cd fasad
php -S localhost:8000
```

Откройте `http://localhost:8000`.

## Структура проекта

```
fasad/
├── index.html              # Все экраны приложения
├── css/                    # Стили
│   ├── variables.css       # CSS-переменные (цвета, радиусы, тени)
│   ├── reset.css           # Сброс стилей
│   ├── base.css            # Базовые стили, типографика
│   ├── components.css      # Компоненты (кнопки, карточки, карусели)
│   ├── layout.css          # Layout и экраны
│   └── responsive.css      # Адаптивность
├── js/                     # JavaScript модули
│   ├── app.js              # Главный модуль, инициализация
│   ├── api.js              # API-клиент (fetch-обёртка)
│   ├── auth.js             # Авторизация
│   ├── router.js           # Роутинг экранов
│   ├── projects.js         # Состояние проекта
│   ├── materials.js        # Загрузка каталога из JSON
│   ├── camera.js           # Камера и загрузка фото
│   ├── generation.js       # Service генерации (Mock/Real)
│   ├── catalog.js          # Логика каталога
│   ├── profile.js          # Логика профиля
│   ├── ui.js               # UI-хелперы (toast, modal, рендеры)
│   └── screens.js          # Логика каждого экрана
├── api/                    # PHP API endpoints
│   ├── config.php          # Конфигурация, общие функции
│   ├── auth/               # Регистрация, вход, выход
│   ├── projects/           # CRUD проектов
│   ├── upload/             # Загрузка фото
│   ├── generation/         # Старт и статус генерации
│   └── user/               # Избранное
├── data/                   # JSON-каталоги
│   ├── materials.json      # Материалы (камень, плитка)
│   └── cornices.json       # Карнизы и элементы
├── assets/                 # Статические файлы
│   ├── materials/          # Фото материалов
│   └── cornices/           # Фото карнизов
├── uploads/                # Загруженные файлы
│   ├── originals/          # Исходные фото
│   └── generated/          # Результаты генерации
├── database/
│   └── app.sql             # Схема БД + демо-данные
├── .htaccess               # Правила Apache
└── README.md               # Этот файл
```

## API Endpoints

### Auth
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/register.php` | Регистрация |
| POST | `/api/auth/login.php` | Вход |
| POST | `/api/auth/logout.php` | Выход |
| GET | `/api/auth/me.php` | Текущий пользователь |

### Projects
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/projects/create.php` | Список проектов |
| POST | `/api/projects/create.php` | Создать проект |
| GET | `/api/projects/get.php?id=` | Получить проект |
| DELETE | `/api/projects/delete.php?id=` | Удалить проект |

### Upload
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/upload/original.php` | Загрузить фото |

### Generation
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/generation/start.php` | Запустить генерацию |
| GET | `/api/generation/status.php?id=` | Статус генерации |

### Favorites
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/user/favorites/list.php` | Список избранного |
| POST | `/api/user/favorites/add.php` | Добавить в избранное |
| POST | `/api/user/favorites/remove.php` | Удалить из избранного |

## Структура БД

| Таблица | Описание |
|---------|----------|
| `users` | Пользователи (id, name, email, password_hash, avatar) |
| `projects` | Проекты (id, user_id, name, images, status, progress) |
| `project_materials` | Материалы проекта (project_id, material_id, category) |
| `project_cornices` | Карнизы проекта (project_id, cornice_id, position, variant) |
| `user_favorites` | Избранное (user_id, material_id) |

## JSON-каталог

Материалы хранятся в `/data/materials.json` и `/data/cornices.json`.

Структура материала:
```json
{
  "id": "derbent",
  "name": "Дербентский камень",
  "category": "stone",
  "type": "stone",
  "image": "/assets/materials/derbent.jpg",
  "description": "Описание...",
  "active": true
}
```

Для добавления нового материала — просто добавьте объект в JSON. JavaScript не требует изменений.

## Подключение реального AI API

1. Создайте провайдер в `js/generation.js`:

```javascript
class RealAIProvider extends GenerationProvider {
    async start(projectId, materials, cornices) {
        // Вызов вашего AI API
        const response = await fetch('YOUR_AI_ENDPOINT', {
            method: 'POST',
            body: JSON.stringify({ projectId, materials, cornices })
        });
        return response.json();
    }
}
```

2. Замените в `GenerationService.init()`:

```javascript
init() {
    this.provider = new RealAIProvider('https://api.example.com/generate', 'your-api-key');
}
```

3. Backend в `api/generation/start.php` — передаёт данные AI, получает `generated_image_url`.

## За пределами MVP

Не реализовано (но архитектура позволяет добавить):

- Реальный AI API
- Платежи и подписки
- Расчёт площади и количества камня
- 3D / AR просмотр
- Сметы
- Социальная лента
- Push-уведомления
- Расширенная админка

## Лицензия

© 2026 Fasad AI
