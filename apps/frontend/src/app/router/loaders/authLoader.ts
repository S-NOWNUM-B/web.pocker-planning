import { redirect } from 'react-router-dom'; // Импорт функции redirect из react-router-dom
import { SessionManager } from '@/shared/lib/session'; // Импорт SessionManager для управления сессией пользователя
import { getUser } from '@/entities/user'; // Импорт функции getUser для получения информации о пользователе

// Асинхронная функция authLoader, которая проверяет наличие токена и получает информацию о пользователе
export async function authLoader() {
  const token = SessionManager.getToken(); // Получение токена из SessionManager

  if (!token) {
    return redirect('/login');
  }

  try {
    const user = await getUser(); // Получение информации о пользователе с помощью функции getUser
    return { user };
  } catch {
    SessionManager.removeToken(); // Удаление токена из SessionManager в случае ошибки при получении информации о пользователе
    return redirect('/login');
  }
}
