declare module '*.css'; // Декларация для импортов CSS файлов, чтобы TypeScript не выдавал ошибку при импорте стилей

import { RouterProvider } from 'react-router-dom'; // Импорт компонента для предоставления маршрутизации в приложении
import { AppProviders } from './app/providers'; // Импорт компонента, который оборачивает все провайдеры (например, контексты) для приложения
import { router } from './app/router'; // Импорт объекта маршрутизатора, который содержит все маршруты приложения
import './app/styles/index.css'; // Импорт глобальных стилей для приложения

// Главный компонент приложения, который оборачивает все провайдеры и предоставляет маршрутизацию
function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export default App;
