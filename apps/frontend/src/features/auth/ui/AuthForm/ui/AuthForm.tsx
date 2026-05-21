import { useMemo } from 'react'; // Импортируем необходимые хуки и компоненты
import { zodResolver } from '@hookform/resolvers/zod'; // Импортируем резолвер для интеграции zod с react-hook-form
import { useForm } from 'react-hook-form'; // Импортируем хук для управления формой
import { Link, useActionData, useNavigation, useSubmit } from 'react-router-dom'; // Импортируем компоненты для навигации и работы с формой
import { Button, Input } from '@/shared/ui'; // Импортируем общие UI компоненты
import { LoginSchema, RegisterSchema } from '../../../model/schemas'; // Импортируем схемы валидации для логина и регистрации
import { PasswordInput } from '../../PasswordInput'; // Импортируем компонент для ввода пароля

// Интерфейс для пропсов компонента AuthForm
interface AuthFormProps {
  mode: 'login' | 'register';
}

// Тип для значений формы, включающий поля для логина и регистрации
type AuthFormValues = {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
};

// Дефолтные значения для форм логина и регистрации
const loginDefaults = {
  email: '',
  password: '',
};

// Дефолтные значения для формы регистрации
const registerDefaults = {
  email: '',
  name: '',
  password: '',
  confirmPassword: '',
};

// Компонент для отображения формы логина и регистрации
export function AuthForm({ mode }: AuthFormProps) {
  const navigation = useNavigation(); // Хук для отслеживания состояния навигации
  const submit = useSubmit(); // Хук для отправки формы
  const actionData = useActionData() as { error?: string } | undefined; // Получаем данные, возвращаемые действием при отправке формы

  const schema = useMemo(() => (mode === 'login' ? LoginSchema : RegisterSchema), [mode]); // Выбираем схему валидации в зависимости от режима (логин или регистрация)

  // Инициализируем форму с помощью useForm, передавая резолвер для валидации и дефолтные значения
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues: mode === 'login' ? loginDefaults : registerDefaults,
    mode: 'onBlur',
    shouldFocusError: false,
  });

  const isRegister = mode === 'register'; // Флаг для определения, находится ли форма в режиме регистрации
  const isSubmitting = navigation.state === 'submitting'; // Флаг для определения, отправляется ли форма в данный момент

  // Функция для обработки отправки формы
  const onSubmit = (data: AuthFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    submit(formData, { method: 'post' });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        autoComplete="off"
        placeholder="you@example.com"
        error={form.formState.errors.email?.message}
        disabled={isSubmitting}
        {...form.register('email')}
      />

      {isRegister && (
        <Input
          label="Имя пользователя"
          type="text"
          autoComplete="off"
          placeholder="Иван Петров"
          error={form.formState.errors.name?.message}
          disabled={isSubmitting}
          {...form.register('name')}
        />
      )}

      <PasswordInput
        label="Пароль"
        autoComplete="off"
        placeholder="••••••••"
        error={form.formState.errors.password?.message}
        disabled={isSubmitting}
        showRequirements={isRegister}
        {...form.register('password')}
      />

      {isRegister && (
        <PasswordInput
          label="Подтверждение пароля"
          autoComplete="off"
          placeholder="••••••••"
          error={form.formState.errors.confirmPassword?.message}
          disabled={isSubmitting}
          showRequirements={false}
          {...form.register('confirmPassword')}
        />
      )}

      {actionData?.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {mode === 'login' ? 'Неверный логин или пароль' : actionData.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Отправка...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isRegister ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
        <Link
          to={isRegister ? '/login' : '/register'}
          className="font-medium text-primary hover:text-primary/80"
        >
          {isRegister ? 'Войти' : 'Зарегистрироваться'}
        </Link>
      </p>
    </form>
  );
}
