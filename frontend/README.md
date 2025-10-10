# TheDevNexus Frontend (React + Redux + Webpack)

## Scripts
- `npm run dev` — dev server at http://localhost:5173 (HMR)
- `npm run build` — production build to `dist/`
- `npm start` — alias to dev

## Dev proxy
Во время `npm run dev` запросы на `/api/*` проксируются на `http://localhost:3000`.
Убедитесь, что бэкенд запущен там.

## Getting started
1. Установите зависимости: `npm install`
2. Запустите бэкенд (в `backend/`): `npm run dev` или `npm start`
3. Запустите фронтенд: `npm run dev`
