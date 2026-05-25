import { useEffect, useState } from 'react'; // Импортируем хуки useEffect и useState для управления состоянием и побочными эффектами в компоненте
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Импортируем хуки useQuery, useMutation и useQueryClient для получения данных, выполнения мутаций и управления кэшированием данных
import { Navigate } from 'react-router-dom'; // Импортируем компонент Navigate для перенаправления пользователей, если они не авторизованы
import { useSession } from '@/app/providers'; // Импортируем хук useSession для получения информации о текущей сессии пользователя
import { roomApi } from '@/entities/room'; // Импортируем API для взаимодействия с сервером, связанное с комнатой
import {
  getRoomVotingView,
  mapSnapshotPlayers,
  mapSnapshotTasks,
  resolveRoomOwnerName,
} from '@/entities/room/lib/roomSnapshotMappers'; // Импортируем функции для обработки данных комнаты и получения представления для голосования, а также для отображения игроков и задач
import {
  handleRevealAction,
  handleSelectCardAction,
} from '@/features/voting/lib/roomVotingActions'; // Импортируем функции для обработки действий, связанных с голосованием, таких как раскрытие карт и выбор карты
import {
  handleAddTaskAction,
  handleNextTaskAction,
  handleSelectTaskAction,
  handleUpdateTaskAction,
  handleDeleteTaskAction,
} from '@/features/task-management/lib/roomTaskActions'; // Импортируем функции для обработки действий, связанных с управлением задачами, таких как добавление, обновление, удаление и выбор задач
import { TaskModal } from '@/features/task-management/ui/TaskModal'; // Импортируем компонент TaskModal для отображения модального окна управления задачами
import { NotFoundPage } from '@/pages/NotFoundPage'; // Импортируем компонент NotFoundPage для отображения страницы 404, если комната не найдена
import { Spinner } from '@/shared/ui'; // Импортируем компонент Spinner для отображения индикатора загрузки
import { TrophyIcon } from '@/shared/ui/icons'; // Импортируем иконку TrophyIcon для отображения рядом с именем владельца комнаты
import {
  getLocalSession,
  loadRoomSnapshotWithToken,
  roomRefLooksLikeCode,
} from '@/shared/lib/room'; // Импортируем функции для работы с локальной сессией, загрузки данных комнаты с токеном доступа и проверки формата ссылки на комнату
import type { Task } from '@/shared/lib/poker'; // Импортируем тип Task для типизации данных задач, получаемых из API
import { persistRoomSession } from '@/shared/lib/session/persistRoomSession'; // Импортируем функцию persistRoomSession для сохранения данных сессии комнаты в локальном хранилище
import { SessionManager } from '@/shared/lib/session'; // Импортируем SessionManager для управления сессией пользователя, включая получение токена доступа
import { ParticipantsList, RoomFooter, RoomHeader, RoomResults, TaskSidebar } from '@/widgets'; // Импортируем компоненты ParticipantsList, RoomFooter, RoomHeader, RoomResults и TaskSidebar для отображения различных частей интерфейса комнаты
import { useRoomParams } from '../lib/useRoomParams'; // Импортируем хук useRoomParams для получения параметров из URL, таких как идентификатор комнаты
import { useRoomWebSocket } from '../lib/useRoomWebSocket'; // Импортируем хук useRoomWebSocket для подключения к WebSocket и получения обновлений в реальном времени для комнаты

