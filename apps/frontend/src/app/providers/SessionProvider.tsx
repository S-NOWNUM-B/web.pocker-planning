import { createContext, useContext, useEffect, useState } from 'react'; // Импорт хуков и функций из React для создания контекста, управления состоянием и побочными эффектами
import {
  getUser as getUserRequest,
  login as loginRequest,
  register as registerRequest,
} from '@/entities/user'; // Импорт функций для работы с API, связанных с пользователем: получение данных текущего пользователя, вход в систему и регистрация
import type { ApiError } from '@/shared/api'; // Импорт типа ApiError для типизации ошибок, которые могут возникать при работе с API
import type { User } from '@/entities/user'; // Импорт типа User для типизации данных пользователя, которые будут храниться в состоянии сессии
import type { LoginCredentials, RegisterCredentials } from '@/entities/user'; // Импорт типов для типизации данных, необходимых для входа в систему и регистрации пользователя
import { SessionManager } from '@/shared/lib/session'; // Импорт SessionManager, который отвечает за управление токенами сессии, включая сохранение, удаление и извлечение токена из хранилища (например, localStorage) и уведомление об изменениях сессии

// Функция для извлечения сообщения об ошибке из ответа API
const parseApiErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as ApiError).message;
  }

  return 'Произошла ошибка. Попробуйте позже.';
};

// Интерфейс для значения контекста сессии
export interface SessionContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRegisteredUsers: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

// Создаём контекст с начальным значением undefined
const SessionContext = createContext<SessionContextValue | undefined>(undefined);

// Провайдер сессии, который оборачивает приложение и предоставляет контекст
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // Состояние для хранения данных текущего пользователя, изначально null (не аутентифицирован)
  const [isLoading, setIsLoading] = useState(true); // Состояние для отслеживания процесса загрузки данных сессии, изначально true (загрузка)
  const [hasRegisteredUsers, setHasRegisteredUsers] = useState(false); // Состояние для отслеживания наличия зарегистрированных пользователей, изначально false

  // Функция для синхронизации состояния сессии при загрузке приложения и при изменении сессии (например, при входе или выходе из системы)
  const syncSession = async () => {
    const token = SessionManager.getToken(); // Получение токена сессии из SessionManager, который может извлекать его из localStorage или другого хранилища

    // Если токена нет, значит пользователь не аутентифицирован, устанавливаем состояние и завершаем загрузку
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Если токен есть, пытаемся получить данные текущего пользователя с сервера, чтобы проверить валидность токена и обновить состояние сессии
    try {
      const currentUser = await getUserRequest();
      setUser(currentUser);
      setHasRegisteredUsers(true);
    } catch {
      SessionManager.removeToken({ notify: false });
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Инициализация сессии при загрузке приложения
  useEffect(() => {
    void syncSession();

    // Подписка на изменения сессии, чтобы автоматически обновлять состояние при входе, выходе или изменении данных пользователя
    const handleSessionChange = (event: Event) => {
      const detail = (event as CustomEvent<{ user?: User | null }>).detail; // Извлечение данных пользователя из события изменения сессии, если они есть

      // Если в событии есть данные пользователя, обновляем состояние сессии, иначе синхронизируем с сервером (например, при удалении токена в другой вкладке)
      if (detail && 'user' in detail) {
        setUser(detail.user ?? null);
        setHasRegisteredUsers(Boolean(detail.user));
        setIsLoading(false);
        return;
      }

      void syncSession(); // Если данных пользователя нет, синхронизируем с сервером, чтобы проверить валидность токена и обновить состояние сессии (например, при удалении токена в другой вкладке)
    };

    window.addEventListener(SessionManager.SESSION_CHANGE_EVENT, handleSessionChange); // Подписка на событие изменения сессии, чтобы реагировать на изменения в других вкладках или при изменении данных пользователя

    return () => {
      window.removeEventListener(SessionManager.SESSION_CHANGE_EVENT, handleSessionChange); // Очистка подписки при размонтировании компонента, чтобы избежать утечек памяти и некорректного обновления состояния после того, как компонент будет удалён
    };
  }, []);

  // Вход в систему — сохраняем токен и профиль
  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const authData = await loginRequest(credentials); // Отправляем запрос на вход в систему с предоставленными учетными данными и получаем данные аутентификации, включая токен и профиль пользователя
      SessionManager.saveToken(authData.access_token, authData.user); // Сохраняем токен и профиль пользователя в SessionManager, который может сохранять их в localStorage или другом хранилище и уведомлять об изменениях сессии
      setUser(authData.user); // Обновляем состояние сессии, устанавливая данные текущего пользователя, что позволяет другим компонентам приложения реагировать на изменение состояния аутентификации
      setHasRegisteredUsers(true); // Устанавливаем флаг наличия зарегистрированных пользователей, что может использоваться для отображения определённых элементов интерфейса или управления доступом к функциям приложения
    } catch (error) {
      throw new Error(parseApiErrorMessage(error)); // Если при входе произошла ошибка, извлекаем сообщение об ошибке из ответа API и выбрасываем его, чтобы компоненты, вызывающие функцию входа, могли отобразить соответствующее сообщение пользователю
    }
  };

  // Регистрация нового пользователя — сохраняем токен и профиль
  const handleRegister = async (credentials: RegisterCredentials) => {
    try {
      const authData = await registerRequest(credentials); // Отправляем запрос на регистрацию нового пользователя с предоставленными учетными данными и получаем данные аутентификации, включая токен и профиль пользователя
      SessionManager.saveToken(authData.access_token, authData.user); // Сохраняем токен и профиль пользователя в SessionManager, который может сохранять их в localStorage или другом хранилище и уведомлять об изменениях сессии
      setUser(authData.user); // Обновляем состояние сессии, устанавливая данные текущего пользователя, что позволяет другим компонентам приложения реагировать на изменение состояния аутентификации
      setHasRegisteredUsers(true); // Устанавливаем флаг наличия зарегистрированных пользователей, что может использоваться для отображения определённых элементов интерфейса или управления доступом к функциям приложения
    } catch (error) {
      throw new Error(parseApiErrorMessage(error)); // Если при регистрации произошла ошибка, извлекаем сообщение об ошибке из ответа API и выбрасываем его, чтобы компоненты, вызывающие функцию регистрации, могли отобразить соответствующее сообщение пользователю
    }
  };

  // Выход из аккаунта — удаляем токен и сбрасываем профиль
  const handleLogout = () => {
    SessionManager.removeToken();
    setUser(null);
  };

  // Значение, предоставляемое через контекст
  const value: SessionContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    hasRegisteredUsers,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    setUser,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>; // Оборачиваем детей в провайдер сессии, предоставляя доступ к состоянию сессии и функциям управления сессией во всех компонентах приложения
}

// Хук для доступа к сессии из компонентов
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext); // Получаем значение контекста сессии, которое может быть undefined, если компонент не обёрнут в SessionProvider
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context; // Возвращаем значение контекста сессии, предоставляя доступ к состоянию сессии и функциям управления сессией для компонентов, которые используют этот хук
}
