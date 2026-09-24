AutoRia Clone — платформа оголошень про продаж авто.

ТЗ, яке покриває проєкт:

- ролі `BUYER`, `SELLER`, `MANAGER`, `ADMIN`;
- менеджера створює тільки адміністратор;
- менеджер і адміністратор можуть блокувати користувачів і видаляти оголошення;
- акаунти продавця: `BASIC` (одне активне оголошення) і `PREMIUM` (без ліміту і зі статистикою);
- перехід на `PREMIUM` — mock-запит, без платіжної системи;
- марка і модель обираються зі списку, відсутню пару можна надіслати адміністратору;
- ціна вказується в USD, EUR або UAH, решта рахується за курсом ПриватБанку (кеш на добу);
- нецензурна лексика: до 3 правок, після цього оголошення стає неактивним і менеджер бачить сповіщення в логах сервера;
- статистика PREMIUM: перегляди загалом, за день, тиждень і місяць, середня ціна в регіоні та по Україні в USD.

Технології: Node.js, Express, TypeScript, MongoDB, React, Vite.

Запуск backend:

```bash
npm install
```

Файл `.env` у корені:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@autoria.local
ADMIN_PASSWORD=admin123
```

```bash
npm run dev
```

Сервер: `http://localhost:5000`. Якщо адміністратора ще немає, він створюється з `ADMIN_EMAIL` і `ADMIN_PASSWORD`.

Запуск frontend:

```bash
cd autoria-frontend
npm install
npm run dev
```

За потреби створи `autoria-frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Frontend: `http://localhost:5173`.

Docker:

```bash
docker compose up --build
```

API

| Метод | Endpoint | Хто |
| --- | --- | --- |
| POST | `/api/auth/register` | гість, роль `BUYER` або `SELLER` |
| POST | `/api/auth/login` | гість |
| POST | `/api/auth/upgrade-to-premium` | продавець |
| GET | `/api/brands` | усі |
| POST | `/api/brands/missing` | продавець |
| GET | `/api/brands/missing` | адміністратор |
| GET | `/api/ads` | усі, неактивні бачить власник і персонал |
| GET | `/api/ads/:id` | усі, перегляд рахується для чужого активного оголошення |
| POST | `/api/ads` | продавець |
| PATCH | `/api/ads/:id` | власник |
| DELETE | `/api/ads/:id` | власник, менеджер, адміністратор |
| GET | `/api/ads/:id/analytics` | PREMIUM-власник |
| GET | `/api/users` | менеджер, адміністратор |
| POST | `/api/users/managers` | адміністратор |
| PATCH | `/api/users/:id/ban` | менеджер, адміністратор |

Для закритих запитів: `Authorization: Bearer YOUR_JWT_TOKEN`.

Postman-колекція: `AutoRia_Postman_Collection.json`.
