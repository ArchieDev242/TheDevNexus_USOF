# USOF Backend API Documentation

настройка .env (удалить при публикации в паблик):
```
DB_HOST=localhost
DB_USER=mkopychko
DB_PASS=securepass
DB_NAME=USOF
EMAIL_USER=noreplydevnexus@gmail.com
EMAIL_PASS=asxoqhnmkbfxgntw
EMAIL_DISPLAY_NAME=Dev Nexus Support
EMAIL_DISPLAY_ADDRESS=noreply@thedevnexus.org
PORT=3000
BASE_URL=http://localhost:3000
JWT_SECRET=securepass
JWT_EXPIRES_IN=2h

ADMIN_PORT=4001
ADMIN_COOKIE_SECRET=very-secure-admin-cookie-secret-change-this-in-production
ADMIN_SESSION_SECRET=very-secure-admin-session-secret-change-this-in-production
```

## Загальна інформація

USOF (User Stack Overflow Forum) - це backend API для форуму розробників з системою постів, коментарів, лайків і дизлайків, а також системою ачівок.

### Основні можливості:
- ✅ Система автентифікації та авторизації 
- ✅ CRUD операції для користувачів, постів, коментарів, категорій
- ✅ Система лайків/дизлайків/подяк
- ✅ Система ачівок та рейтингу
- ✅ Система сповіщень
- ✅ Панель адміністрування (3 варіанти)

## Швидкий старт

1. **Встановлення залежностей:**
```bash
npm install
```

2. **Налаштування бази даних:**
```bash
mysql -u root -p < backend/db/db.sql
```

3. **Налаштування змінних середовища (.env):**
```env
# База даних
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=USOF
DB_PORT=3306

# Email (для скидання паролів)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=2h

# Сервер
PORT=3000
BASE_URL=http://localhost:3000

# Адмін панель
ADMIN_PORT=4001
ADMIN_COOKIE_SECRET=admin-cookie-secret
ADMIN_SESSION_SECRET=admin-session-secret
```

4. **Запуск сервера:**
```bash
npm start
```

Сервер буде доступний за адресою: `http://localhost:3000`

## Тестові облікові записи

### Адміністратор:
- **Login:** `admin`
- **Password:** `admin123`
- **Email:** `admin@devnexus.org`
- **Role:** `admin`

### Звичайні користувачі:
- `gamedev_ukr` / `alex@example.com` / `password123`
- `unity_master` / `maria@example.com` / `password123`
- `indie_dev` / `dmytro@example.com` / `password123`
- `artist_2d` / `anna@example.com` / `password123`

## Швидке тестування через Postman

### Крок 1: Реєстрація користувача
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
    "login": "testuser",
    "password": "password123",
    "passwordConfirm": "password123",
    "full_name": "Test User",
    "email": "test@example.com"
}
```

### Крок 2: Логін і отримання токену
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
    "login": "testuser",
    "password": "password123"
}
```
**Збережіть отриманий `token`!**

### Крок 3: Створення поста (+ ачівка "Hello, World!")
```http
POST http://localhost:3000/api/posts
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
    "title": "Мій перший пост з кодом",
    "content": "Це тестовий пост з кодом: ```javascript
console.log('Hello World!');
```",
    "categories": [1, 2]
}
```

### Крок 4: Перевірка отриманих ачівок
```http
GET http://localhost:3000/api/achievements/my
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🖥️ Швидке тестування через термінал (cURL)

### Повний цикл тестування:
```bash
# 1. Реєстрація
curl -X POST http://localhost:3000/api/auth/register 
  -H "Content-Type: application/json" 
  -d '{"login": "testuser", "password": "password123", "passwordConfirm": "password123", "full_name": "Test User", "email": "test@example.com"}'

# 2. Логін і збереження токену
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login 
  -H "Content-Type: application/json" 
  -d '{"login": "testuser", "password": "password123"}' | jq -r '.token')

echo "Отриманий токен: $TOKEN"

# 3. Створення поста з кодом (ачівка Hello World + Architect)
curl -X POST http://localhost:3000/api/posts 
  -H "Authorization: Bearer $TOKEN" 
  -H "Content-Type: application/json" 
  -d '{"title": "Мій перший пост з кодом", "content": "Це тестовий пост з кодом: ```javascript
