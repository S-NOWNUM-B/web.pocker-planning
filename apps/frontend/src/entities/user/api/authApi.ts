import { api } from '@/shared/api'; // Импорт базового API для выполнения HTTP-запросов
import type {
  IGuestLoginCredentials,
  IGuestLoginResponse,
  ILoginCredentails,
  ILoginResponse,
  IRegisterCredentials,
  IRegisterResponse,
  IUser,
} from '../model/types'; // Импорт типов для данных, связанных с аутентификацией и пользователем

// API для работы с аутентификацией и пользователями
export const userAPI = {
  // Логин пользователя
  login: async (credentials: ILoginCredentails) => {
    const { data } = await api.post<ILoginResponse>('/auth/login', credentials);
    return data;
  },

  // Регистрация пользователя
  register: async (credentials: IRegisterCredentials) => {
    const { data } = await api.post<IRegisterResponse>('/auth/register', credentials);
    return data;
  },

  // Получение информации о текущем пользователе
  getMe: async () => {
    const { data } = await api.get<IUser>('/auth/me');
    return data;
  },

  // Гостевой вход для работы с комнатами без аккаунта
  loginAsGuest: async (payload: IGuestLoginCredentials = {}) => {
    const { data } = await api.post<IGuestLoginResponse>('/auth/guest', payload);
    return data;
  },
};

export const login = userAPI.login; // Экспорт функции для логина пользователя
export const register = userAPI.register; // Экспорт функции для регистрации пользователя
export const getUser = userAPI.getMe; // Экспорт функции для получения информации о текущем пользователе
export const loginAsGuest = userAPI.loginAsGuest; // Экспорт функции для гостевого входа в систему
