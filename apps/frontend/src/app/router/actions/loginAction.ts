import { redirect } from 'react-router-dom'; // Импорт функции redirect для перенаправления пользователя на другой маршрут после успешного входа
import { login as loginRequest } from '@/entities/user'; // Импорт функции login из модуля user, которая выполняет запрос на сервер для аутентификации пользователя и получения данных сессии
import { SessionManager } from '@/shared/lib/session'; // Импорт SessionManager, который отвечает за управление токенами сессии, включая сохранение, удаление и извлечение токена из хранилища (например, localStorage) и уведомление об изменениях сессии
import type { ApiError } from '@/shared/api'; // Импорт типа ApiError для типизации ошибок, которые могут возникать при работе с API

// Функция для выполнения действия входа в систему, которая будет использоваться в маршрутизации для обработки логики аутентификации
export async function loginAction({ request }: { request: Request }) {
  const formData = await request.formData(); // Получение данных формы из запроса, который содержит данные, введённые пользователем для входа (например, email и пароль)
  const email = formData.get('email') as string; // Извлечение значения email из данных формы и приведение его к типу string для использования в запросе на сервер
  const password = formData.get('password') as string; // Извлечение значения password из данных формы и приведение его к типу string для использования в запросе на сервер

  try {
    const authData = await loginRequest({ email, password }); // Выполнение запроса на сервер для аутентификации пользователя с помощью функции loginRequest, которая возвращает данные сессии (например, токен и информацию о пользователе) при успешной аутентификации
    SessionManager.saveToken(authData.access_token, authData.user); // Сохранение токена сессии и данных пользователя с помощью SessionManager, который может сохранять их в localStorage или другом хранилище и уведомлять об изменениях сессии
    return redirect('/dashboard'); // Перенаправление пользователя на маршрут /dashboard после успешного входа, используя функцию redirect из react-router-dom
  } catch (error) {
    const apiError = error as ApiError; // Приведение ошибки к типу ApiError для извлечения информации об ошибке, которая может быть возвращена сервером при неудачной попытке входа (например, неправильные учетные данные)
    return {
      error: apiError.message || 'Произошла ошибка при входе',
    };
  }
}
