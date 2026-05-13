<div align="center">

# Poker Planning Architecture

**Архитектурное описание системы и границ компонентов**

[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](../README.md)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](../apps/backend/README.md)

</div>

---

## Содержание

- [Системный обзор](#системный-обзор)
- [Ключевые потоки](#ключевые-потоки)
- [Backend слои](#backend-слои)
- [Frontend границы](#frontend-границы)
- [Интеграции](#интеграции)
- [Нефункциональные требования](#нефункциональные-требования)

---

## Системный обзор

Backend работает как полноценный Python-сервис на FastAPI и предоставляет API/WebSocket для frontend.

<div align="center">

| **Домен**   | **Технология**                 | **Назначение**                                       |
| :---------- | :----------------------------- | :--------------------------------------------------- |
| Frontend    | React 19 + Vite 6 + TypeScript | UI и пользовательские сценарии                       |
| Backend     | FastAPI 0.115 + Python 3.13    | API, бизнес-логика, синхронизация в реальном времени |
| База данных | PostgreSQL 16 + SQLAlchemy 2.0 | Хранение данных, ORM                                 |
| Миграции    | Alembic 1.15                   | Управление схемой БД                                 |

</div>

---

## Ключевые потоки

### Создание комнаты и голосование

1. Модератор создаёт комнату через REST API.
2. Участники подключаются по ссылке и присоединяются через WebSocket.
3. Модератор объявляет задачу для оценки.
4. Каждый участник выбирает карту — WebSocket рассылает `player_voted`.
5. Модератор открывает результаты — WebSocket рассылает `reveal_votes`.
6. Все участники одновременно видят результаты голосования.

### Фоновое обновление состояния

1. WebSocket-соединение поддерживает актуальное состояние комнаты.
2. При переподключении TanStack Query синхронизирует состояние с сервером.
3. Кэш Redis восстанавливает последнюю сессию.

---

## Backend слои

<div align="center">

| **Слой**     | **Папка**           | **Назначение**                                                 |
| :----------- | :------------------ | :------------------------------------------------------------- |
| API Routes   | `app/api/routes/`   | REST-контроллеры, контракты запросов/ответов, обработка ошибок |
| Services     | `app/services/`     | Бизнес-правила комнат, раундов и голосования                   |
| Repositories | `app/repositories/` | Слой доступа к данным (SQLAlchemy queries)                     |
| WebSocket    | `app/websocket/`    | WebSocket события, broadcast состояния комнаты                 |
| Core         | `app/core/`         | Конфигурация, security, зависимости FastAPI                    |
| Schemas      | `app/schemas/`      | Pydantic модели (DTO) для валидации данных                     |
| Models       | `app/models/`       | SQLAlchemy ORM модели                                          |
| Database     | `app/db/`           | Сессия и базовая модель ORM                                    |

</div>

### Структура backend

```
apps/backend/app/
├── api/routes/          # FastAPI маршруты (auth, rooms, voting, ws)
├── core/                # Конфигурация, JWT security, зависимости
├── db/                  # Database session (SQLAlchemy)
├── models/              # SQLAlchemy ORM модели (9 таблиц)
├── repositories/        # Data access layer
├── schemas/             # Pydantic DTO схемы
├── services/            # Бизнес-логика (auth, rooms, voting)
└── websocket/           # WebSocket connection manager
```

---

## Frontend границы

Проект следует методологии Feature-Sliced Design.

<div align="center">

| **Директория** | **Назначение**                               |
| :------------- | :------------------------------------------- |
| `app/`         | Роуты, инициализация, провайдеры приложения  |
| `pages/`       | Страницы пользовательских сценариев          |
| `widgets/`     | Крупные композиционные UI-блоки              |
| `features/`    | Изолированные пользовательские действия      |
| `entities/`    | Сущности предметной области                  |
| `shared/`      | Переиспользуемые модули (`api`, `ui`, `lib`) |

</div>

---

## Интеграции

<div align="center">

| **Категория**  | **Frontend технология**    | **Backend технология**     | **Назначение**              |
| :------------- | :------------------------- | :------------------------- | :-------------------------- |
| HTTP-запросы   | Axios + TanStack Query     | FastAPI REST               | API запросы, кэширование    |
| Реальное время | WebSocket (браузерный API) | FastAPI WebSocket endpoint | Голосование, синхронизация  |
| Валидация      | Zod + React Hook Form      | Pydantic v2                | Формы, схемы данных         |
| UI-компоненты  | Headless UI                | —                          | Доступные компоненты        |
| Управление кэшем | Zustand                  | —                          | Клиентское состояние        |
| База данных    | —                          | SQLAlchemy 2.0 + Alembic   | ORM, миграции PostgreSQL    |
| Аутентификация | LocalStorage (JWT)         | PyJWT + pwdlib (argon2)    | Токены, хеширование паролей |

</div>

---

## Нефункциональные требования

<div align="center">

| **Требование**     | **Подход**                                            |
| :----------------- | :---------------------------------------------------- |
| Производительность | HMR через Vite, кэш TanStack Query                    |
| Масштабируемость   | WebSocket для реального времени, без polling          |
| Надёжность         | Переподключение WebSocket, восстановление кэша        |
| Безопасность       | Валидация Zod, защита от несанкционированного доступа |
| Доступность        | Адаптивный UI, базовая a11y                           |

</div>
