import { type ReactNode } from 'react'; // Импорт типа ReactNode для определения типа пропса children
import { Card, PageShell } from '@/shared/ui'; // Импорт компонентов Card и PageShell из общего UI набора компонентов, которые будут использоваться для оформления страницы аутентификации

// Интерфейс для пропсов компонента AuthLayout, который принимает children для отображения внутри карточки
interface AuthLayoutProps {
  children: ReactNode;
}

// Компонент AuthLayout, который используется для оформления страниц аутентификации (например, входа и регистрации)
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    // Используем компонент PageShell для создания оболочки страницы с определенными стилями и разметкой
    <PageShell
      maxWidth="md"
      className="min-h-[calc(100vh-8.5rem)]"
      contentClassName="flex min-h-[calc(100vh-8.5rem)] items-center justify-center"
    >
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center">
          <h2 className="text-center text-3xl font-black tracking-tight text-foreground">
            Poker Planning
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Оценивайте задачи вместе с командой
          </p>
        </div>
        <Card className="rounded-2xl border border-border/70 bg-card/92 p-8 shadow-xl backdrop-blur">
          {children}
        </Card>
      </div>
    </PageShell>
  );
}
