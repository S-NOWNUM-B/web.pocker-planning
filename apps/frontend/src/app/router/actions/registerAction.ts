import { redirect } from 'react-router-dom'; // Импорт функции redirect для перенаправления пользователя на другой маршрут после успешного входа
import { register as registerRequest } from '@/entities/user'; // Импорт функции register из модуля user, которая выполняет запрос на сервер для создания нового пользователя и получения данных сессии
import { SessionManager } from '@/shared/lib/session'; // Импорт SessionManager, который отвечает за управление токенами сессии, включая сохранение, удаление и извлечение токена из хранилища (например, localStorage) и уведомление об изменениях сессии
import type { ApiError } from '@/shared/api'; // Импорт типа ApiError для типизации ошибок, которые могут возникать при работе с API

// Функция для выполнения действия регистрации, которая будет использоваться в маршрутизации для обработки логики создания нового пользователя
export async function registerAction({ request }: { request: Request }) {
  const formData = await request.formData(); // Получение данных формы из запроса, который содержит данные, введённые пользователем для регистрации (например, email, пароль и имя)
  const email = formData.get('email') as string; // Извлечение значения email из данных формы и приведение его к типу string для использования в запросе на сервер
  const password = formData.get('password') as string; // Извлечение значения password из данных формы и приведение его к типу string для использования в запросе на сервер
  const name = formData.get('name') as string; // Извлечение значения name из данных формы и приведение его к типу string для использования в запросе на сервер

  try {
    const authData = await registerRequest({ email, password, name }); // Выполнение запроса на сервер для создания нового пользователя с помощью функции registerRequest, которая возвращает данные сессии (например, токен и информацию о пользователе) при успешной регистрации
    SessionManager.saveToken(authData.access_token, authData.user); // Сохранение токена сессии и данных пользователя с помощью SessionManager, который может сохранять их в localStorage или другом хранилище и уведомлять об изменениях сессии
    return redirect('/dashboard'); // Перенаправление пользователя на маршрут /dashboard после успешной регистрации, используя функцию redirect из react-router-dom
  } catch (error) {
    const apiError = error as ApiError;
    return {
      error: apiError.message || 'Произошла ошибка при регистрации',
    };
  }
}
