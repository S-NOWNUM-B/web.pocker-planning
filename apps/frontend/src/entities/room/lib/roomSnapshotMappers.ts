import type { Task, Player } from '@/shared/lib/poker';
import type { RoomSnapshot } from '../model/types';
import { toAverageLabel } from '@/shared/lib/room';

export function mapSnapshotTasks(snapshot: RoomSnapshot): Task[] {
  return [...snapshot.tasks]
    .sort((a, b) => a.position - b.position)
    .map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      estimate: task.estimate_value,
    }));
}

export function mapSnapshotPlayers(snapshot: RoomSnapshot): Player[] {
  const voteValueByParticipantId = new Map(
    (snapshot.active_round?.votes ?? []).map((vote) => [vote.participant_id, vote]),
  );

  return snapshot.participants.map((participant) => {
    const roundVote = voteValueByParticipantId.get(participant.id);
    const vote =
      snapshot.active_round?.status === 'revealed'
        ? (roundVote?.value ?? null)
        : participant.has_voted
          ? '✓'
          : null;

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

export function resolveRoomOwnerName(snapshot: RoomSnapshot): string {
  return (
    snapshot.participants.find((participant) => participant.role === 'owner')?.name ||
    'Владелец комнаты'
  );
}

export function getRoomVotingView(snapshot: RoomSnapshot, tasks: Task[]) {
  const activeTaskId = snapshot.active_round?.task_id ?? snapshot.room.current_task_id;
  const activeTask = activeTaskId ? (tasks.find((task) => task.id === activeTaskId) ?? null) : null;
  const isRevealed = snapshot.active_round?.status === 'revealed';
  const allPlayersVoted =
    snapshot.active_round !== null
      ? snapshot.active_round.votes_submitted >= snapshot.active_round.total_participants
      : false;
  const anyPlayerVoted =
    snapshot.active_round !== null ? snapshot.active_round.votes_submitted > 0 : false;
  const selectedCard = snapshot.active_round?.self_vote_value ?? null;
  const average = toAverageLabel(snapshot.active_round?.average_score);

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
