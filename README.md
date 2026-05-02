# Soldo — Admin Panel

Панель администратора для управления бронированиями, событиями, пользователями и настройками тенанта.

## Стек

| Пакет | Версия | Роль |
|-------|--------|------|
| React | 19 | UI-фреймворк |
| TypeScript | 5.9 | Типизация |
| Vite | 7 | Сборщик и dev-сервер |
| React Bootstrap + Bootstrap | 2.10 / 5.3 | UI-компоненты |
| React Router | 7 | Клиентская маршрутизация |
| Axios | 1.13 | HTTP-клиент |
| Recharts | 3.7 | Графики на дашборде |
| React Icons | 5.5 | Иконки (Bootstrap Icons) |

## Быстрый старт

```bash
npm install
npm run dev
```

Dev-сервер поднимается на `http://localhost:5173`. Запросы на `/api/**` проксируются на `http://localhost:8080` (настроено в `vite.config.ts` — backend должен быть запущен).

```bash
npm run build    # production-сборка в dist/
npm run preview  # предпросмотр production-сборки
npm run lint     # ESLint
```

## Структура

```
src/
├── api/                    # HTTP-модули (по одному на ресурс)
│   ├── client.ts           # Axios-инстанс с JWT-интерцепторами
│   ├── authApi.ts          # POST /auth/login, /auth/register
│   ├── eventApi.ts         # CRUD событий
│   ├── bookingApi.ts       # CRUD бронирований
│   ├── categoryApi.ts      # CRUD категорий
│   ├── documentApi.ts      # Шаблоны документов
│   ├── inquiryApi.ts       # Обратная связь
│   ├── onboardingApi.ts    # Онбординг нового тенанта
│   ├── schedulerSettingsApi.ts  # Настройки расписания уведомлений
│   ├── tenantApi.ts        # Настройки тенанта
│   ├── userApi.ts          # Пользователи
│   └── widgetApi.ts        # Конфиг виджета
│
├── auth/
│   ├── AuthContext.tsx     # JWT-контекст для панели администратора
│   └── ProtectedRoute.tsx  # HOC-обёртка для защищённых маршрутов
│
├── components/
│   ├── Layout.tsx          # Обёртка страниц: Sidebar + Header + <Outlet>
│   ├── Sidebar.tsx         # Боковое меню навигации
│   ├── Header.tsx          # Верхняя панель
│   ├── Pagination.tsx      # Пагинация таблиц
│   ├── StatusBadge.tsx     # Бейдж статуса бронирования/оплаты
│   ├── ConfirmModal.tsx    # Модальное окно подтверждения
│   ├── TeamModal.tsx       # Модальное окно редактирования команды
│   └── SiteHeader.tsx      # Хедер публичного сайта
│
├── constants/
│   ├── storageKeys.ts      # Ключи localStorage для токенов
│   └── eventConstants.ts   # Справочники форматов и статусов событий
│
├── context/
│   └── UserAuthContext.tsx # JWT-контекст для кабинета участника
│
├── pages/                  # По одному файлу на маршрут
│   ├── Login.tsx
│   ├── RegisterPage.tsx
│   ├── OnboardingPage.tsx
│   ├── Dashboard.tsx
│   ├── Events.tsx
│   ├── EventForm.tsx       # Создание и редактирование события (один компонент)
│   ├── EventDetail.tsx     # Детали события + список бронирований
│   ├── Bookings.tsx
│   ├── Categories.tsx
│   ├── DocumentTemplates.tsx
│   ├── Users.tsx
│   ├── Inquiries.tsx
│   ├── NotificationSettings.tsx
│   ├── TenantSettings.tsx
│   ├── WidgetSettings.tsx
│   └── NotFound.tsx
│
├── types/
│   └── index.ts            # Все TypeScript-интерфейсы
│
├── utils/
│   ├── tokenUtils.ts       # Разбор JWT, проверка срока, очистка токенов
│   └── format.ts           # Форматирование дат и сумм
│
├── App.tsx                 # Дерево маршрутов
└── main.tsx                # Точка входа, провайдеры
```

## Маршруты

