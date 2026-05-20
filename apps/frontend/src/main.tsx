import { StrictMode } from 'react'; // Импорт компонента StrictMode для выявления потенциальных проблем в приложении
import { createRoot } from 'react-dom/client'; // Импорт функции createRoot для создания корневого элемента, в который будет рендериться приложение
import App from './App'; // Импорт главного компонента приложения

// Создание корневого элемента и рендеринг приложения внутри StrictMode для выявления потенциальных проблем
createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
