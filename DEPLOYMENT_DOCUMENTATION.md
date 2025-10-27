# TheDevNexus USOF - Deployment Architecture

## 📋 Огляд

Цей документ описує архітектуру розгортання проєкту TheDevNexus USOF з розділенням на **Frontend** та **Backend** серверу.

---

## 🏗️ Архітектурні рівні

### 1. **Client Layer (Клієнтський рівень)**
```
Користувачі (Web/Mobile)
        ↓
   Web Browsers
        ↓
React Application
```

**Компоненти:**
- React 18.3 - Користувацькі компоненти
- Redux Toolkit - Управління станом
- React Router v7 - Клієнтська маршрутизація
- i18next - Багатомовна підтримка (uk, en, de)
- Webpack - Bundler та Dev Server

**Порти:**
- Frontend Dev Server: `3000`
- Frontend Production: може бути на статичному хостингу

---

### 2. **Frontend Server (Frontend Сервер)**

```
┌─────────────────────────────────┐
│   Frontend Server :3000         │
├─────────────────────────────────┤
│  Node.js + Webpack Dev Server   │
│                                 │
│  ├─ React Components            │
│  ├─ Redux Store                 │
│  ├─ React Router                │
│  ├─ Static Assets               │
│  │  ├─ HTML                    │
│  │  ├─ CSS (Styles)            │
│  │  ├─ JS (Bundle)             │
│  │  └─ Images                  │
│  └─ i18n (Translation)         │
└─────────────────────────────────┘
```

**Характеристики:**
- **Technology Stack:**
  - Node.js Runtime
  - Webpack 5 (Bundler)
  - React 18.3 (UI Framework)
  - Redux Toolkit (State Management)
  - React Router v7 (Routing)
  - i18next (Localization)

- **Features:**
  - Hot Module Reloading (HMR) - для розробки
  - Automatic bundling - компакт JavaScript
  - CSS/SCSS compilation
  - Image optimization
  - Source maps - для дебага

- **Environment Variables:**
  - `REACT_APP_API_URL` - Backend API URL
  - `REACT_APP_LANGUAGE` - Default language

---

### 3. **Backend Server (Backend Сервер)**

```
┌──────────────────────────────────────┐
│    Backend Server :5000/3001         │
├──────────────────────────────────────┤
│   Node.js + Express.js Framework     │
│                                      │
│  HTTP Layer:                         │
│  ├─ Express.js 5.1                  │
│  ├─ CORS Middleware                 │
│  ├─ Cookie Parser                   │
│  └─ Body Parser                     │
│                                      │
│  Security Layer:                     │
│  ├─ JWT (jsonwebtoken 9.0)          │
│  ├─ Bcrypt (Password Hashing)       │
│  ├─ Rate Limiting                   │
│  └─ Session Manager                 │
│                                      │
│  API Routes:                         │
│  ├─ /api/auth/*                     │
│  ├─ /api/users/*                    │
│  ├─ /api/posts/*                    │
│  ├─ /api/comments/*                 │
│  ├─ /api/likes/*                    │
│  ├─ /api/categories/*               │
│  └─ /api/reports                    │
│                                      │
│  Controllers (Business Logic):       │
│  ├─ AuthController                  │
│  ├─ UsersController                 │
│  ├─ PostsController                 │
│  ├─ CommentsController              │
│  ├─ LikesController                 │
│  └─ CategoriesController            │
│                                      │
│  Data Models:                        │
│  ├─ User                            │
│  ├─ Post                            │
│  ├─ Comment                         │
│  ├─ Like                            │
│  ├─ Category                        │
│  └─ Permission                      │
│                                      │
│  Services:                           │
│  ├─ Email Service (Nodemailer 7.0) │
│  ├─ File Upload (Multer 2.0)       │
│  ├─ Image Processing (Sharp)        │
│  ├─ Admin Panel (AdminJS 7.8)      │
│  └─ Error Handler                   │
└──────────────────────────────────────┘
```

**Technology Stack:**
- Node.js Runtime
- Express.js 5.1 (Web Framework)
- MySQL2 (Database Driver)
- jsonwebtoken (JWT Auth)
- Bcrypt (Password Hashing)
- Multer 2.0 (File Uploads)
- Sharp (Image Processing)
- Nodemailer 7.0 (Email)
- AdminJS 7.8 (Admin Dashboard)

