# Soldo — Admin Panel

Панель администратора для управления бронированиями, событиями, пользователями и настройками тенанта.

## Стек

- **React 19** + **TypeScript 5.9**
- **Vite 7** (сборка и dev-сервер)
- **React Bootstrap** + **Bootstrap 5** (UI)
- **React Router 7** (маршрутизация)
- **Axios** (HTTP-клиент)
- **Recharts** (графики на дашборде)

## Быстрый старт

```bash
npm install
npm run dev
```

Dev-сервер запустится на `http://localhost:5173`. API-запросы проксируются на `http://localhost:8080` (см. `vite.config.ts`).

## Сборка

```bash
npm run build
```

Результат в `dist/`. В production раздаётся через nginx (см. `Dockerfile` и `nginx.conf`).

## Структура

```
src/
├── api/            # HTTP-клиент и API-модули
│   ├── client.ts           # Axios instance с JWT-интерцепторами
│   ├── authApi.ts          # Авторизация
│   ├── eventApi.ts         # События
│   ├── bookingApi.ts       # Бронирования
│   ├── userApi.ts          # Пользователи
│   ├── tenantApi.ts        # Тенант
│   ├── categoryApi.ts      # Категории
│   ├── documentApi.ts      # Документы
│   ├── inquiryApi.ts       # Обратная связь
│   ├── widgetApi.ts        # Виджет
│   ├── onboardingApi.ts    # Онбординг
│   └── schedulerSettingsApi.ts
├── auth/           # Контекст авторизации и защита маршрутов
├── components/     # Переиспользуемые компоненты (Layout, Sidebar, Pagination, ...)
├── constants/      # Константы (ключи localStorage, параметры событий)
├── context/        # React-контексты
├── pages/          # Страницы (по одной на маршрут)
├── types/          # TypeScript-интерфейсы
├── utils/          # Утилиты (работа с токенами, форматирование)
├── App.tsx         # Конфигурация маршрутов
└── main.tsx        # Точка входа
```

## Маршруты

| Путь | Страница |
|------|----------|
| `/login` | Авторизация |
| `/register` | Регистрация |
| `/onboarding` | Онбординг нового тенанта |
| `/admin` | Дашборд |
| `/admin/events` | Список событий |
| `/admin/events/new` | Создание события |
| `/admin/events/:id` | Детали события |
| `/admin/events/:id/edit` | Редактирование события |
| `/admin/bookings` | Бронирования |
| `/admin/categories` | Категории |
| `/admin/users` | Пользователи |
| `/admin/documents` | Шаблоны документов |
| `/admin/inquiries` | Обратная связь |
| `/admin/notifications` | Настройки уведомлений |
| `/admin/tenant` | Настройки тенанта |
| `/admin/widget` | Настройки виджета |

## API-интеграция

Axios-клиент (`api/client.ts`):
- Базовый URL: `/api`
- Автоматически добавляет `Bearer` токен из `localStorage`
- Проверяет срок действия JWT перед запросом
- Редиректит на `/login` при 401

## Docker

```bash
docker build -t soldo-admin .
docker run -p 3000:80 soldo-admin
```

Dockerfile: multi-stage (node:20 build + nginx:1.27 serve). Конфигурация nginx в `nginx.conf` — SPA fallback, кэширование статики.

## Production

В production админка работает как часть общего стека через `docker-compose.prod.yml` (см. корень проекта). Caddy проксирует все запросы, кроме `/api/*`, `/public/*`, `/files/*`, на контейнер админки.
