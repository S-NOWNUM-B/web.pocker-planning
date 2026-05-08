import type { RoomSnapshot } from '@/entities/room/model/types';

interface HandleNextTaskActionParams {
  snapshot: RoomSnapshot;
  isOwner: boolean;
  isBusy: boolean;
  finalizeRound: (payload: { roundId: string; resultValue?: string }) => Promise<unknown>;
  selectTask: (taskId: string) => Promise<unknown>;
}

export async function handleNextTaskAction({
  snapshot,
  isOwner,
  isBusy,
  finalizeRound,
  selectTask,
}: HandleNextTaskActionParams): Promise<void> {
  if (!isOwner || !snapshot.active_round || snapshot.active_round.status !== 'revealed' || isBusy) {
    return;
  }

  const roundId = snapshot.active_round.id;
  const resultValue = snapshot.active_round.suggested_result ?? undefined;

  await finalizeRound({ roundId, resultValue });

  const nextTask = snapshot.tasks
    .filter((task) => task.id !== snapshot.active_round?.task_id && task.estimate_value === null)
    .sort((a, b) => a.position - b.position)[0];

  if (nextTask) {
    await selectTask(nextTask.id);
  }
}

interface HandleAddTaskActionParams {
  title: string;
  roomId?: string;
  isOwner: boolean;
  isBusy: boolean;
  createTask: (taskTitle: string) => Promise<unknown>;
}

export async function handleAddTaskAction({
  title,
  roomId,
  isOwner,
  isBusy,
  createTask,
}: HandleAddTaskActionParams): Promise<boolean> {
  const taskTitle = title.trim();
  if (!taskTitle || !isOwner || !roomId || isBusy) {
    return false;
  }

  await createTask(taskTitle);
  return true;
}

interface HandleSelectTaskActionParams {
  taskId: string;
  snapshot: RoomSnapshot;
  isOwner: boolean;
  isBusy: boolean;
  selectTask: (id: string) => Promise<unknown>;
}

export async function handleSelectTaskAction({
  taskId,
  snapshot,
  isOwner,
  isBusy,
  selectTask,
}: HandleSelectTaskActionParams): Promise<void> {
  if (!isOwner || isBusy || snapshot.active_round?.status === 'voting') {
    return;
  }

  await selectTask(taskId);
}

interface HandleUpdateTaskActionParams {
  taskId: string;
  title: string;
  isOwner: boolean;
  isBusy: boolean;
  updateTask: (payload: { taskId: string; title: string }) => Promise<unknown>;
}

export async function handleUpdateTaskAction({
  taskId,
  title,
  isOwner,
  isBusy,
  updateTask,
}: HandleUpdateTaskActionParams): Promise<boolean> {
  const taskTitle = title.trim();
  if (!taskTitle || !isOwner || isBusy) {
    return false;
  }

  await updateTask({ taskId, title: taskTitle });
  return true;
}

interface HandleDeleteTaskActionParams {
  taskId: string;
  isOwner: boolean;
  isBusy: boolean;
  deleteTask: (taskId: string) => Promise<unknown>;
}

export async function handleDeleteTaskAction({
  taskId,
  isOwner,
  isBusy,
  deleteTask,
}: HandleDeleteTaskActionParams): Promise<boolean> {
  if (!isOwner || isBusy) {
    return false;
  }

  await deleteTask(taskId);
  return true;
}