export function RoomPage() {
  const { roomId: roomRef } = useRoomParams(); // Получаем идентификатор комнаты из URL с помощью хука useRoomParams
  const { user, isLoading: sessionLoading } = useSession(); // Получаем информацию о текущем пользователе и статус загрузки сессии с помощью хука useSession
  const queryClient = useQueryClient(); // Получаем экземпляр queryClient для управления кэшированием данных и обновлением данных после мутаций
  const [pendingCard, setPendingCard] = useState<string | null>(null); // Состояние для хранения выбранной карты перед подтверждением голоса
  const [resolvedRoomRef, setResolvedRoomRef] = useState(roomRef); // Состояние для хранения разрешенной ссылки на комнату, которая может отличаться от исходной ссылки, если она была в виде кода
  const [taskModalMode, setTaskModalMode] = useState<'create' | 'view' | 'edit' | null>(null); // Состояние для управления режимом отображения модального окна задач (создание, просмотр, редактирование или закрыто)
  const [taskModalTask, setTaskModalTask] = useState<Task | null>(null); // Состояние для хранения текущей задачи, отображаемой в модальном окне задач
  const localSession = getLocalSession(); // Получаем данные локальной сессии, которые могут содержать информацию о гостевом пользователе и токене доступа к комнате, если пользователь не авторизован
  const roomAccessToken = user ? undefined : localSession?.roomAccessToken; // Получаем токен доступа к комнате из локальной сессии, если пользователь не авторизован (гость)

  // Если ссылка на комнату выглядит как код, мы будем ждать загрузки данных комнаты, чтобы разрешить ее в настоящий идентификатор комнаты. Это позволяет поддерживать короткие ссылки на комнаты.
  useEffect(() => {
    setResolvedRoomRef(roomRef);
  }, [roomRef]);

  // Загружаем данные комнаты с помощью useQuery, используя разрешенную ссылку на комнату, идентификатор пользователя (или 'guest' для неавторизованных пользователей) и токен доступа к комнате (если есть) в качестве ключа запроса. Запрос выполняется только если пользователь авторизован или есть токен доступа к комнате.
  const roomQuery = useQuery({
    queryKey: ['room', resolvedRoomRef, user?.id ?? 'guest', roomAccessToken ?? 'no-token'],
    enabled: Boolean(user || roomAccessToken),
    queryFn: () => loadRoomSnapshotWithToken(resolvedRoomRef, roomAccessToken),
  });

  const snapshot = roomQuery.data; // Получаем данные комнаты из результата запроса
  const roomId = snapshot?.room.id; // Получаем идентификатор комнаты из данных комнаты, если они загружены

  // Подключаемся к WebSocket для получения обновлений в реальном времени для комнаты, используя идентификатор комнаты и токен доступа (если есть). Подключение выполняется только если пользователь авторизован или есть токен доступа к комнате, и если идентификатор комнаты определен.
  const authToken = user ? SessionManager.getToken() : roomAccessToken;
  useRoomWebSocket({
    roomId: roomId || resolvedRoomRef, 
    token: authToken || undefined,
    enabled: Boolean(user || roomAccessToken) && roomId !== undefined,
  });

  // Функция для обновления данных комнаты после выполнения мутаций, таких как создание, обновление или удаление задач, а также действий, связанных с голосованием. Она инвалидирует соответствующие запросы в кэше, чтобы данные были перезагружены при следующем запросе.
  const refreshRoomData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['room', resolvedRoomRef, user?.id ?? 'guest', roomAccessToken ?? 'no-token'],
      }),
      queryClient.invalidateQueries({ queryKey: ['rooms'] }),
      queryClient.invalidateQueries({ queryKey: ['room-history', roomId] }),
    ]);
  };

  // Мутация для создания новой задачи в комнате. При успешном выполнении мутации вызывается функция refreshRoomData для обновления данных комнаты.
  const createTaskMutation = useMutation({
    mutationFn: (payload: { title: string; description: string }) =>
      roomApi.createTask(roomId as string, payload, roomAccessToken),
    onSuccess: refreshRoomData,
  });

  // Мутация для обновления существующей задачи в комнате. При успешном выполнении мутации вызывается функция refreshRoomData для обновления данных комнаты.
  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      title,
      description,
    }: {
      taskId: string;
      title: string;
      description: string;
    }) => roomApi.updateTask(roomId as string, taskId, { title, description }, roomAccessToken),
    onSuccess: refreshRoomData,
  });

  // Мутация для удаления задачи из комнаты. При успешном выполнении мутации вызывается функция refreshRoomData для обновления данных комнаты.
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => roomApi.deleteTask(roomId as string, taskId, roomAccessToken),
    onSuccess: refreshRoomData,
  });

  // Мутация для выбора активной задачи в комнате. При успешном выполнении мутации вызывается функция refreshRoomData для обновления данных комнаты.
  const selectTaskMutation = useMutation({
    mutationFn: (taskId: string) => roomApi.selectTask(roomId as string, taskId, roomAccessToken),
    onSuccess: refreshRoomData,
  });

  // Мутация для начала раунда голосования по выбранной задаче. При успешном выполнении мутации вызывается функция refreshRoomData для обновления данных комнаты.
  const startRoundMutation = useMutation({
    mutationFn: (taskId: string) => roomApi.startRound(roomId as string, taskId, roomAccessToken),
    onSuccess: refreshRoomData,
  });

  // Мутация для отправки голоса игрока. При успешном выполнении мутации вызывается функция refreshRoomData для обновления данных комнаты.
  const voteMutation = useMutation({
    mutationFn: ({ roundId, value }: { roundId: string; value: string }) =>
      roomApi.submitVote(roomId as string, roundId, value, roomAccessToken),
    onSuccess: refreshRoomData,
  });

  // Мутация для раскрытия карт всех игроков в раунде. При успешном выполнении мутации вызывается функция refreshRoomData для обновления данных комнаты.
  const revealMutation = useMutation({
    mutationFn: (roundId: string) =>
      roomApi.revealRound(roomId as string, roundId, roomAccessToken),
    onSuccess: refreshRoomData,
  });

  // Мутация для финализации раунда с указанием результата. При успешном выполнении мутации вызывается функция refreshRoomData для обновления данных комнаты.
  const finalizeMutation = useMutation({
    mutationFn: ({ roundId, resultValue }: { roundId: string; resultValue?: string }) =>
      roomApi.finalizeRound(roomId as string, roundId, resultValue, roomAccessToken),
    onSuccess: refreshRoomData,
  });

  // Эффект для сохранения данных сессии комнаты в локальном хранилище при загрузке данных комнаты. Если ссылка на комнату выглядит как код, она разрешается в настоящий идентификатор комнаты после загрузки данных, и данные сессии сохраняются с использованием разрешенного идентификатора комнаты.
  useEffect(() => {
    if (!snapshot) {
      return;
    }

    if (roomRefLooksLikeCode(resolvedRoomRef) && snapshot.room.id !== resolvedRoomRef) {
      setResolvedRoomRef(snapshot.room.id);
    }

    persistRoomSession({
      snapshot,
      authUserName: user?.name,
      localUserName: localSession?.userName,
      roomAccessToken,
    });
  }, [localSession?.userName, resolvedRoomRef, roomAccessToken, snapshot, user?.name]);

  if (!user && !roomAccessToken && !sessionLoading) {
    return <Navigate to="/login" replace />;
  }

  if (roomQuery.isLoading || sessionLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8.5rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (roomQuery.isError || !snapshot) {
    return <NotFoundPage />;
  }

  // Находим участника, соответствующего текущему пользователю. Сначала пытаемся найти участника по self_participant_id, если он есть. Если нет, пытаемся найти участника по user_id, совпадающему с id текущего пользователя. Если и это не сработало, и если в локальной сессии есть selfParticipantId, пытаемся найти участника по этому идентификатору. Если ничего не найдено, selfParticipant будет null.
  const selfParticipant = snapshot.self_participant_id
    ? snapshot.participants.find((participant) => participant.id === snapshot.self_participant_id)
    : snapshot.participants.find((participant) => participant.user_id === user?.id) ||
      (localSession?.selfParticipantId
        ? snapshot.participants.find(
            (participant) => participant.id === localSession.selfParticipantId,
          )
        : null);
  const isOwner =
    selfParticipant?.role === 'owner' ||
    (Boolean(user?.id) && snapshot.room.owner_id === user?.id); // Определяем, является ли текущий участник владельцем комнаты. Участник считается владельцем, если его роль 'owner' или если его user_id совпадает с owner_id комнаты (для авторизованных пользователей).
  const currentUserName = user?.name || selfParticipant?.name || localSession?.userName || 'Гость'; // Получаем имя текущего пользователя для отображения. Сначала пытаемся использовать имя из объекта user, если он есть. Если нет, используем имя из selfParticipant, если он найден. Если и это не сработало, используем имя из локальной сессии. Если ничего не найдено, отображаем 'Гость'.
  const tasks = mapSnapshotTasks(snapshot); // Преобразуем задачи из данных комнаты в формат, удобный для отображения в интерфейсе, с помощью функции mapSnapshotTasks
  const players = mapSnapshotPlayers(snapshot); // Преобразуем участников из данных комнаты в формат, удобный для отображения в интерфейсе, с помощью функции mapSnapshotPlayers
  const { activeTaskId, activeTask, isRevealed, allPlayersVoted, anyPlayerVoted } =
    getRoomVotingView(snapshot, tasks); // Получаем представление для голосования, включая идентификатор активной задачи, саму активную задачу, статус раскрытия карт, а также информацию о том, проголосовали ли все игроки или хотя бы один игрок, с помощью функции getRoomVotingView
  const roomOwnerName = resolveRoomOwnerName(snapshot); // Получаем имя владельца комнаты для отображения, используя функцию resolveRoomOwnerName, которая может учитывать различные факторы, такие как наличие информации о владельце в данных комнаты и локальной сессии

  // Определяем, занята ли комната в данный момент выполнением какой-либо операции, такой как создание, обновление или удаление задач, а также действия, связанные с голосованием. Комната считается занятой, если любая из мутаций находится в состоянии ожидания (pending).
  const isBusy =
    createTaskMutation.isPending ||
    updateTaskMutation.isPending ||
    deleteTaskMutation.isPending ||
    selectTaskMutation.isPending ||
    startRoundMutation.isPending ||
    voteMutation.isPending ||
    revealMutation.isPending ||
    finalizeMutation.isPending;

  // Обработчик для выбора карты игроком. Он обновляет состояние pendingCard с выбранной картой, которая будет подтверждена при отправке голоса.
  const handleSelectCard = (card: string) => {
    setPendingCard(card);
  };

  // Обработчик для подтверждения голоса игрока. Он проверяет, что есть выбранная карта (pendingCard), и если есть, вызывает функцию handleSelectCardAction для выполнения действия выбора карты, передавая необходимые данные и функции для выполнения мутаций. После выполнения действия pendingCard сбрасывается в null.
  const handleConfirmVote = async () => {
    if (!pendingCard) return;
    await handleSelectCardAction({
      card: pendingCard,
      activeTask,
      isBusy,
      snapshot,
      isOwner,
      startRound: (taskId) => startRoundMutation.mutateAsync(taskId),
      vote: (payload) => voteMutation.mutateAsync(payload),
    });
    setPendingCard(null);
  };

  // Обработчик для раскрытия карт всех игроков в раунде. Он вызывает функцию handleRevealAction для выполнения действия раскрытия, передавая необходимые данные и функции для выполнения мутации.
  const handleReveal = async () => {
    await handleRevealAction({
      snapshot,
      isOwner,
      isBusy,
      revealRound: (roundId) => revealMutation.mutateAsync(roundId),
    });
  };

  // Обработчик для перехода к следующей задаче. Он вызывает функцию handleNextTaskAction для выполнения действия перехода к следующей задаче, передавая необходимые данные и функции для выполнения мутаций, таких как финализация раунда и выбор задачи.
  const handleNextTask = async () => {
    await handleNextTaskAction({
      snapshot,
      isOwner,
      isBusy,
      finalizeRound: (payload) => finalizeMutation.mutateAsync(payload),
      selectTask: (taskId) => selectTaskMutation.mutateAsync(taskId),
    });
  };

  // Функция для открытия модального окна создания задачи. Она сбрасывает текущее выбранное задание в null и устанавливает режим модального окна в 'create'.
  const openCreateTaskModal = () => {
    setTaskModalTask(null);
    setTaskModalMode('create');
  };

  // Функция для открытия модального окна просмотра задачи. Она устанавливает выбранное задание в taskModalTask и устанавливает режим модального окна в 'view'.
  const openViewTaskModal = (task: Task) => {
    setTaskModalTask(task);
    setTaskModalMode('view');
  };

  // Функция для открытия модального окна редактирования задачи. Она устанавливает выбранное задание в taskModalTask и устанавливает режим модального окна в 'edit'.
  const openEditTaskModal = (task: Task) => {
    setTaskModalTask(task);
    setTaskModalMode('edit');
  };

  // Обработчик для создания новой задачи. Он вызывает функцию handleAddTaskAction для выполнения действия добавления задачи, передавая необходимые данные и функции для выполнения мутации. Если задача успешно создана, модальное окно закрывается.
  const handleCreateTask = async (title: string, description: string) => {
    const isTaskCreated = await handleAddTaskAction({
      title,
      description,
      roomId,
      isOwner,
      isBusy,
      createTask: (payload) => createTaskMutation.mutateAsync(payload),
    });

    if (isTaskCreated) {
      setTaskModalMode(null);
    }
  };

  // Обработчик для выбора активной задачи. Он вызывает функцию handleSelectTaskAction для выполнения действия выбора задачи, передавая необходимые данные и функции для выполнения мутации.
  const handleSelectTask = async (taskId: string) => {
    await handleSelectTaskAction({
      taskId,
      snapshot,
      isOwner,
      isBusy,
      selectTask: (id) => selectTaskMutation.mutateAsync(id),
    });
  };

  // Обработчик для обновления существующей задачи. Он вызывает функцию handleUpdateTaskAction для выполнения действия обновления задачи, передавая необходимые данные и функции для выполнения мутации. Если задача успешно обновлена, модальное окно закрывается.
  const handleUpdateTask = async (taskId: string, title: string, description: string) => {
    try {
      const success = await handleUpdateTaskAction({
        taskId,
        title,
        description,
        isOwner,
        isBusy,
        updateTask: (payload) => updateTaskMutation.mutateAsync(payload),
      });

      if (success) {
        setTaskModalMode(null);
      } else {
        console.error('Update task failed: action returned false');
      }
    } catch (error) {
      console.error('Update task error:', error);
    }
  };

  // Обработчик для удаления задачи. Он вызывает функцию handleDeleteTaskAction для выполнения действия удаления задачи, передавая необходимые данные и функции для выполнения мутации. Если задача успешно удалена, никаких дополнительных действий не требуется, так как данные комнаты будут обновлены через функцию refreshRoomData.
  const handleDeleteTask = async (taskId: string) => {
    const success = await handleDeleteTaskAction({
      taskId,
      isOwner,
      isBusy,
      deleteTask: (id) => deleteTaskMutation.mutateAsync(id),
    });

    if (success) {

    }
  };

  const handleRequestEdit = () => {
    if (taskModalTask) {
      setTaskModalMode('edit');
    }
  };

  const handleFinalize = async (resultValue: string) => {
    if (!isOwner || !snapshot.active_round) return;
    await finalizeMutation.mutateAsync({
      roundId: snapshot.active_round.id,
      resultValue,
    });
  };

  const isTaskModalOpen = taskModalMode !== null;
  const resolvedTaskModalMode = taskModalMode ?? 'view';
  const isTaskSaving = createTaskMutation.isPending || updateTaskMutation.isPending;

  const footerInset = '14rem';

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden bg-background text-foreground selection:bg-primary/30"
      style={{ ['--room-footer-height' as string]: footerInset }}
    >
      {/* Background Decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-1/2 w-1/2 rounded-full bg-accent/5 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <RoomHeader
        roomName={snapshot.room.name}
        roomId={snapshot.room.slug}
        deckName={snapshot.room.deck.code === 'even' ? 'Чётная' : 'Фибоначчи'}
        inviteLink={snapshot.room.invite_link}
      />

      <main className="relative mx-auto grid w-full max-w-7xl min-h-0 flex-1 gap-3 overflow-y-auto px-4 py-3 pb-(--room-footer-height) scroll-pb-(--room-footer-height) sm:px-6 sm:py-4 lg:grid-cols-[20rem_minmax(0,1fr)] lg:overflow-visible lg:px-8">
        <TaskSidebar
          tasks={tasks}
          activeTaskId={activeTaskId}
          isRevealed={isRevealed}
          onSelectTask={handleSelectTask}
          onDeleteTask={handleDeleteTask}
          onOpenCreateModal={openCreateTaskModal}
          onOpenTaskModal={openViewTaskModal}
          onOpenEditModal={openEditTaskModal}
          isOwner={isOwner}
          className="h-auto min-h-0 lg:h-full lg:max-h-full"
        />

        <div className="grid min-w-0 gap-3 lg:grid-rows-[auto_auto_auto]">
          <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/30 p-3 backdrop-blur-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <TrophyIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Создатель комнаты
              </div>
              <div className="truncate text-xs font-bold text-foreground">
                {isOwner ? currentUserName : roomOwnerName}
              </div>
            </div>
          </div>

          <RoomResults
            activeTaskTitle={activeTask ? activeTask.title : null}
            cards={snapshot.room.deck.cards}
            isRevealed={isRevealed}
            isFinalized={false}
            allPlayersVoted={allPlayersVoted}
            anyPlayerVoted={anyPlayerVoted}
            onReveal={handleReveal}
            onFinalize={handleFinalize}
            onNextTask={handleNextTask}
            isOwner={isOwner}
            snapshot={snapshot}
            className="h-auto min-h-48 lg:h-full"
          />

          <ParticipantsList
            players={players}
            hasActiveTask={activeTask !== null}
            isRevealed={isRevealed}
            className="self-start h-auto min-h-5.5rem"
          />
        </div>
      </main>

      <RoomFooter
        cards={snapshot.room.deck.cards}
        selectedCard={pendingCard}
        disabled={isRevealed || !activeTask || isBusy}
        isVoting={isBusy}
        onSelectCard={handleSelectCard}
        onConfirmVote={handleConfirmVote}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        mode={resolvedTaskModalMode}
        task={taskModalTask ?? undefined}
        isOwner={isOwner}
        isSaving={isTaskSaving}
        onClose={() => setTaskModalMode(null)}
        onCreate={(payload) => handleCreateTask(payload.title, payload.description)}
        onUpdate={(payload) => handleUpdateTask(payload.id, payload.title, payload.description)}
        onRequestEdit={handleRequestEdit}
      />
    </div>
  );
}
