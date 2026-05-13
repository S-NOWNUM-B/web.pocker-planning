<div align="center">

# Poker Planning Backend

**Серверная часть приложения для проведения планирования покером**

[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-FF5733)](https://www.sqlalchemy.org/)

</div>

---

## Содержание

- [Описание](#описание)
- [Технологический стек](#технологический-стек)
- [Архитектура](#архитектура)
- [Структура проекта](#структура-проекта)
- [Быстрый старт](#быстрый-старт)
- [Команды](#команды)
- [API документация](#api-документация)
- [Конфигурация](#конфигурация)
- [Миграции](#миграции)

---

## Описание

Backend-сервис для приложения Poker Planning обеспечивает:

- **REST API** — управление комнатами, участниками, сессиями, голосованием
- **WebSocket** — real-time синхронизация голосований
- **Аутентификация** — JWT-токены для защиты endpoints
- **Валидация данных** — Pydantic схемы для входящих/исходящих данных
- **Миграции БД** — Alembic для управления схемой PostgreSQL
- **Seed данные** — автоматическое наполнение демо-данными

---

## Технологический стек

<div align="center">

|    **Категория**    |                                  **Технологии**                                   | **Версия** |
| :-----------------: | :-------------------------------------------------------------------------------: | :--------: |
|   Язык / Рантайм    |                         [Python](https://www.python.org/)                         |   3.13+    |
|   HTTP-фреймворк    |                     [FastAPI](https://fastapi.tiangolo.com/)                      |  0.115.12  |
|     ASGI-сервер     |                        [Uvicorn](https://www.uvicorn.org/)                        |   0.34.0   |
|         ORM         |                     [SQLAlchemy](https://www.sqlalchemy.org/)                     |   2.0.40   |
|     Миграции БД     |                    [Alembic](https://alembic.sqlalchemy.org/)                     |   1.15.2   |
|     База данных     |                     [PostgreSQL](https://www.postgresql.org/)                     |    16+     |
|     Драйвер БД      |                        [psycopg](https://www.psycopg.org/)                        |   3.2.6    |
|   Валидация схем    |                      [Pydantic](https://docs.pydantic.dev/)                       |   2.11.3   |
|      Настройки      | [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) |   2.8.1    |
|   Аутентификация    |                      [PyJWT](https://pyjwt.readthedocs.io/)                       |   2.10.1   |
| Хеширование паролей |                [pwdlib](https://github.com/pwdlib/pwdlib) (argon2)                |   0.2.1    |
|   Валидация email   |       [email-validator](https://github.com/JoshData/python-email-validator)       |   2.2.0    |

</div>

---

## Архитектура

```mermaid
flowchart TD
    subgraph Client["Клиенты"]
        FE["Frontend (React)"]
    end

    subgraph Backend["Backend Service (FastAPI)"]
        Router["REST API Router /\n(/api/v1)"]
        WSServer["WebSocket Server /\n(/ws)"]
        Controllers["API Routes /\n(auth, rooms, voting)"]
        Services["Services /\n(business logic)"]
        Repositories["Repositories /\n(data access)"]
        Middleware["Middleware /\n(CORS, auth, validation)"]
    end

    subgraph Data["Данные"]
        DB[("PostgreSQL")]
    end

    FE -->|HTTP REST| Router
    FE <-->|WebSocket| WSServer
    Router --> Middleware
    WSServer --> Middleware
    Middleware --> Controllers
    Controllers --> Services
    Services --> Repositories
    Repositories --> DB
```

---

## Быстрый старт

### Требования

<div align="center">

|      Компонент       | Минимум | Рекомендуется |
| :------------------: | :-----: | :-----------: |
|        Python        |  3.11   |     3.13+     |
|      PostgreSQL      |   14    |      16       |
|         pip          |   22+   |      24+      |
| Docker (опционально) |   20+   |      24+      |

</div>

### Способ 1: Локальная разработка

#### 1. Создание виртуального окружения

```bash
cd apps/backend

# Создание виртуального окружения
python3 -m venv .venv

# Активация (Linux/macOS)
source .venv/bin/activate

# Активация (Windows)
# .venv\Scripts\activate
```

#### 2. Установка зависимостей

```bash
pip install -r requirements.txt
```

#### 3. Настройка окружения

```bash
# Копирование примера .env
cp .env.example .env

# Редактирование .env (укажите реальные значения)
```

#### 4. Запуск PostgreSQL

```bash
# Из корня монорепозитория
docker compose -f infrastructure/docker-compose.yml up -d postgres
```

#### 5. Применение миграций

```bash
alembic upgrade head
```

#### 6. Запуск сервера

```bash
# Режим разработки (с auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Или через Docker Compose
docker compose -f apps/backend/docker-compose.yml up
```

### Способ 2: Docker Compose

```bash
# Из папки apps/backend
docker compose up --build

# Backend доступен на http://localhost:8000
# PostgreSQL на localhost:5432
```

### Настройки по умолчанию

- Backend API: `http://localhost:8000`
- WebSocket: `ws://localhost:8000/ws`
- API v1: `http://localhost:8000/api/v1`
- Health check: `http://localhost:8000/health`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Команды

### Python environment

```bash
# Создание виртуального окружения
python3 -m venv .venv

# Активация (Linux/macOS)
source .venv/bin/activate

# Активация (Windows)
# .venv\Scripts\activate

# Установка зависимостей
pip install -r requirements.txt
```

### Миграции базы данных

```bash
# Применить все миграции
alembic upgrade head

# Откатить последнюю миграцию
alembic downgrade -1

# Создать новую миграцию
alembic revision -m "описание_изменений"

# Просмотреть историю миграций
alembic history

# Просмотреть текущую версию
alembic current
```

### Запуск сервера

```bash
# Режим разработки (auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production режим
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker

```bash
# Запуск через Docker Compose
docker compose up

# Запуск в фоновом режиме
docker compose up -d

# Пересборка образов
docker compose up --build

# Остановка
docker compose down

# Остановка с удалением volumes
docker compose down -v
```

---

## API документация

### REST API endpoints

| Метод  | Endpoint                            | Описание                       | Auth |
| :----- | :---------------------------------- | :----------------------------- | :--: |
| `POST` | `/api/v1/auth/register`             | Регистрация пользователя       |  ❌  |
| `POST` | `/api/v1/auth/login`                | Вход и получение токена        |  ❌  |
| `POST` | `/api/v1/rooms`                     | Создание комнаты               |  ✅  |
| `GET`  | `/api/v1/rooms/:id`                 | Получение информации о комнате |  ✅  |
| `GET`  | `/api/v1/rooms/:id/participants`    | Список участников              |  ✅  |
| `POST` | `/api/v1/rooms/:id/join`            | Присоединение к комнате        |  ✅  |
| `POST` | `/api/v1/invitations`               | Создание ссылки-приглашения    |  ✅  |
| `POST` | `/api/v1/voting/rounds`             | Создание раунда голосования    |  ✅  |
| `POST` | `/api/v1/voting/rounds/:id/votes`   | Голосование                    |  ✅  |
| `GET`  | `/api/v1/voting/rounds/:id/results` | Результаты голосования         |  ✅  |
| `POST` | `/api/v1/voting/rounds/:id/reveal`  | Раскрытие карт                 |  ✅  |
| `POST` | `/api/v1/voting/rounds/:id/reset`   | Сброс голосования              |  ✅  |
| `GET`  | `/health`                           | Health check                   |  ❌  |

### WebSocket события

#### Client → Server

| Событие          | Payload                         | Описание                  |
| :--------------- | :------------------------------ | :------------------------ |
| `join_room`      | `{ roomId, userId }`            | Присоединение к комнате   |
| `leave_room`     | `{ roomId, userId }`            | Выход из комнаты          |
| `vote`           | `{ roomId, userId, cardValue }` | Голосование картой        |
| `request_reveal` | `{ roomId }`                    | Запрос раскрытия карт     |
| `request_reset`  | `{ roomId }`                    | Запрос сброса голосования |

#### Server → Client

| Событие              | Payload                                | Описание                  |
| :------------------- | :------------------------------------- | :------------------------ |
| `room_state`         | `{ roomId, participants, status }`     | Текущее состояние комнаты |
| `vote_update`        | `{ userId, hasVoted }`                 | Обновление статуса голоса |
| `votes_revealed`     | `{ participants, average, consensus }` | Результаты голосования    |
| `room_reset`         | `{ roomId }`                           | Сброс комнаты             |
| `participant_joined` | `{ participant }`                      | Новый участник            |
| `participant_left`   | `{ userId }`                           | Участник вышел            |
| `error`              | `{ message, code }`                    | Ошибка                    |

---

## Конфигурация

### Переменные окружения

| Переменная                    | Описание                            | По умолчанию            | Обязательная |
| :---------------------------- | :---------------------------------- | :---------------------- | :----------: |
| `APP_NAME`                    | Название приложения                 | `Покер-планирование`    |      ❌      |
| `ENVIRONMENT`                 | Окружение (development/production)  | `development`           |      ❌      |
| `API_V1_PREFIX`               | Префикс API v1                      | `/api/v1`               |      ❌      |
| `DATABASE_URL`                | Строка подключения к PostgreSQL     | —                       |      ✅      |
| `JWT_SECRET_KEY`              | Секретный ключ для JWT              | `change-me`             |      ✅      |
| `JWT_ALGORITHM`               | Алгоритм JWT                        | `HS256`                 |      ❌      |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Время жизни токена (минуты)         | `10080` (7 дней)        |      ❌      |
| `FRONTEND_URL`                | URL frontend для CORS               | `http://localhost:3000` |      ❌      |
| `CORS_ORIGINS`                | Разрешённые origins (через запятую) | `http://localhost:3000` |      ❌      |
| `SEED_DEMO_DATA`              | Заполнить демо-данными              | `false`                 |      ❌      |
| `DEMO_USER_PASSWORD`          | Пароль для демо-пользователя        | `DemoPass123!`          |      ❌      |

### Пример .env

```env
# Application
APP_NAME=Покер-планирование
ENVIRONMENT=development
API_V1_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/planning_poker

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Demo Data
SEED_DEMO_DATA=false
DEMO_USER_PASSWORD=DemoPass123!
```

---

## Миграции

### Создание новой миграции

```bash
# Автогенерация из моделей
alembic revision --autogenerate -m "описание_изменений"

# Ручное создание
alembic revision -m "описание_изменений"
```

### Применение миграций

```bash
# Применить все миграции
alembic upgrade head

# Применить до конкретной версии
alembic upgrade <revision_id>

# Откатить одну миграцию
alembic downgrade -1
```

### Полезные команды

```bash
# Просмотр истории
alembic history --verbose

# Текущая версия
alembic current

# Проверка статуса
alembic check
```
