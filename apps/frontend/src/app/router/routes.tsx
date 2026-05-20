import { createBrowserRouter, Outlet } from 'react-router-dom'; // Импорт функции для создания маршрутизатора и компонента Outlet для отображения вложенных маршрутов
import { AuthLayout, RootLayout } from '../layouts'; // Импорт лейаутов для аутентификации и корневого лейаута
import { authLoader, publicOnlyLoader } from './loaders'; // Импорт загрузчиков для маршрутов, которые проверяют аутентификацию пользователя и перенаправляют при необходимости
import { loginAction, registerAction } from './actions'; // Импорт действий для обработки форм входа и регистрации, которые выполняются при отправке форм на соответствующих маршрутах
import {
  OnboardingPage,
  CreateRoomPage,
  JoinRoomPage,
  InvitePage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  AboutPage,
  RoomPage,
  NotFoundPage,
} from '../../pages'; // Импорт всех страниц приложения, которые будут использоваться в маршрутах

// Вспомогательный компонент для оборачивания страниц входа и регистрации в лейаут аутентификации, чтобы обеспечить единый стиль и структуру для этих страниц
function AuthLayoutWrapper() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}

// Создание маршрутизатора с определением всех маршрутов приложения, их компонентов, загрузчиков и действий
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: '/',
        element: <OnboardingPage />,
      },
      {
        path: '/create-room',
        element: <CreateRoomPage />,
      },
      {
        path: '/join-room',
        element: <JoinRoomPage />,
      },
      {
        path: '/invite/:token',
        element: <InvitePage />,
      },
      {
        path: '/about',
        element: <AboutPage />,
      },
      {
        path: '/room/:roomId',
        element: <RoomPage />,
      },
      {
        path: '/login',
        loader: publicOnlyLoader,
        element: <AuthLayoutWrapper />,
        children: [
          {
            index: true,
            action: loginAction,
            element: <LoginPage />,
          },
        ],
      },
      {
        path: '/register',
        loader: publicOnlyLoader,
        element: <AuthLayoutWrapper />,
        children: [
          {
            index: true,
            action: registerAction,
            element: <RegisterPage />,
          },
        ],
      },
      {
        path: '/dashboard',
        loader: authLoader,
        element: <DashboardPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