console.log("Hello World");
```", "categories": [1, 2]}'

# 4. Створення 10 коментарів (ачівка Chatterbox)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/posts/1/comments 
    -H "Authorization: Bearer $TOKEN" 
    -H "Content-Type: application/json" 
    -d '{"content": "Коментар номер $i"}'
done

# 5. Лайк поста
curl -X POST http://localhost:3000/api/posts/1/like 
  -H "Authorization: Bearer $TOKEN" 
  -H "Content-Type: application/json" 
  -d '{"type": "like"}'

# 6. Подяка за пост (нова функція!)
curl -X POST http://localhost:3000/api/posts/1/like 
  -H "Authorization: Bearer $TOKEN" 
  -H "Content-Type: application/json" 
  -d '{"type": "thanks"}'

# 7. Перевірка ачівок
curl -X GET http://localhost:3000/api/achievements/my 
  -H "Authorization: Bearer $TOKEN"

# 8. Перевірка сповіщень
curl -X GET http://localhost:3000/api/notifications 
  -H "Authorization: Bearer $TOKEN"
```

## Документація API згідно методички

### 🔐 Authentication (Автентифікація)

| Ендпойнт | Метод | Опис | Параметри | Доступ |
|----------|--------|------|-----------|---------|
| `/api/auth/register` | POST | Реєстрація | `login`, `password`, `passwordConfirm`, `full_name`, `email` | Публічний |
| `/api/auth/login` | POST | Вхід | `login`, `password` | Публічний |
| `/api/auth/logout` | POST | Вихід | - | Авторизований |
| `/api/auth/password-reset` | POST | Скидання пароля | `email` | Публічний |
| `/api/auth/password-reset/verify` | POST | Підтвердження нового пароля | `token`, `email`, `newPassword` | Публічний |

### 👥 Users (Користувачі)

| Ендпойнт | Метод | Опис | Доступ |
|----------|--------|------|---------|
| `/api/users` | GET | Всі користувачі | Публічний |
| `/api/users/:user_id` | GET | Конкретний користувач | Публічний |
| `/api/users` | POST | Створити користувача | **Тільки адмін** |
| `/api/users/avatar` | PATCH | Завантажити аватар | Авторизований |
| `/api/users/:user_id` | PATCH | Оновити дані | Власник або адмін |
| `/api/users/:user_id` | DELETE | Видалити | Власник або адмін |

### 📝 Posts (Пости)

| Ендпойнт | Метод | Опис | Доступ |
|----------|--------|------|---------|
| `/api/posts` | GET | Всі пости (активні для юзерів, всі для адмінів) | Публічний |
| `/api/posts/:post_id` | GET | Конкретний пост | Публічний |
| `/api/posts` | POST | Створити пост | Авторизований |
| `/api/posts/:post_id` | PATCH | Оновити пост | Автор або адмін |
| `/api/posts/:post_id` | DELETE | Видалити пост | Автор або адмін |
| `/api/posts/:post_id/comments` | GET | Коментарі поста | Публічний |
| `/api/posts/:post_id/comments` | POST | Створити коментар | Авторизований |
| `/api/posts/:post_id/like` | GET | Лайки поста | Публічний |
| `/api/posts/:post_id/like` | POST | Лайкнути пост | Авторизований |
| `/api/posts/:post_id/like` | DELETE | Видалити лайк | Автор лайку |

### Categories (Категорії)

| Ендпойнт | Метод | Опис | Доступ |
|----------|--------|------|---------|
| `/api/categories` | GET | Всі категорії | Публічний |
| `/api/categories/:category_id` | GET | Конкретна категорія | Публічний |
| `/api/categories/:category_id/posts` | GET | Пости категорії | Публічний |
| `/api/categories` | POST | Створити категорію | **Тільки адмін** |
| `/api/categories/:category_id` | PATCH | Оновити категорію | **Тільки адмін** |
| `/api/categories/:category_id` | DELETE | Видалити категорію | **Тільки адмін** |

### 💬 Comments (Коментарі)

| Ендпойнт | Метод | Опис | Доступ |
|----------|--------|------|---------|
| `/api/comments/:comment_id` | GET | Конкретний коментар | Публічний |
| `/api/comments/:comment_id` | PATCH | Оновити коментар | Автор або адмін |
| `/api/comments/:comment_id` | DELETE | Видалити коментар | Автор або адмін |
| `/api/comments/:comment_id/like` | GET | Лайки коментаря | Публічний |
| `/api/comments/:comment_id/like` | POST | Лайкнути коментар | Авторизований |
| `/api/comments/:comment_id/like` | DELETE | Видалити лайк | Автор лайку |

