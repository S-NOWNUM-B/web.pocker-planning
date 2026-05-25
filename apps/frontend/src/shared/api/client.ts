import axios from 'axios'; // Импортируем библиотеку axios для выполнения HTTP-запросов к API
import type { ApiError } from '@poker/shared'; // Импортируем тип ApiError из общего пакета shared для использования в типизации ошибок, возвращаемых API
import { SessionManager } from '@/shared/lib/session'; // Импортируем SessionManager из общего пакета shared для управления сессией пользователя, включая получение токена для авторизации при выполнении запросов к API

// Создаем экземпляр axios с базовым URL, который может быть задан через переменную окружения VITE_API_URL или по умолчанию будет '/api/v1'. Также устанавливаем заголовок Content-Type для всех запросов как 'application/json'.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor для добавления токена авторизации в заголовки каждого запроса, если токен доступен. Это позволяет API распознавать аутентифицированного пользователя при каждом запросе.
api.interceptors.request.use((config) => {
  const token = SessionManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor для обработки ошибок, возвращаемых API. Если ответ содержит ошибку, мы формируем объект ApiError с соответствующими полями и отклоняем промис с этим объектом, что позволяет централизованно обрабатывать ошибки в приложении.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    const apiError: ApiError = {
      statusCode: error.response?.status || 500,
      error: error.response?.data?.error || 'Unknown error',
      message:
        error.response?.data?.message || (typeof detail === 'string' ? detail : error.message),
    };
    return Promise.reject(apiError);
  },
);

export type { ApiError };
