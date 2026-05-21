import { z } from 'zod'; // Импортируем библиотеку zod для создания схем валидации

// Схема для валидации данных пользователя
export const UserShema = z.object({
  id: z.string(),
  email: z.string().email('Некорректный email'),
  name: z
    .string()
    .min(2, 'Имя должно быть не менее 2 символов')
    .max(120, 'Имя должно быть не более 120 символов'),
  avatar_color: z.string(),
  created_at: z.string(),
});

// Схема для валидации данных при логине
export const LoginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
});

// Схема для валидации данных при регистрации
export const RegisterSchema = z
  .object({
    email: z.string().email('Некорректный email'),
    name: z
      .string()
      .min(2, 'Имя должно быть не менее 2 символов')
      .max(120, 'Имя должно быть не более 120 символов'),
    password: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
    confirmPassword: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

// Алиасы в camelCase для обратной совместимости с текущими импортами.
export const loginSchema = LoginSchema;
export const registerSchema = RegisterSchema;

// Схемы для валидации ответов от сервера при логине и регистрации
export const LoginResponseSchema = z.object({
  user: UserShema,
  access_token: z.string(),
  token_type: z.literal('bearer'),
});

export const RegisterResponseSchema = z.object({
  user: UserShema,
  access_token: z.string(),
  token_type: z.literal('bearer'),
});

export type User = z.infer<typeof UserShema>; // Тип для данных пользователя, выводимый из схемы UserShema
export type LoginCredentials = z.infer<typeof LoginSchema>; // Тип для данных при логине, выводимый из схемы LoginSchema
export type RegisterCredentials = z.infer<typeof RegisterSchema>; // Тип для данных при регистрации, выводимый из схемы RegisterSchema
export type LoginResponse = z.infer<typeof LoginResponseSchema>; // Тип для ответа при логине, выводимый из схемы LoginResponseSchema
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>; // Тип для ответа при регистрации, выводимый из схемы RegisterResponseSchema