### 🏆 Achievements (Ачівки) - додаткова функція

| Ендпойнт | Метод | Опис | Доступ |
|----------|--------|------|---------|
| `/api/achievements` | GET | Всі ачівки | Публічний |
| `/api/achievements/my` | GET | Мої ачівки | Авторизований |
| `/api/achievements/user/:user_id` | GET | Ачівки користувача | Публічний |
| `/api/achievements/leaderboard` | GET | Таблиця лідерів | Публічний |
| `/api/achievements/award` | POST | Нагородити ачівкою | **Тільки адмін** |

## Система ачівок

### Автоматичні ачівки:
1. **Hello, World!** (10 балів) - Написати перший пост
2. **Chatterbox** (25 балів) - Написати 10 коментарів
3. **Hero of the Day** (50 балів) - Отримати 10+ лайків за 24 години
4. **Wise One** (100 балів) - Отримати 60+ лайків на один пост
5. **Architect** (35 балів) - Пост з кодом (```код```) 
6. **Legend** (200 балів) - Подяка від 50% користувачів

### Система подяк:
Тепер є 3 типи реакцій: `like`, `dislike`, `thanks`
Подяка - це рівень вище лайка і дає більше балів рейтингу.

## 🔧 Тестування для адміністратора

```bash
# Логін як адмін
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login 
  -H "Content-Type: application/json" 
  -d '{"login": "admin", "password": "admin123"}' | jq -r '.token')

# Створення нового користувача
curl -X POST http://localhost:3000/api/users 
  -H "Authorization: Bearer $ADMIN_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{"login": "newuser", "password": "password123", "passwordConfirm": "password123", "full_name": "New User", "email": "newuser@example.com", "role": "user"}'

# Створення категорії
curl -X POST http://localhost:3000/api/categories 
  -H "Authorization: Bearer $ADMIN_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{"title": "Нова категорія", "description": "Опис нової категорії"}'

# Перегляд всіх користувачів (включно з неактивними)
curl -X GET http://localhost:3000/api/users 
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Нагородження ачівкою
curl -X POST http://localhost:3000/api/achievements/award 
  -H "Authorization: Bearer $ADMIN_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{"user_id": 2, "achievement_key": "wise_one"}'

# Зміна статусу поста на неактивний
curl -X PATCH http://localhost:3000/api/posts/1 
  -H "Authorization: Bearer $ADMIN_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{"status": "inactive"}'
```

## Панелі адміністрування

1. **Селектор панелей:** `http://localhost:3000/dashboard`
2. **Кастомна панель:** `http://localhost:3000/admin-panel` 
3. **AdminJS:** `http://localhost:3000/admin` (admin@usof.com / admin123)

## Структура відповідей

### ✅ Успіх:
```json
{
    "status": "success",
    "message": "Operation completed",
    "data": { "id": 1, "title": "Example" }
}
```

### ❌ Помилка:
```json
{
    "status": "error", 
    "message": "Error description",
    "error_code": "VALIDATION_ERROR"
}
```

## Сутності (відповідно до методички)

### User:
- `id`, `login` (унікальний), `password` (хеш), `full_name`, `email` (унікальний + верифікація), `profile_picture`, `rating` (автоматично), `role` (admin/user/guest)

### Post:  
- `id`, `author_id`, `title`, `content`, `publish_date`, `status` (active/inactive), `categories` (багато-до-багатьох)

### Category:
- `id`, `title`, `description`

### Comment:
- `id`, `author_id`, `post_id`, `content`, `publish_date`, `status`

### Like:
- `id`, `author_id`, `post_id/comment_id`, `type` (like/dislike/thanks), `publish_date`

## 🔧 Налаштування для продакшену

```env
# Безпечні налаштування
JWT_SECRET=super-secure-jwt-secret-min-32-chars
DB_PASS=strong-database-password
EMAIL_PASS=gmail-app-specific-password
ADMIN_COOKIE_SECRET=secure-cookie-secret
ADMIN_SESSION_SECRET=secure-session-secret
```

## Troubleshooting

### База даних:
- Переконайтеся що MySQL запущений
- Запустіть: `mysql -u root -p < backend/db/db.sql`

### Email:
- Використовуйте Gmail App Password (не звичайний пароль)
- Увімкніть 2FA в Google

### Токени:
- Термін дії: 2 години
- Формат: `Authorization: Bearer TOKEN`

**Готово! Тепер у вас є повноцінний API форуму з ачівками!**