import { Outlet, useNavigate } from 'react-router-dom'; // Импорт компонентов для маршрутизации: Outlet для отображения вложенных маршрутов и useNavigate для программной навигации
import { useSession } from '@/app/providers'; // Импорт пользовательского хука useSession для получения информации о текущей сессии пользователя (например, аутентификация, данные пользователя)
import { Footer, Header } from '@/widgets'; // Импорт компонентов Footer и Header из папки widgets, которые будут использоваться для отображения в корневом лейауте

// Компонент RootLayout, который используется как корневой лейаут для всего приложения, включает в себя Header, Footer и Outlet для отображения вложенных маршрутов
export function RootLayout() {
  const { isAuthenticated, isLoading, user, logout } = useSession(); // Получение информации о текущей сессии пользователя, включая статус аутентификации, загрузки, данные пользователя и функцию для выхода из системы
  const navigate = useNavigate(); // Получение функции navigate для программной навигации между маршрутами

  const showLoginButton = !isLoading && !isAuthenticated;
  const showRegisterButton = !isLoading && !isAuthenticated;
  const showProfileMenu = !isLoading && isAuthenticated;
  const profileLabel = user?.name || user?.email || 'Профиль';

  // Функция для обработки выхода из системы, которая вызывает функцию logout и затем перенаправляет пользователя на главную страницу
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      <Header
        showLoginButton={showLoginButton}
        showRegisterButton={showRegisterButton}
        showProfileMenu={showProfileMenu}
        profileLabel={profileLabel}
        onLogout={handleLogout}
      />
      <Outlet />
      <Footer />
    </>
  );
}
