import { LoginForm } from '@/features/auth'; // Импортируем компонент LoginForm, который содержит форму для ввода учетных данных и обработки процесса входа в систему

// Компонент LoginPage отображает страницу входа в систему. Он содержит заголовок, описание и форму для ввода учетных данных. Этот компонент используется для предоставления пользователю интерфейса для входа в систему и доступа к функционалу приложения.
export function LoginPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Вход</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Войдите, чтобы продолжить работу в Poker Planning.
      </p>
      <div className="mt-6">
        <LoginForm />
      </div>
    </section>
  );
}
