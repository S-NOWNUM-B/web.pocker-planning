import { AuthForm } from './AuthForm'; // Импортируем компонент AuthForm для использования в RegisterForm

// Компонент RegisterForm, который рендерит AuthForm в режиме "register"
export function RegisterForm() {
  return <AuthForm mode="register" />;
}
