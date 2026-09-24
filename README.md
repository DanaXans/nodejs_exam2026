AutoRia Clone — платформа оголошень про продаж авто.

Платформа замінює старий сайт і зібрана так, щоб окремі можливості можна було вмикати через права доступу, а не переписувати перевірки по всьому коду. Контейнер з API готовий до викладення, зокрема на AWS.

## Ролі

- `BUYER` — переглядає оголошення і бачить email продавця, щоб домовитись про огляд.
- `SELLER` — створює оголошення. За замовчуванням акаунт `BASIC`: одне активне оголошення. `PREMIUM` купується окремо і знімає ліміт.
- `MANAGER` — бачить усі оголошення, видаляє невалідні, банить користувачів, читає листи про підозрілі оголошення. Створює його тільки адміністратор.
- `ADMIN` — усі права. Створюється автоматично під час першого запуску.

Права ролей зібрані в `src/permissions.ts`. Коли з’являться автосалони, нова роль (менеджер салону, сейл, механік) додається в цей список. Роути вже перевіряють пермішини, а не назву ролі.

## Оголошення

- Марка і модель обираються зі списку. У списку є пари з ТЗ: BMW / X5 і Daewoo / Lanos. Якщо пари немає, продавець надсилає запит адміністратору.
- Ціна вказується в одній валюті: USD, EUR або UAH. Решта рахується за курсом. В оголошенні зберігаються і ціна продавця, і курс (`exchangeRatesUsed`: дата, USD/UAH, EUR/UAH, джерело `privatbank` або `mock`).
- Курс береться з ПриватБанку раз на день. Якщо банк недоступний або ввімкнено `USE_MOCK_RATES=true`, використовується mock: 1 USD = 41.5 UAH, 1 EUR = 45.2 UAH.
- Нецензурна лексика: оголошення лишається на редагуванні, продавець має 3 спроби. Після третьої невдалої спроби статус стає `INACTIVE`, і менеджеру йде mock-лист. Листи читаються через `GET /api/emails`.
- Статистику бачить тільки PREMIUM-продавець і тільки по своєму оголошенню: перегляди загалом, за день, тиждень і місяць, середня ціна в регіоні продажу та по Україні. Для BASIC цих даних немає.

Оплата PREMIUM замокана: `POST /api/auth/upgrade-to-premium`.

## Запуск без Docker

Backend, файл `.env` у корені:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/autoria
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@autoria.local
ADMIN_PASSWORD=admin123
MANAGER_EMAIL=manager@autoria.local
USE_MOCK_RATES=true
```

```bash
npm install
npm run dev
```

API: `http://localhost:5000`. Адміністратор: `admin@autoria.local` / `admin123`.

Frontend:

```bash
cd autoria-frontend
npm install
npm run dev
```

За потреби `autoria-frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Сайт: `http://localhost:5173`.

## Docker

Образ API і MongoDB:

```bash
docker compose up --build
```

API на порту 5000. У контейнері курс замоканий, щоб перевірка не залежала від ПриватБанку.

## API

| Метод | Шлях | Хто |
| --- | --- | --- |
| POST | `/api/auth/register` | гість, роль `BUYER` або `SELLER` |
| POST | `/api/auth/login` | гість |
| POST | `/api/auth/upgrade-to-premium` | продавець, mock-оплата |
| GET | `/api/brands` | усі |
| POST | `/api/brands/missing` | продавець |
| GET | `/api/brands/missing` | адміністратор |
| GET | `/api/ads` | усі; неактивні бачить власник і менеджер |
| GET | `/api/ads/:id` | усі; чужий перегляд активного оголошення рахується |
| POST | `/api/ads` | продавець |
| PATCH | `/api/ads/:id` | власник, до 3 правок після нецензурної лексики |
| DELETE | `/api/ads/:id` | власник, менеджер, адміністратор |
| GET | `/api/ads/:id/analytics` | PREMIUM-власник |
| GET | `/api/users` | менеджер, адміністратор |
| POST | `/api/users/managers` | адміністратор |
| PATCH | `/api/users/:id/ban` | менеджер, адміністратор |
| GET | `/api/emails` | менеджер, адміністратор, mock-скринька |

Закриті запити: `Authorization: Bearer YOUR_JWT_TOKEN`.

Postman: `AutoRia_Postman_Collection.json`. Колекція проходить реєстрацію, ліміт BASIC, mock PREMIUM, курс, три спроби нецензурної лексики, лист менеджеру, створення менеджера і бан.
