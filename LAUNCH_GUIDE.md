# 🚀 Інструкція з запуску TheDevNexus USOF

## 📋 Передумови

Перед запуском переконайтеся, що у вас встановлено:
- **Node.js** (версія 16 або вище)
- **MySQL** (версія 8.0 або вище)
- **npm** (зазвичай йде разом з Node.js)

Перевірити версії можна командами:
```bash
node --version
mysql --version
npm --version
```

---

## 🗄️ Крок 1: Налаштування бази даних

### 1.1 Запустіть MySQL сервер
```bash
# Перевірте, чи запущений MySQL
sudo systemctl status mysql

# Якщо не запущений:
sudo systemctl start mysql
```

### 1.2 Створіть базу даних та таблиці
```bash
# Перейдіть в корінь проекту
cd /home/archie242/Desktop/Projects_IT/TheDevNexus_USOF

# Імпортуйте схему бази даних
mysql -u root -p < backend/db/db.sql
```

**Примітка:** Вам потрібно буде ввести пароль root для MySQL.

### 1.3 Перевірте створення бази
```bash
mysql -u root -p

# В консолі MySQL:
SHOW DATABASES;
USE USOF;
SHOW TABLES;
EXIT;
```

---

## ⚙️ Крок 2: Налаштування Backend

### 2.1 Встановіть залежності backend
```bash
cd backend
npm install
```

### 2.2 Створіть файл .env (ВАЖЛИВО!)
```bash
# Створіть файл .env в папці backend
nano .env
# або
touch .env
```

Вставте наступні налаштування (змініть значення на свої):
```env
# База даних
DB_HOST=localhost
DB_USER=mkopychko
DB_PASS=securepass
DB_NAME=USOF
DB_PORT=3306

# Email для відновлення паролів (налаштуйте Gmail App Password)
EMAIL_USER=noreplydevnexus@gmail.com
EMAIL_PASS=asxoqhnmkbfxgntw
EMAIL_DISPLAY_NAME=Dev Nexus Support
EMAIL_DISPLAY_ADDRESS=noreply@thedevnexus.org

# JWT токени
JWT_SECRET=securepass
JWT_EXPIRES_IN=2h

# Backend сервер
PORT=3000
BASE_URL=http://localhost:3000

# AdminJS панель
ADMIN_PORT=4001
ADMIN_COOKIE_SECRET=very-secure-admin-cookie-secret-change-this-in-production
ADMIN_SESSION_SECRET=very-secure-admin-session-secret-change-this-in-production
```

### 2.3 Запустіть backend сервер
```bash
# В папці backend
npm start
# або для розробки з автоматичним перезапуском:
npm run dev
```

**Ви повинні побачити:**
```
Backend запущений на порту 3000
Base URL: http://localhost:3000
DB підключення успішне!
AdminJS доступний на: http://localhost:3000/admin
```

---

## 🎨 Крок 3: Налаштування Frontend

### 3.1 Встановіть залежності frontend
Відкрийте **новий термінал** та виконайте:
```bash
cd /home/archie242/Desktop/Projects_IT/TheDevNexus_USOF/frontend
npm install
```

### 3.2 Запустіть frontend сервер
```bash
# В папці frontend
npm run dev
# або
npm start
```

**Ви повинні побачити:**
```
webpack 5.x.x compiled successfully
Dev server running at http://localhost:5173/
```

---

## ✅ Крок 4: Перевірка запуску

### 4.1 Перевірте backend
Відкрийте браузер та перейдіть:
- **API Health**: http://localhost:3000/
- **AdminJS Panel**: http://localhost:3000/admin
- **Custom Admin**: http://localhost:3000/admin-panel
- **Dashboard Selector**: http://localhost:3000/dashboard

### 4.2 Перевірте frontend
Відкрийте браузер та перейдіть:
- **Frontend App**: http://localhost:5173/

### 4.3 Тестовий API запит
```bash
# Перевірка доступності API
curl http://localhost:3000/api/posts

# Логін тестового користувача
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "admin", "password": "admin123"}'
```

---

## 🔑 Тестові облікові записи

### Адміністратор:
- **Login:** `admin`
- **Password:** `admin123`
- **Email:** `admin@devnexus.org`

### Звичайні користувачі:
1. `gamedev_ukr` / `password123`
2. `unity_master` / `password123`
3. `indie_dev` / `password123`
4. `artist_2d` / `password123`

---

## 🛠️ Корисні команди

### Backend (в папці /backend)
```bash
npm start              # Запуск production режиму
npm run dev           # Запуск з nodemon (автоперезавантаження)
npm run db_start      # Імпорт бази даних
```

