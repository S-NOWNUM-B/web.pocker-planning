import { type ReactNode } from 'react'; // Импорт типа ReactNode для определения типа пропса children, который может быть любым валидным React-элементом или строкой
import { QueryClientProvider } from '@tanstack/react-query'; // Импорт компонента QueryClientProvider из библиотеки react-query для предоставления контекста QueryClient всему приложению, что позволяет использовать хуки и функции react-query для управления серверными данными
import { queryClient } from '@/shared/config'; // Импорт экземпляра QueryClient из конфигурационного файла, который будет использоваться для настройки QueryClientProvider
import { SessionProvider } from './SessionProvider'; // Импорт компонента SessionProvider, который предоставляет контекст для управления состоянием сессии пользователя, включая аутентификацию и данные пользователя

// Определение интерфейса AppProvidersProps, который описывает тип пропсов для компонента AppProviders. В данном случае, он ожидает один пропс children, который может быть любым валидным React-элементом или строкой
interface AppProvidersProps {
  children: ReactNode;
}

// Компонент AppProviders, который оборачивает все приложение в провайдеры SessionProvider и QueryClientProvider, обеспечивая доступ к состоянию сессии и функционалу react-query во всех компонентах приложения
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
