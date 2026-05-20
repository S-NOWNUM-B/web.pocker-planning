import { redirect } from 'react-router-dom'; // Импорт функции redirect из react-router-dom
import { SessionManager } from '@/shared/lib/session'; // Импорт SessionManager для управления сессией пользователя
import { getUser } from '@/entities/user'; // Импорт функции getUser для получения информации о пользователе

// Асинхронная функция publicOnlyLoader, которая проверяет наличие токена и перенаправляет пользователя на панель управления, если он уже авторизован
export async function publicOnlyLoader() {
  const token = SessionManager.getToken(); // Получение токена из SessionManager

  if (!token) {
    return null;
  }

  try {
    await getUser(); // Попытка получить информацию о пользователе с помощью функции getUser
    return redirect('/dashboard');
  } catch {
    SessionManager.removeToken({ notify: false }); // Удаление токена из SessionManager в случае ошибки при получении информации о пользователе, без уведомления
    return null;
  }
}