### Frontend (в папці /frontend)
```bash
npm run dev           # Запуск dev сервера (порт 5173)
npm run build         # Збірка для production
npm start             # Запуск dev сервера
```

---

## 📂 Структура портів

| Сервіс | Порт | URL |
|--------|------|-----|
| **Backend API** | 3000 | http://localhost:3000 |
| **Frontend** | 5173 | http://localhost:5173 |
| **AdminJS** | 3000 | http://localhost:3000/admin |

---

## 🐛 Troubleshooting

### Проблема: "Cannot connect to MySQL"
**Рішення:**
```bash
# Перевірте чи запущений MySQL
sudo systemctl status mysql

# Перезапустіть MySQL
sudo systemctl restart mysql

# Перевірте credentials в .env файлі
```

### Проблема: "Port 3000 already in use"
**Рішення:**
```bash
# Знайдіть процес на порту 3000
lsof -i :3000

# Вбийте процес
kill -9 <PID>

# Або змініть PORT в .env файлі
```

### Проблема: "Frontend не підключається до backend"
**Рішення:**
- Переконайтеся що backend запущений на порту 3000
- Перевірте налаштування proxy в `frontend/webpack.config.js`:
```javascript
proxy: [
    {
        context: ['/api'],
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
    }
]
```

### Проблема: "Module not found" або "Cannot find package"
**Рішення:**
```bash
# Видаліть node_modules та package-lock.json
rm -rf node_modules package-lock.json

# Переустановіть залежності
npm install
```

---

## 🚀 Швидкий запуск (одна команда)

Створіть bash скрипт для швидкого запуску обох серверів:

```bash
# Створіть файл start.sh в корені проекту
nano start.sh
```

Вставте:
```bash
#!/bin/bash

echo "🚀 Запуск TheDevNexus USOF..."

# Запуск backend
echo "📦 Запуск Backend..."
cd backend
npm start &
BACKEND_PID=$!

# Зачекайте 3 секунди для запуску backend
sleep 3

# Запуск frontend
echo "🎨 Запуск Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Сервери запущені!"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Для зупинки натисніть Ctrl+C"

# Зачекайте на сигнал переривання
wait
```

Зробіть скрипт виконуваним:
```bash
chmod +x start.sh
./start.sh
```

---

## 📊 API Endpoints (швидкий довідник)

### Автентифікація
- `POST /api/auth/register` - Реєстрація
- `POST /api/auth/login` - Вхід
- `POST /api/auth/logout` - Вихід
- `POST /api/auth/password-reset` - Скидання пароля

### Користувачі
- `GET /api/users` - Список користувачів
- `GET /api/users/:id` - Користувач по ID
- `PATCH /api/users/avatar` - Завантажити аватар
- `PATCH /api/users/:id` - Оновити дані

### Пости
- `GET /api/posts` - Список постів
- `POST /api/posts` - Створити пост
- `GET /api/posts/:id` - Пост по ID
- `PATCH /api/posts/:id` - Оновити пост
- `DELETE /api/posts/:id` - Видалити пост

### Коментарі
- `GET /api/posts/:id/comments` - Коментарі поста
- `POST /api/posts/:id/comments` - Створити коментар
- `PATCH /api/comments/:id` - Оновити коментар
- `DELETE /api/comments/:id` - Видалити коментар

### Ачівки (додаткова функція)
- `GET /api/achievements` - Всі ачівки
- `GET /api/achievements/my` - Мої ачівки
- `GET /api/achievements/leaderboard` - Таблиця лідерів

### Виконання коду (додаткова функція)
- `POST /api/code/execute` - Виконати код
- `GET /api/code/languages` - Підтримувані мови
- `GET /api/code/services/status` - Статус сервісів

---

## 📖 Додаткова документація

- **Backend API**: Дивіться `README.md` в корені проекту
- **AdminJS**: Дивіться `backend/ADMIN_README.md`
- **Code Execution**: Дивіться `backend/docs/CODE_EXECUTION_API.md`
- **Config Usage**: Дивіться `backend/CONFIG_USAGE.md`

---

## 🎯 Що далі?

1. ✅ Перейдіть на http://localhost:5173 та протестуйте frontend
2. ✅ Зайдіть в AdminJS панель: http://localhost:3000/admin (admin/admin123)
3. ✅ Протестуйте API через Postman або curl
4. ✅ Створіть новий пост та отримайте першу ачівку "Hello, World!"

---

**Успішного розроблення! 🚀**
