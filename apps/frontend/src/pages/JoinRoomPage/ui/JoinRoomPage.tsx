import { Link } from 'react-router-dom'; // Импортируем Link для навигации между страницами
import { JoinRoomForm } from '@/features'; // Импортируем компонент JoinRoomForm, который содержит форму для ввода кода комнаты и обработки процесса присоединения
import { Card, PageShell, Button } from '@/shared/ui'; // Импортируем UI-компоненты для отображения страницы и карточки с формой

// Компонент JoinRoomPage отображает страницу с формой для присоединения к комнате по коду. Он содержит заголовок, описание и форму для ввода кода комнаты. Также предоставляется ссылка для создания новой комнаты, если у пользователя нет кода.
export function JoinRoomPage() {
  return (
    <PageShell
      maxWidth="lg"
      className="min-h-[calc(100vh-8.5rem)]"
      contentClassName="flex min-h-[calc(100vh-8.5rem)] flex-col justify-center"
    >
      <Card className="mx-auto w-full max-w-xl border border-border/70 bg-card/92 p-6 shadow-2xl backdrop-blur sm:p-8">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Присоединиться к комнате
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Введите 4-буквенный код комнаты, который вам отправил создатель.
        </p>

        <div className="mt-6">
          <JoinRoomForm />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
          <span className="text-xs text-muted-foreground">Нет кода комнаты?</span>
          <Button as={Link} to="/create-room" variant="outline" size="sm">
            Создать свою
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
