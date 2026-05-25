<div align="center">

# Poker Planning Frontend

**Клиентское приложение для проведения планирования покером**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## Содержание

- [Описание](#описание)
- [Технологический стек](#технологический-стек)
- [Структура проекта](#структура-проекта)
- [Интеграции](#интеграции)
- [Быстрый старт](#быстрый-старт)
- [Команды](#команды)

---

## Описание

Frontend — клиентское приложение для участия в сессиях планирования покером. Обеспечивает создание комнат, голосование картами, просмотр результатов в реальном времени через WebSocket.

Backend подключается как внешний Python-сервис по URL из `.env`.

---

## Технологический стек

<div align="center">

|     **Категория**     |                             **Технологии**                             |   **Версия**    |
| :-------------------: | :--------------------------------------------------------------------: | :-------------: |
|    Язык / Рантайм     |                      React + TypeScript + Node.js                      |    19 / 5.8     |
|        Сборка         |                            [Vite](vite.dev)                            |      6.2.0      |
|        Роутинг        |                     React Router (Framework Mode)                      |      7.5.0      |
|     Серверный кэш     |                 [TanStack Query](https://tanstack.com)                 |     5.68.0      |
|    Валидация форм     | [React Hook Form](https://react-hook-form.io) + [Zod](https://zod.dev) | 7.50.0 / 3.22.4 |
|      HTTP-клиент      |                    [Axios](https://axios-http.com)                     |      1.8.4      |
|   Состояние клиента   |              [Zustand](https://github.com/pmndrs/zustand)              |     5.0.12      |
|     UI Компоненты     |                 [Headless UI](https://headlessui.dev)                  |     2.2.10      |
|         Стили         |                        Tailwind CSS 4 + PostCSS                        |      4.1.4      |
| Переиспользуемые типы |                            `@poker/shared`                             |      0.1.0      |
|     Качество кода     |                     ESLint + Prettier + Stylelint                      |     latest      |

</div>

---

## Структура проекта

```
frontend/
├── src/
│   ├── main.tsx
│   └── styles.css
├── .env.example
├── index.html
├── vite.config.ts
├── tsconfig.app.json
├── tsconfig.json
└── package.json
```

### Методология: Feature-Sliced Design

Проект использует FSD (Feature-Sliced Design) с отделением по слоям:

```
src/
├── app/          # Инициализация приложения, глобальные провайдеры
├── pages/        # Страницы приложения (маршруты)
├── features/     # Бизнес-сценарии (auth, join-room, voting)
├── entities/     # Доменные сущности (room, user, task)
├── shared/       # Переиспользуемые UI компоненты, утилиты, конфиги
├── widgets/      # Составные компоненты (Header, Footer, ParticipantsList)
└── main.tsx      # Точка входа
```

---

## Интеграции

- API Base URL: `VITE_API_URL` (по умолчанию `http://localhost:8000/api/v1`)
- WebSocket URL: `VITE_WS_URL` (по умолчанию `ws://localhost:8000/ws`)
- Контракты данных: через workspace-пакет `@poker/shared`

---

## Быстрый старт

### Требования

- `Node.js 20+`
- `pnpm 9+`

### Установка

```bash
# Из корня монорепозитория
pnpm install

# Копирование env в папке frontend
cp frontend/.env.example frontend/.env

# Запуск dev-сервера frontend
pnpm --filter @poker/frontend dev
```

### Настройки по умолчанию

- Frontend: `http://localhost:5173`
- Backend API (внешний): `http://localhost:8000`

---

## Команды

```bash
# Запуск dev-сервера frontend
pnpm --filter @poker/frontend dev

# Production-сборка frontend
pnpm --filter @poker/frontend build

# Предпросмотр production-сборки
pnpm --filter @poker/frontend preview

# Линтинг frontend
pnpm --filter @poker/frontend lint

# Автоисправление линтинга + форматирование frontend/src
pnpm --filter @poker/frontend lint:fix

# Только ESLint frontend (проверка / автоисправление)
pnpm --filter @poker/frontend lint:eslint
pnpm --filter @poker/frontend lint:eslint:fix

# Только Stylelint frontend (проверка / автоисправление)
pnpm --filter @poker/frontend lint:style
pnpm --filter @poker/frontend lint:style:fix

# Форматирование frontend/src
pnpm --filter @poker/frontend format
pnpm --filter @poker/frontend format:check

# Проверка типов frontend
pnpm --filter @poker/frontend typecheck
```
