import type { Task, Player } from '@/shared/lib/poker'; // Импорт типов Task и Player из общего модуля
import type { RoomSnapshot } from '../model/types'; // Импорт типа RoomSnapshot из модели комнаты
import { toAverageLabel } from '@/shared/lib/room'; // Импорт функции для преобразования среднего значения в метку

// Функция для преобразования данных из снимка комнаты в массив задач
export function mapSnapshotTasks(snapshot: RoomSnapshot): Task[] {
  return [...snapshot.tasks]
    .sort((a, b) => a.position - b.position)
    .map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      estimate: task.estimate_value,
    })); // Преобразуем задачи из снимка комнаты в формат Task, сортируя их по позиции
}

// Функция для преобразования данных из снимка комнаты в массив игроков
export function mapSnapshotPlayers(snapshot: RoomSnapshot): Player[] {
  const voteValueByParticipantId = new Map(
    (snapshot.active_round?.votes ?? []).map((vote) => [vote.participant_id, vote]),
  );

  // Создаем карту для быстрого доступа к голосам участников по их ID, используя данные из активного раунда
  return snapshot.participants.map((participant) => {
    const roundVote = voteValueByParticipantId.get(participant.id);
    const vote =
      snapshot.active_round?.status === 'revealed'
        ? (roundVote?.value ?? null)
        : participant.has_voted
          ? '✓'
          : null; // Определяем отображаемое значение голоса участника: если раунд раскрыт, показываем реальное значение, иначе показываем галочку, если участник проголосовал

    return {
      id: participant.id,
      name: participant.name,
      role: participant.role === 'owner' ? 'Создатель' : 'Участник',
      vote,
      isThinking: false,
      isBot: false,
    };
  });
}

// Функция для получения имени владельца комнаты из снимка комнаты
export function resolveRoomOwnerName(snapshot: RoomSnapshot): string {
  return (
    snapshot.participants.find((participant) => participant.role === 'owner')?.name ||
    'Владелец комнаты'
  );
}

// Функция для получения данных, необходимых для отображения вида голосования в комнате
export function getRoomVotingView(snapshot: RoomSnapshot, tasks: Task[]) {
  const activeTaskId = snapshot.active_round?.task_id ?? snapshot.room.current_task_id; // Определяем ID активной задачи, используя данные из активного раунда или текущей задачи комнаты
  const activeTask = activeTaskId ? (tasks.find((task) => task.id === activeTaskId) ?? null) : null; // Находим активную задачу в массиве задач по ее ID, если она существует
  const isRevealed = snapshot.active_round?.status === 'revealed'; // Определяем, раскрыт ли раунд, проверяя его статус
  const allPlayersVoted =
    snapshot.active_round !== null
      ? snapshot.active_round.votes_submitted >= snapshot.active_round.total_participants
      : false; // Определяем, проголосовали ли все игроки, сравнивая количество поданных голосов с общим количеством участников в активном раунде
  const anyPlayerVoted =
    snapshot.active_round !== null ? snapshot.active_round.votes_submitted > 0 : false; // Определяем, проголосовал ли хотя бы один игрок, проверяя, больше ли количество поданных голосов нуля в активном раунде
  const selectedCard = snapshot.active_round?.self_vote_value ?? null; // Получаем значение голоса текущего участника из активного раунда, если оно существует, иначе возвращаем null
  const average = toAverageLabel(snapshot.active_round?.average_score); // Преобразуем среднее значение голосов в метку для отображения, используя функцию toAverageLabel

  return {
    activeTaskId,
    activeTask,
    isRevealed,
    allPlayersVoted,
    anyPlayerVoted,
    selectedCard,
    average,
  };
}