**API Endpoints:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Реєстрація |
| POST | `/api/auth/login` | Вхід |
| GET | `/api/users/:id` | Профіль користувача |
| GET | `/api/users/:id/posts` | Пости користувача |
| GET | `/api/posts` | Список постів |
| POST | `/api/posts` | Створити пост |
| GET | `/api/posts/:id` | Деталі поста |
| POST | `/api/comments` | Залишити коментар |
| POST | `/api/likes` | Лайк/дизлайк |
| GET | `/api/categories` | Список категорій |
| POST | `/api/reports` | Поскаржитися |

---

### 4. **Database Server (Сервер БД)**

```
┌─────────────────────────────────┐
│   MySQL Database :3306          │
├─────────────────────────────────┤
│   Tables:                       │
│                                 │
│   ├─ users                      │
│   │  ├─ id (PK)                │
│   │  ├─ login (UNIQUE)         │
│   │  ├─ email (UNIQUE)         │
│   │  ├─ password (bcrypt)      │
│   │  ├─ profile_picture        │
│   │  ├─ bio                    │
│   │  ├─ rating                 │
│   │  ├─ role (user/admin)      │
│   │  └─ created_at             │
│   │                             │
│   ├─ posts                      │
│   │  ├─ id (PK)                │
│   │  ├─ author_id (FK→users)  │
│   │  ├─ title                  │
│   │  ├─ content (markdown)     │
│   │  ├─ status (active/draft)  │
│   │  ├─ created_at             │
│   │  └─ updated_at             │
│   │                             │
│   ├─ comments                   │
│   │  ├─ id (PK)                │
│   │  ├─ post_id (FK→posts)    │
│   │  ├─ author_id (FK→users)  │
│   │  ├─ content                │
│   │  └─ created_at             │
│   │                             │
│   ├─ likes                      │
│   │  ├─ id (PK)                │
│   │  ├─ post_id (FK→posts)    │
│   │  ├─ user_id (FK→users)    │
│   │  ├─ type (like/dislike)    │
│   │  └─ created_at             │
│   │                             │
│   ├─ categories                 │
│   │  ├─ id (PK)                │
│   │  ├─ title                  │
│   │  └─ description            │
│   │                             │
│   ├─ post_categories (M2M)      │
│   │  ├─ post_id (FK)          │
│   │  └─ category_id (FK)      │
│   │                             │
│   ├─ post_views                 │
│   │  ├─ id (PK)                │
│   │  ├─ post_id (FK)          │
│   │  ├─ viewer_id (FK/NULL)   │
│   │  └─ created_at             │
│   │                             │
│   └─ permissions                │
│      ├─ id (PK)                │
│      ├─ role                   │
│      ├─ action                 │
│      └─ resource               │
│                                 │
└─────────────────────────────────┘
```

**Характеристики:**
- **DBMS:** MySQL 5.7+ / MariaDB
- **Port:** 3306
- **Connection:** MySQL2 (Connection Pooling)
- **Mode:** ONLY_FULL_GROUP_BY (Strict)

---

## 🌐 Комунікаційні протоколи

### Frontend ↔ Backend
```
HTTPS/HTTP (REST API)
Content-Type: application/json
Port: 5000 або 3001

Request Example:
GET /api/posts?page=1&limit=10
Content-Type: application/json

Response Example:
{
  "status": "success",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Backend ↔ Database
```
MySQL2 Protocol
Port: 3306
Connection Pool (max 10 connections)

Example Query:
SELECT p.*, u.login, COUNT(l.id) as likes_count
FROM posts p
LEFT JOIN users u ON p.author_id = u.id
LEFT JOIN likes l ON p.id = l.post_id
```

---

## 📊 Data Flow

### Типовий сценарій - Перегляд постів:

```
1. User (Browser)
   ↓
2. Frontend (React)
   - Dispatch Redux action
   - API call: GET /api/posts
   ↓
3. Backend (Express)
   - Validate request
   - Rate limiting check
   - JWT verification (if needed)
   ↓
4. Database (MySQL)
   - Query posts with filters
   - Join with users, likes, comments
   - Count aggregations
   ↓
5. Response Chain (Backend → Frontend → User)
   - Format JSON response
   - Send to frontend
   - Update Redux store
   - Re-render React components
```

### Сценарій - Створення поста:

```
1. User заповнює форму на Frontend
   ↓
2. Frontend (React)
   - Validate form data
   - Dispatch action
   - POST /api/posts
   ↓
