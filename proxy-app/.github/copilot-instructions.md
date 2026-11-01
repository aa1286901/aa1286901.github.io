# ahmedov.proxy - AI Coding Guidelines

## Project Overview

**ahmedov.proxy** — PWA-приложение для продажи и управления прокси-подписками (Telegram/WhatsApp). Приложение строится на трёхслойной архитектуре:

- **Frontend**: SPA на vanilla JS (2600+ строк в `assets/js/app.js`)
- **Backend API**: PHP 8+ с SQLite БД (`api/index.php` — точка входа, 1500+ строк)
- **Service Worker**: кеширование с правилами отключения кеша для JS/CSS (`sw.js`)

Ключевая особенность: приложение поддерживает развёртывание как в корне (`/`), так и в поддиректории (`/proxy/`).

## Architecture & Data Flow

### Frontend State Management (`app.js`)

```javascript
const state = {
  token: "", // JWT токен из localStorage
  role: "user", // "user" или "admin"
  activeTab: "home", // навигация между табами
  pwaBlocked: false, // блокировка без PWA
  subscription: null, // текущая подписка пользователя
  paymentPage: {...}, // состояние платежной страницы
  admin: {...}, // административная панель
};
```

**Ключевые моменты:**
- Состояние синхронизируется с localStorage (ключи: `ahmedov_proxy_jwt`, `ahmedov_proxy_tab`, `ahmedov_proxy_pending_payment`)
- API вызовы идут на `window.AHMEDOV_CONFIG.apiBase` — инициализируется в `index.html` скриптом, учитывает localhost vs production
- Каждый запрос содержит `Authorization: Bearer {token}`

### Backend API Routing (`api/index.php`)

API построено на простом switch/case маршрутизаторе. Ключевые точки входа:

```php
// Аутентификация
POST /auth/phone - отправка OTP, получение JWT
POST /auth/verify - верификация кода

// Пользовательские данные
GET /user - получить профиль пользователя
GET /subscription - статус подписки
GET /proxies/telegram, GET /proxies/whatsapp - список прокси

// Платежи
POST /payment/plans - список тарифов
POST /payment/create - создание платежа (интеграция 2tip.ru)
POST /payment/status - статус платежа

// Админ (требует X-Admin-Key header)
GET /admin/users - список пользователей
PATCH /admin/users/{phone} - редактировать пользователя
POST /admin/proxies - управление прокси
```

**JWT схема**: signed с `JWT_SECRET` (из `.env`), TTL по умолчанию 30 дней. Payload содержит `phone`, `role`, `exp`.

### Database Schema (`api/init_db.php`)

SQLite таблицы:

```sql
users - phone (UNIQUE), subscription_type, expires_at, balance, invite_code, created_at
proxies - network (telegram/whatsapp), name, host, port, ping_ms, is_reachable, connect_url
payments - phone, plan_id, provider_token (UNIQUE), status (created/pending/success/failed), paid_at, fulfilled_at
```

Критическое: `payments.provider_token` (от 2tip.ru) используется для идентификации платежа в фронтенде.

## Critical Conventions & Patterns

### Phone Normalization
```php
// Все номера хранятся как 10 цифр (без +7)
normalize_phone("+7 900 001-0203") => "9000010203"
display_phone("9000010203") => "+7 900 001 02 03"
```
**Используется везде**: аутентификация, БД, админ-панель.

### Service Worker Caching (`sw.js`)
- **JS/CSS асеты**: НИКОГДА не кешируются (`cache: "no-store"`)
- **API запросы**: перепроходят (не используется кеш)
- **Статические файлы** (иконки, manifest): кешируются с обновлением при next visit
- **Документы** (HTML): кешируются как fallback

**Версионирование**: фронтенд генерирует версию в `index.html`:
```javascript
assetVersion = `${Date.now().toString(36)}-${Math.random()...}`
```
Передаётся в query param (`?v=...`), принудительно обходит браузерный кеш.

### Admin Authentication
Два варианта доступа:
1. **Через X-Admin-Key header**: для скриптов и инструментов
2. **Через JWT с role="admin"**: для веб-интерфейса (фронтенд приглашает по коду)

Админский телефон и invite-код хранятся в `.env`:
```env
ADMIN_PHONE=9000010203
ADMIN_INVITE_CODE=0010203
```

### Multi-Path Deployment
Приложение корректно работает в двух режимах:

```
/proxy/  (поддиректория) - асеты в /proxy/assets/, API в /proxy/api/
/        (корень) - асеты в /assets/, API в /api/
```

В `index.html` фронтенд определяет базу и настраивает `AHMEDOV_CONFIG.apiBase` + `AHMEDOV_CONFIG.webBase`.

## Development Workflow

### Setup
```bash
# 1. Скопировать .env.example в .env
cp .env.example .env

# 2. Инициализировать БД
php api/init_db.php

# 3. Запустить локальный сервер (например, PHP built-in)
php -S 127.0.0.1:8080
```

### Key Scripts
- **Frontend**: `assets/js/app.js` — однофайловое SPA приложение (использует vanilla JS + DOM manipulation)
- **Backend**: `api/index.php` + `api/*.php` — модули для БД, JWT, HTTP utilities
- **Init**: `api/init_db.php` — создание таблиц и seed данных

### Environment Variables (`.env`)
```ini
JWT_SECRET=your-secret-key
DB_PATH=database/app.db
ADMIN_PHONE=9000010203
ADMIN_INVITE_CODE=0010203
FRONTEND_ORIGIN=* (или список через запятую)
PAYMENT_API_BASE=https://2tip.ru/api/v1
PAYMENT_ACCOUNT_ID=...
SUPPORT_URL=https://wa.me/79634150424
```

## Common Tasks

### Adding a New API Endpoint
1. Добавить обработчик в основной switch в `api/index.php`
2. Использовать `bearer_token()` для получения JWT, `read_json_body()` для парсинга POST
3. Использовать `json_response($payload, $status)` для ответа

### Modifying Frontend State
- Изменяющее операции должны обновить `state` напрямую, затем вызвать `render()`
- Используйте `state.activeTab` для маршрутизации, не историю браузера

### Payment Integration
- 2tip.ru API создаёт платёж, возвращает `provider_qr_url` и `provider_token`
- Фронтенд периодически проверяет статус через `POST /payment/status`
- При успехе (`fulfilled_at` !=null) система обновляет подписку пользователя

## Troubleshooting

### PWA Cache Issues
- Пользователь может добавить `?reset_cache=1` к URL — это очистит все кеши и Service Worker
- JS/CSS всегда freshные благодаря версионированию в query params

### Phone Validation Failures
- Проверьте, что номер приходит в один из форматов: `79001234567` (11 цифр) или `9001234567` (10 цифр)
- Если `normalize_phone()` вернёт пустую строку — номер некорректен

### Multi-Path Deploy Issues
- Убедитесь, что `.htaccess` правильно переписывает пути (или nginx/Apache конфиг)
- Фронтенд автоматически определяет `/proxy/` по `location.pathname`

## References

- **Frontend entry**: `index.html` → `assets/js/app.js`
- **API entry**: `api/index.php` (1518 строк)
- **Config**: `api/config.php` (парсит `.env`)
- **Service Worker**: `sw.js` (62 строки)
