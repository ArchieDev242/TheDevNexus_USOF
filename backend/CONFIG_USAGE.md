## 🔧 Структура

### 1. `.env` файл (змінні оточення)
```properties
# База даних
DB_HOST=localhost
DB_USER=mkopychko
DB_PASS=securepass
DB_NAME=USOF

# Email налаштування
EMAIL_USER=noreplydevnexus@gmail.com
EMAIL_PASS=asxoqhnmkbfxgntw
EMAIL_DISPLAY_NAME=Dev Nexus Support
EMAIL_DISPLAY_ADDRESS=noreply@thedevnexus.org

# Сервер
PORT=3000
BASE_URL=http://localhost:3000

# JWT
JWT_SECRET=securepass
JWT_EXPIRES_IN=2h

# Admin панель
ADMIN_PORT=4001
ADMIN_COOKIE_SECRET=very-secure-admin-cookie-secret-change-this-in-production
ADMIN_SESSION_SECRET=very-secure-admin-session-secret-change-this-in-production
```

### 2. `config.js` (централізована конфігурація)
Цей файл:
- Завантажує змінні з `.env` 
- Організовує їх у логічні групи
- Надає значення за замовчуванням
- Експортує структурований об'єкт