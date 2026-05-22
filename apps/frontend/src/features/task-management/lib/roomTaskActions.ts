import type { RoomSnapshot } from '@/entities/room/model/types'; // Импортируем тип RoomSnapshot для использования в функциях обработки действий с задачами

const MAX_TITLE_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 500;

// Интерфейс для параметров функции обработки действия "Следующая задача"
interface HandleNextTaskActionParams {
  snapshot: RoomSnapshot;
  isOwner: boolean;
  isBusy: boolean;
  finalizeRound: (payload: { roundId: string; resultValue?: string }) => Promise<unknown>;
  selectTask: (taskId: string) => Promise<unknown>;
}

// Эта функция проверяет, может ли владелец комнаты перейти к следующей задаче, и если да, то завершает текущий раунд и выбирает следующую задачу из списка задач, которая еще не была оценена.
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

  const roundId = snapshot.active_round.id; // Получаем ID текущего раунда из снимка комнаты
  const resultValue = snapshot.active_round.suggested_result ?? undefined; // Получаем предлагаемое значение оценки из текущего раунда, если оно есть, иначе undefined

  await finalizeRound({ roundId, resultValue }); // Завершаем текущий раунд, передавая ID раунда и предлагаемое значение оценки (если есть)

  // Находим следующую задачу, которая не является текущей активной задачей и еще не была оценена (estimate_value === null), сортируя задачи по их позиции в списке.
  const nextTask = snapshot.tasks
    .filter((task) => task.id !== snapshot.active_round?.task_id && task.estimate_value === null)
    .sort((a, b) => a.position - b.position)[0];

  if (nextTask) {
    await selectTask(nextTask.id);
  }
}

// Интерфейс для параметров функции обработки действия "Добавить задачу"
interface HandleAddTaskActionParams {
  title: string;
  description: string;
  roomId?: string;
  isOwner: boolean;
  isBusy: boolean;
  createTask: (payload: { title: string; description: string }) => Promise<unknown>;
}

// Эта функция проверяет, может ли владелец комнаты добавить новую задачу, и если да, то создает новую задачу с указанным заголовком и описанием.
export async function handleAddTaskAction({
  title,
  description,
  roomId,
  isOwner,
  isBusy,
  createTask,
}: HandleAddTaskActionParams): Promise<boolean> {
  const taskTitle = title.trim();
  const taskDescription = description.trim();
  if (
    !taskTitle ||
    taskTitle.length > MAX_TITLE_LENGTH ||
    taskDescription.length > MAX_DESCRIPTION_LENGTH ||
    !isOwner ||
    !roomId ||
    isBusy
  ) {
    return false;
  }

  await createTask({ title: taskTitle, description: taskDescription });
  return true;
}

// Интерфейс для параметров функции обработки действия "Выбрать задачу"
interface HandleSelectTaskActionParams {
  taskId: string;
  snapshot: RoomSnapshot;
  isOwner: boolean;
  isBusy: boolean;
  selectTask: (id: string) => Promise<unknown>;
}

// Эта функция проверяет, может ли владелец комнаты выбрать задачу, и если да, то выбирает указанную задачу для оценки.
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

// Интерфейс для параметров функции обработки действия "Обновить задачу"
interface HandleUpdateTaskActionParams {
  taskId: string;
  title: string;
  description: string;
  isOwner: boolean;
  isBusy: boolean;
  updateTask: (payload: { taskId: string; title: string; description: string }) => Promise<unknown>;
}

// Эта функция проверяет, может ли владелец комнаты обновить задачу, и если да, то обновляет заголовок и описание указанной задачи.
export async function handleUpdateTaskAction({
  taskId,
  title,
  description,
  isOwner,
  isBusy,
  updateTask,
}: HandleUpdateTaskActionParams): Promise<boolean> {
  const taskTitle = title.trim();
  const taskDescription = description.trim();
  if (
    !taskTitle ||
    taskTitle.length > MAX_TITLE_LENGTH ||
    taskDescription.length > MAX_DESCRIPTION_LENGTH ||
    !isOwner ||
    isBusy
  ) {
    return false;
  }

  await updateTask({ taskId, title: taskTitle, description: taskDescription });
  return true;
}

// Интерфейс для параметров функции обработки действия "Удалить задачу"
interface HandleDeleteTaskActionParams {
  taskId: string;
  isOwner: boolean;
  isBusy: boolean;
  deleteTask: (taskId: string) => Promise<unknown>;
}

// Эта функция проверяет, может ли владелец комнаты удалить задачу, и если да, то удаляет указанную задачу.
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
