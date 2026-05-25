import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'; // Импортируем Link для навигации между страницами, isRouteErrorResponse для проверки типа ошибки и useRouteError для получения информации об ошибке маршрута
import { Button, Card, EmptyState, PageShell } from '@/shared/ui'; // Импортируем UI-компоненты для отображения страницы, карточки и состояния пустоты
import { useSession } from '@/app/providers'; // Импортируем хук для получения информации о текущей сессии пользователя

// Функция getErrorContent принимает объект ошибки и возвращает заголовок и описание для отображения на странице в зависимости от типа ошибки. Если ошибка является ответом маршрута, функция проверяет статус ошибки и возвращает соответствующий заголовок и описание. Если ошибка не является ответом маршрута, возвращается стандартное сообщение для 404 ошибки.
function getErrorContent(error: unknown) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        title: '404 — страница не найдена',
        description: 'Похоже, ссылка устарела или маршрут был удалён.',
      };
    }

    if (error.status === 405) {
      return {
        title: '405 — метод не разрешён',
        description: 'Попробуйте открыть страницу через навигацию внутри приложения.',
      };
    }

    return {
      title: `${error.status} — ${error.statusText}`,
      description: error.data?.message || 'Попробуйте вернуться назад и открыть страницу заново.',
    };
  }

  return {
    title: '404 — страница не найдена',
    description: 'Похоже, ссылка устарела или маршрут был удалён.',
  };
}

// Компонент NotFoundPage отображает страницу 404 ошибки. Он содержит заголовок, описание и кнопку для возврата на главную страницу. Этот компонент используется для предоставления пользователю интерфейса при попытке доступа к несуществующему маршруту.
export function NotFoundPage() {
  const error = useRouteError();
  const { isAuthenticated } = useSession();
  const homePath = isAuthenticated ? '/dashboard' : '/';
  const { title, description } = getErrorContent(error);

  return (
    <PageShell
      maxWidth="md"
      className="min-h-[calc(100vh-8.5rem)]"
      contentClassName="flex min-h-[calc(100vh-8.5rem)] items-center justify-center"
    >
      <Card className="w-full border border-border/70 bg-card/92 p-8 shadow-2xl backdrop-blur">
        <EmptyState title={title} description={description} />
        <div className="flex justify-center">
          <Button as={Link} to={homePath} variant="primary">
            Вернуться на главную
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
