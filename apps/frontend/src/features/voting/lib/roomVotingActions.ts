import type { Task } from '@/shared/lib/poker'; // Импортируем тип Task для использования в функциях обработки действий с голосованием в комнате
import type { RoomSnapshot } from '@/entities/room/model/types'; // Импортируем тип RoomSnapshot для использования в функциях обработки действий с голосованием в комнате

// Интерфейс для параметров функции обработки действия "Следующая задача"
interface HandleSelectCardActionParams {
  card: string;
  activeTask: Task | null;
  isBusy: boolean;
  snapshot: RoomSnapshot;
  isOwner: boolean;
  startRound: (taskId: string) => Promise<RoomSnapshot>;
  vote: (payload: { roundId: string; value: string }) => Promise<unknown>;
}

// Эта функция обрабатывает действие выбора карты для голосования. Она проверяет, что есть активная задача и что не происходит другой операции (isBusy), а затем в зависимости от наличия активного раунда и его статуса, либо запускает новый раунд и голосует, либо просто голосует в текущем раунде.
export async function handleSelectCardAction({
  card,
  activeTask,
  isBusy,
  snapshot,
  isOwner,
  startRound,
  vote,
}: HandleSelectCardActionParams): Promise<void> {
  if (!activeTask || isBusy) {
    return;
  }

  const activeRound = snapshot.active_round; // Получаем текущий активный раунд из снимка комнаты для проверки его статуса и принятия решения о том, нужно ли запускать новый раунд или голосовать в существующем.

  if (!activeRound) {
    if (!isOwner) {
      return;
    }

    const startedSnapshot = await startRound(activeTask.id); // Если нет активного раунда, и пользователь является владельцем, запускаем новый раунд для текущей задачи и получаем обновленный снимок комнаты после запуска раунда.
    if (!startedSnapshot.active_round) {
      return;
    }

    await vote({
      roundId: startedSnapshot.active_round.id,
      value: card,
    });
    return;
  }

  if (activeRound.status !== 'voting') {
    return;
  }

  await vote({
    roundId: activeRound.id,
    value: card,
  });
}

// Интерфейс для параметров функции обработки действия "Показать результаты"
interface HandleRevealActionParams {
  snapshot: RoomSnapshot;
  isOwner: boolean;
  isBusy: boolean;
  revealRound: (roundId: string) => Promise<unknown>;
}

// Эта функция обрабатывает действие показа результатов голосования. Она проверяет, что пользователь является владельцем, что есть активный раунд в статусе "голосование" и что не происходит другой операции (isBusy), а затем вызывает функцию для показа результатов раунда.
export async function handleRevealAction({
  snapshot,
  isOwner,
  isBusy,
  revealRound,
}: HandleRevealActionParams): Promise<void> {
  if (!isOwner || !snapshot.active_round || snapshot.active_round.status !== 'voting' || isBusy) {
    return;
  }

  await revealRound(snapshot.active_round.id); // Вызываем функцию для показа результатов раунда, передавая идентификатор текущего активного раунда.
}
