AutoRia Clone:
Full-stack проєкт платформи для продажу автомобілів.

Технології:
**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT  
**Frontend:** React, TypeScript, Vite, Axios, Tailwind CSS  
**Контейнеризація:** Docker, Docker Compose

Реалізовано:

- реєстрація та авторизація користувачів;
- ролі: `BUYER`, `SELLER`, `MANAGER`, `ADMIN`;
- типи акаунтів: `BASIC` і `PREMIUM`;
- створення, перегляд та видалення оголошень;
- обмеження: BASIC-продавець може створити одне активне оголошення;
- PREMIUM-продавець може створювати необмежену кількість оголошень;
- перегляд аналітики оголошення для PREMIUM-акаунта;
- перевірка оголошення на нецензурну лексику;
- JWT-захист приватних API-запитів;
- mock endpoint для імітації оновлення акаунта до PREMIUM;
- Postman collection для перевірки API.

Запуск:

1. Backend
   У кореневій папці проєкту:

```bash
npm install
```

Створи файл `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Запуск backend:

```bash
npm run dev
```

Backend працює на:

```text
http://localhost:5000
```

2. Frontend
3.

```bash
cd autoria-frontend
npm install
```

Створи файл `autoria-frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Запуск frontend:

```bash
npm run dev
```

Frontend зазвичай працює на:

```text
http://localhost:5173
```

Основні API endpoints

| Метод  | Endpoint                       | Опис                      |
|--------|--------------------------------|---------------------------|
| POST   | `/api/auth/register`           | Реєстрація                |
| POST   | `/api/auth/login`              | Авторизація               |
| POST   | `/api/auth/upgrade-to-premium` | Mock-оновлення до PREMIUM |
| GET    | `/api/ads`                     | Отримати оголошення       |
| POST   | `/api/ads`                     | Створити оголошення       |
| DELETE | `/api/ads/:id`                 | Видалити оголошення       |
| GET    | `/api/ads/:id/analytics`       | Отримати аналітику        |

(mock-оплата: авторизований користувач може оновити власний акаунт до PREMIUM через API.)

Для захищених endpoint-ів потрібно передати JWT:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

Postman:
Колекція запитів знаходиться у файлі:

```text
AutoRia_Postman_Collection.json
```

Її можна імпортувати через кнопку **Import** у Postman.

Docker:
Для запуску через Docker:

```bash
docker compose up --build
```
