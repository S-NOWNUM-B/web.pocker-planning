import { AuthForm } from './AuthForm'; // Импортируем компонент AuthForm для использования в LoginForm

// Компонент LoginForm, который рендерит AuthForm в режиме "login"
export function LoginForm() {
  return <AuthForm mode="login" />;
}
