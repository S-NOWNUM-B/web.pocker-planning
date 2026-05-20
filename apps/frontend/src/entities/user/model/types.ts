// Типы данных, связанных с пользователем и аутентификацией
export interface IUser {
  id: string;
  email: string;
  name: string;
  avatar_color: string;
  created_at: string;
}

// Типы для данных, связанных с аутентификацией и пользователем
export interface ILoginCredentails {
  email: string;
  password: string;
}

// Типы для данных, связанных с регистрацией и гостевым входом
export interface IRegisterCredentials {
  email: string;
  name: string;
  password: string;
}

// Типы для данных, получаемых при логине, регистрации и гостевом входе
export interface IGuestLoginCredentials {
  name?: string;
}

// Типы для ответов от API при логине, регистрации и гостевом входе
export interface ILoginResponse {
  user: IUser;
  access_token: string;
  token_type: 'bearer';
}

// Типы для ответов от API при регистрации
export interface IRegisterResponse {
  user: IUser;
  access_token: string;
  token_type: 'bearer';
}

// Типы для ответов от API при гостевом входе
export interface IGuestLoginResponse {
  user: IUser;
  access_token: string;
  token_type: 'bearer';
}

// Тип для хранения токенов аутентификации
export interface AuthTokens {
  access_token: string;
  token_type: 'bearer';
}

export type User = IUser; // Экспорт типа User для использования в других частях приложения
export type LoginCredentials = ILoginCredentails; // Экспорт типа для данных логина пользователя
export type RegisterCredentials = IRegisterCredentials; // Экспорт типа для данных регистрации пользователя
export type GuestLoginCredentials = IGuestLoginCredentials; // Экспорт типа для данных гостевого входа в систему
export type LoginResponse = ILoginResponse; // Экспорт типа для данных, получаемых при логине пользователя
export type RegisterResponse = IRegisterResponse; // Экспорт типа для данных, получаемых при регистрации пользователя
export type GuestLoginResponse = IGuestLoginResponse; // Экспорт типа для данных, получаемых при гостевом входе в систему
