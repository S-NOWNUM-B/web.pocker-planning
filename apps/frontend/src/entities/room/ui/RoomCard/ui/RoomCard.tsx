import { Link } from 'react-router-dom'; // Импорт компонента Link для навигации
import { useState } from 'react'; // Импорт хука useState для управления состоянием модального окна
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; // Импорт хуков для работы с асинхронными запросами и кэшированием данных
import { useSession } from '@/app/providers'; // Импорт хука для получения информации о текущей сессии пользователя
import { Card, Button, Modal, Spinner } from '@/shared/ui'; // Импорт UI-компонентов для отображения карточки комнаты, кнопок, модального окна и спиннера
import { UsersIcon } from '@/shared/ui/icons'; // Импорт иконки для отображения количества участников
import { roomApi } from '../../../api/roomApi'; // Импорт API для работы с комнатами
import type { RoomListItem } from '../../../model/types'; // Импорт типа для элемента списка комнат

// Компонент для отображения карточки комнаты в списке комнат
interface RoomCardProps {
  room: RoomListItem;
}

// Компонент RoomCard отображает информацию о комнате, позволяет войти в комнату, посмотреть результаты голосований и удалить комнату (для владельца)
export function RoomCard({ room }: RoomCardProps) {
  const queryClient = useQueryClient(); // Получение клиента для управления кэшем данных
  const { user } = useSession(); // Получение информации о текущем пользователе из сессии
  const [isResultsOpen, setIsResultsOpen] = useState(false); // Состояние для управления открытием модального окна с результатами голосований

  const deleteRoomMutation = useMutation({
    mutationFn: () => roomApi.deleteRoom(room.id), // Функция для удаления комнаты по её ID
    onSuccess: () => {
      setIsResultsOpen(false); // Закрытие модального окна с результатами при успешном удалении комнаты
      queryClient.invalidateQueries({ queryKey: ['rooms'] }); // Инвалидация кэша списка комнат для обновления данных после удаления
    }, // Обработка ошибок при удалении комнаты (можно добавить уведомление пользователю)
  });

  // Запрос для получения истории голосований в комнате при открытии модального окна с результатами
  const {
    data: roomSnapshot,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = useQuery({
    queryKey: ['room-history', room.id],
    queryFn: () => roomApi.getRoomSnapshot(room.id),
    enabled: isResultsOpen,
    staleTime: 30_000,
  });

  // Форматирование даты создания комнаты для отображения в карточке
  const formattedDate = new Date(room.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Получение идентификатора комнаты для отображения и использования в заголовке модального окна
  const roomIdentifier = room.slug;
  const historyItems = roomSnapshot?.history ?? [];
  const isOwner = user?.id === room.owner_id;

  return (

    // Карточка комнаты с информацией о ней и действиями для входа, просмотра результатов и удаления (для владельца)
    <Card className="flex flex-col border border-border/70 bg-card/90 p-5 shadow-lg transition-all hover:border-primary/50 hover:shadow-xl">
      <div className="flex flex-1 flex-col space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-lg font-bold text-foreground" title={roomIdentifier}>
            {roomIdentifier}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
            <UsersIcon className="h-4 w-4" />
            <span>{room.participants_count}</span>
          </div>
        </div>

        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{room.name}</p>

        {room.active_task_title && (
          <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
            <span className="font-semibold">Последняя задача:</span> {room.active_task_title}
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-border/50 pt-4">
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
        <div className="mt-3 flex items-center gap-2">
          <Button as={Link} to={`/room/${room.slug}`} size="sm" className="flex-1">
            Войти
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => setIsResultsOpen(true)}
          >
            Результаты
          </Button>
        </div>
        {isOwner && (
          <Button
            type="button"
            size="sm"
            variant="danger"
            className="mt-2 w-full"
            onClick={() => deleteRoomMutation.mutate()}
            disabled={deleteRoomMutation.isPending}
          >
            {deleteRoomMutation.isPending ? 'Удаляем...' : 'Удалить комнату'}
          </Button>
        )}
      </div>

      <Modal
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        title={`Результаты комнаты ${roomIdentifier}`}
        className="max-w-3xl"
      >
        {isHistoryLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : isHistoryError ? (
          <p className="text-sm text-destructive">Не удалось загрузить результаты голосований.</p>
        ) : historyItems.length > 0 ? (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {historyItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-border/60 bg-secondary/30 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-foreground">{item.task_title}</h4>
                  <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                    Итог: {item.result_value} SP
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>Голосов: {item.votes_count}</span>
                  <span>{new Date(item.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            В этой комнате пока нет завершённых раундов голосования.
          </p>
        )}
      </Modal>
    </Card>
  );
}
