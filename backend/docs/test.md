# 🎮 Dev Nexus - USOF Backend

**Українська спільнота геймдев розробників**

API для форуму професійних та аматорських розробників ігор в Україні. Підтримує обговорення по Unreal Engine, Unity, Godot, індігеймдев та створенню власних ігрових рушіїв.

## 🚀 Особливості

- **MVC архітектура** з SOLID принципами
- **JWT автентифікація** з підтвердженням email
- **Система ролей** (користувач/адмін)
- **CRUD операції** для всіх сутностей
- **Система лайків/дизлайків**
- **Категорії постів** (gamedev спрямованість)
- **Статуси постів/коментарів** (активний/неактивний)
- **Сортування та фільтрація**
- **Rate limiting та валідація**
- **Завантаження аватарів**

## 🛠 Технологічний стек

- **Backend**: Node.js, Express.js
- **База даних**: MySQL
- **Автентифікація**: JWT, bcrypt
- **Email**: nodemailer (Gmail SMTP)
- **Файли**: multer
- **Інше**: cookie-parser, cors, uuid

## 📋 Вимоги

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm або yarn

## ⚙️ Установка

1. **Клонування репозиторію**
```bash
git clone <repository-url>
cd USOF_backend
```

2. **Установка залежностей**
```bash
npm install
```

3. **Налаштування конфігурації**
Перевірте `config.json` та оновіть:
- Параметри підключення до MySQL
- Налаштування email (Gmail)
- JWT секрет

4. **Ініціалізація бази даних**
Створіть базу даних вручну та виконайте SQL скрипт:
```bash
mysql -u root -p < db/db.sql
```

5. **Запуск сервера**
```bash
# Виробничий режим
npm start

# Режим розробки (з nodemon)
npm run dev
```

## 🗄️ База даних

### Структура таблиць:

- **users** - користувачі системи
- **posts** - пости форуму
- **categories** - категорії (gamedev тематика)
- **comments** - коментарі до постів
- **likes** - лайки/дизлайки постів та коментарів
- **post_categories** - зв'язок постів з категоріями

### Категорії за замовчуванням:
- Unreal Engine
- Unity
- Godot
- Game Design
- Programming
- Art & Animation
- Audio
- Indie Development
- Mobile Games
- VR/AR

## 🔐 Автентифікація

API використовує JWT токени для автентифікації. Токен можна передавати:
- В заголовку: `Authorization: Bearer <token>`
- В cookies: `auth_token=<token>`

### Ролі користувачів:
- **user** - звичайний користувач
- **admin** - адміністратор з розширеними правами

## 📚 API Ендпоінти

### Автентифікація
```
POST /api/auth/register     - Реєстрація
POST /api/auth/login        - Вхід
POST /api/auth/logout       - Вихід
POST /api/auth/password-reset - Скидання паролю
GET  /api/auth/me           - Поточний користувач
```

### Користувачі
```
GET    /api/users           - Всі користувачі (admin)
GET    /api/users/:id       - Користувач за ID
POST   /api/users           - Створити користувача (admin)
PATCH  /api/users/:id       - Оновити користувача
DELETE /api/users/:id       - Видалити користувача (admin)
PATCH  /api/users/avatar    - Завантажити аватар
```

### Пости
```
GET    /api/posts           - Всі пости (з фільтрами)
GET    /api/posts/:id       - Пост за ID
POST   /api/posts           - Створити пост
PATCH  /api/posts/:id       - Оновити пост
DELETE /api/posts/:id       - Видалити пост
GET    /api/posts/:id/comments - Коментарі поста
POST   /api/posts/:id/comments - Створити коментар
GET    /api/posts/:id/like  - Лайки поста
POST   /api/posts/:id/like  - Лайкнути пост
DELETE /api/posts/:id/like  - Видалити лайк
```

### Категорії
```
GET    /api/categories      - Всі категорії
GET    /api/categories/:id  - Категорія за ID
POST   /api/categories      - Створити категорію (admin)
PATCH  /api/categories/:id  - Оновити категорію (admin)
DELETE /api/categories/:id  - Видалити категорію (admin)
GET    /api/categories/:id/posts - Пости категорії
```

### Коментарі
```
GET    /api/comments/:id    - Коментар за ID
PATCH  /api/comments/:id    - Оновити коментар
DELETE /api/comments/:id    - Видалити коментар
GET    /api/comments/:id/like - Лайки коментаря
POST   /api/comments/:id/like - Лайкнути коментар
DELETE /api/comments/:id/like - Видалити лайк
```

## 🔍 Фільтрація та сортування

### Пости:
```
GET /api/posts?sort=likes&page=1&limit=20
GET /api/posts?category=1&status=active
GET /api/posts?date_from=2025-01-01&date_to=2025-12-31
```

### Параметри:
- `sort`: date, likes, title
- `category`: ID категорії
- `status`: active, inactive (admin)
- `date_from`, `date_to`: фільтр по даті
- `page`, `limit`: пагінація

## 📧 Email сервіс

Система відправляє email для:
- Підтвердження реєстрації
- Скидання паролю
- Сповіщення про коментарі (Creative функція)

## 🛡️ Безпека

- **Rate limiting**: обмеження кількості запитів
- **Валідація даних**: перевірка всіх вхідних даних
- **SQL Injection**: захист через prepared statements
- **XSS**: очищення HTML контенту
- **Автентифікація**: JWT токени з expiration
- **Права доступу**: перевірка ролей та власності ресурсів

## 🧪 Тестування

Для тестування API рекомендується використовувати Postman або подібні інструменти.

Приклад запиту реєстрації:
```json
POST /api/auth/register
{
  "login": "gamedev_user",
  "password": "SecurePass123",
  "password_confirmation": "SecurePass123",
  "email": "user@example.com",
  "full_name": "Іван Петренко"
}
```

## 📁 Структура проєкту

```
USOF_backend/
├── config.json           # Конфігурація
├── index.js              # Головний файл сервера
├── package.json          # Залежності проєкту
├── controllers/          # Контролери (бізнес-логіка)
├── models/               # Моделі даних
├── routes/               # Маршрути API
├── middleware/           # Middleware функції
├── services/             # Сервіси (email)
├── utils/                # Утилітарні функції
├── scripts/              # Скрипти ініціалізації
├── db/                   # SQL скрипти
└── public/               # Статичні файли
    └── user/             # Аватари користувачів
```

## 🐛 Логи та помилки

Сервер логує всі запити та помилки в консоль. У виробничому режимі рекомендується використовувати winston або подібні бібліотеки для логування.

## 🔄 API Версіонування

Поточна версія API: **v1.0.0**

## 📞 Підтримка

Для питань та багрепортів створюйте issue в репозиторії проєкту.

---

**Dev Nexus** - разом будуємо майбутнє українського геймдеву! 🇺🇦🎮