| Путь | Компонент | Описание |
|------|-----------|----------|
| `/login` | `Login` | Вход по логину и паролю |
| `/register` | `RegisterPage` | Регистрация нового администратора |
| `/onboarding` | `OnboardingPage` | Мастер настройки нового тенанта (тип бизнеса → виджет) |
| `/admin` | `Dashboard` | Дашборд: метрики, ближайшие события, выручка |
| `/admin/events` | `Events` | Список событий с фильтрами |
| `/admin/events/new` | `EventForm` | Создание события |
| `/admin/events/:id` | `EventDetail` | Детали события, бронирования, документы |
| `/admin/events/:id/edit` | `EventForm` | Редактирование события |
| `/admin/bookings` | `Bookings` | Все бронирования с поиском и фильтрами |
| `/admin/categories` | `Categories` | Управление категориями и их настройками |
| `/admin/documents` | `DocumentTemplates` | Шаблоны документов для электронной подписи |
| `/admin/users` | `Users` | Список пользователей, управление ролями |
| `/admin/inquiries` | `Inquiries` | Заявки и обращения |
| `/admin/notifications` | `NotificationSettings` | Расписание автоматических напоминаний |
| `/admin/tenant` | `TenantSettings` | Настройки организации, подписка, терминология |
| `/admin/widget` | `WidgetSettings` | Конфигурация встраиваемого виджета |

Все маршруты под `/admin` обёрнуты в `ProtectedRoute` — при отсутствии валидного токена происходит редирект на `/login`.

## Авторизация

В приложении два независимых JWT-контекста:

**`AuthContext`** — для панели администратора.
- Токен хранится в `localStorage` под ключом `token`.
- Автоматический выход по истечении срока (таймер на разницу `exp - now`).
- `ProtectedRoute` проверяет `isAuthenticated` из этого контекста.

**`UserAuthContext`** — для кабинета участника (публичная часть).
- Токен под ключом `user_token`.
- Если пользователь кабинета имеет роль `ADMIN` или `MODERATOR`, его токен также используется Axios-клиентом для запросов к API.

## API-клиент (`api/client.ts`)

- Базовый URL: `/api` (проксируется через Vite или Caddy в production)
- Перед каждым запросом проверяет срок действия токена; если истёк — очищает localStorage и редиректит на `/login`
- Приоритет токена: явный admin-токен → user-токен с admin-ролью
- При ответе `401` — автоматический разлогин и редирект

## Типы (`types/index.ts`)

Основные интерфейсы:

| Интерфейс | Описание |
|-----------|----------|
| `LoginRequest` / `TokenResponse` | Авторизация |
| `User` | Пользователь (id, имя, роль, tenantId) |
| `EventCategory` | Категория событий |
| `Event` | Событие с расписанием, ценой, местами |
| `EventFormData` | Форма создания/редактирования события |
| `Booking` | Бронирование (статус, оплата, гостевые данные, документы) |
| `AdminBookingRequest` | Запрос на создание бронирования |
| `BookingSummary` | Счётчики мест и бронирований для события |
| `ParticipantProfile` | Профиль участника |
| `Notification` | Уведомление пользователя |
| `DocumentTemplate` | Шаблон документа |
| `BookingDocument` | Документ, привязанный к бронированию |
| `Inquiry` | Обращение / заявка |
| `TenantInfo` | Данные тенанта (план, настройки, лейблы) |
| `TenantConfigUpdateRequest` | Обновление настроек тенанта |
| `WidgetConfig` / `WidgetConfigUpdateRequest` | Конфигурация виджета |

## Docker

```bash
# Локальная сборка образа
docker build -t soldo-admin .

# Запуск на порту 3000
docker run -p 3000:80 soldo-admin
```

`Dockerfile` — multi-stage сборка: `node:20` (сборка Vite) → `nginx:1.27` (раздача статики). Конфигурация nginx в `nginx.conf` — SPA fallback (`try_files $uri /index.html`), кэширование статических ассетов.

## Production

В production панель работает как часть общего стека через `docker-compose.prod.yml` (см. корень проекта). Caddy проксирует все запросы, кроме `/api/*` и `/public/*`, на контейнер `admin-panel`.

```bash
# Из корня проекта
cp .env.example .env
# Заполнить .env
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Подробнее — см. [DEPLOYMENT.md](../DEPLOYMENT.md).