3. Backend (Express)
   - JWT auth check
   - Validate input
   - File upload (if any)
   - Image optimization (Sharp)
   ↓
4. Database (MySQL)
   - INSERT into posts table
   - INSERT into post_categories table
   - Return created post
   ↓
5. Response (Backend → Frontend → User)
   - Return post ID
   - Update state
   - Redirect to post detail
   - Show success notification
```

---

## 🔐 Security Architecture

### Authentication Flow:
```
1. User login (POST /api/auth/login)
   ↓
2. Backend:
   - Hash password with Bcrypt
   - Compare with stored hash
   - Generate JWT token
   ↓
3. Return token to Frontend
   ↓
4. Frontend stores token (localStorage/sessionStorage)
   ↓
5. For protected routes:
   - Include token in Authorization header
   - Backend verifies JWT
   - Check user permissions
```

### Authorization Levels:
- **Guest:**읽기 доступ (без лайків/коментарів)
- **User:** Повний доступ (пости, коментарі, лайки)
- **Admin:** Управління контентом, користувачами, репортами

---

## 📦 Dependencies

### Frontend:
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-redux": "^9.1.2",
  "react-router-dom": "^7.9.4",
  "react-icons": "^5.5.0",
  "i18next": "^25.6.0",
  "@reduxjs/toolkit": "^2.2.7",
  "webpack": "^5.95.0"
}
```

### Backend:
```json
{
  "express": "^5.1.0",
  "mysql2": "^3.15.0",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^6.0.0",
  "multer": "^2.0.2",
  "sharp": "^0.34.4",
  "nodemailer": "^7.0.6",
  "adminjs": "^7.8.17",
  "cors": "^2.8.5"
}
```

---

## 🚀 Deployment Scenarios

### Сценарій 1: Local Development
```
Frontend: localhost:3000
Backend: localhost:5000
Database: localhost:3306
```

### Сценарій 2: Production (Separate Servers)
```
Frontend Server:
  - Nginx/Apache web server
  - Serve static files
  - Reverse proxy for API calls
  - SSL/TLS certificates
  Location: IP 192.168.1.100:80/443

Backend Server:
  - Node.js + Express
  - PM2 for process management
  - SSL/TLS certificates
  - Rate limiting
  Location: IP 192.168.1.101:5000

Database Server:
  - MySQL/MariaDB
  - Backups scheduled
  - Replication (optional)
  Location: IP 192.168.1.102:3306
```

---

## 📈 Scalability Considerations

### Frontend Scaling:
- CDN для статичних файлів
- Load balancer
- Множні frontend сервери

### Backend Scaling:
- Horizontal scaling (множні Node.js інстанції)
- Load balancer (Nginx/HAProxy)
- API versioning

### Database Scaling:
- Read replicas
- Sharding (за user_id)
- Caching layer (Redis)

---

## 🔧 Configuration Files

### Frontend (.env):
```
REACT_APP_API_URL=https://api.thedevnexus.com
REACT_APP_DEFAULT_LANGUAGE=uk
REACT_APP_DEBUG=false
```

### Backend (.env):
```
NODE_ENV=production
PORT=5000
DB_HOST=192.168.1.102
DB_USER=root
DB_PASSWORD=***
DB_NAME=usof_db
JWT_SECRET=your_jwt_secret_key
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

---

## 📚 PlantUML Diagrams

Три PlantUML діаграми були створені:

1. **DEPLOYMENT_DIAGRAM.plantuml** - Базова архітектура
2. **DEPLOYMENT_ARCHITECTURE.plantuml** - Детальна архітектура з компонентами
3. **DEPLOYMENT_SIMPLE.plantuml** - Спрощена версія з потоком даних

Усі діаграми можна переглянути на:
- [PlantUML Online Editor](https://www.plantuml.com/plantuml/uml/)
- [PlantText](https://www.planttext.com/)

---

## 📞 Summary

| Компонент | Технологія | Порт | Опис |
|-----------|-----------|------|------|
| Frontend | React 18.3 + Webpack | 3000 | Користувацький інтерфейс |
| Backend | Express.js 5.1 | 5000 | REST API |
| Database | MySQL 5.7+ | 3306 | Зберігання даних |
| Admin | AdminJS 7.8 | 5000/admin | Адміністраторський панель |

---

**Created:** October 27, 2025  
**Project:** TheDevNexus USOF  
**Architecture:** Microservices (Frontend-Backend-Database)
