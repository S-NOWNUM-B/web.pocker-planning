import { RegisterForm } from '@/features/auth'; // Импортируем компонент RegisterForm, который содержит форму для ввода учетных данных и обработки процесса регистрации нового пользователя

// Компонент RegisterPage отображает страницу регистрации нового пользователя. Он содержит заголовок, описание и форму для ввода учетных данных. Этот компонент используется для предоставления пользователю интерфейса для создания нового аккаунта и доступа к функционалу приложения.
export function RegisterPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Регистрация</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Создайте аккаунт, чтобы сохранять сессии оценки и возвращаться к ним позже.
      </p>
      <div className="mt-6">
        <RegisterForm />
      </div>
    </section>
  );
}
