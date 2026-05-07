import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/app/providers';
import { roomApi } from '@/entities/room';
import {
  getRoomVotingView,
  mapSnapshotPlayers,
  mapSnapshotTasks,
  resolveRoomOwnerName,
} from '@/entities/room/lib/roomSnapshotMappers';
import {
  handleRevealAction,
  handleSelectCardAction,
} from '@/features/voting/lib/roomVotingActions';
import {
  handleAddTaskAction,
  handleNextTaskAction,
  handleSelectTaskAction,
} from '@/features/task-management/lib/roomTaskActions';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Spinner } from '@/shared/ui';
import { TrophyIcon } from '@/shared/ui/icons';
import {
  getLocalSession,
  loadRoomSnapshotWithToken,
  roomRefLooksLikeCode,
} from '@/shared/lib/room';
import { persistRoomSession } from '@/shared/lib/session/persistRoomSession';
import { SessionManager } from '@/shared/lib/session';
import { ParticipantsList, RoomFooter, RoomHeader, RoomResults, TaskSidebar } from '@/widgets';
import { useRoomParams } from '../lib/useRoomParams';
import { useRoomWebSocket } from '../lib/useRoomWebSocket';

export function RoomPage() {
  const { roomId: roomRef } = useRoomParams();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [pendingCard, setPendingCard] = useState<string | null>(null);
  const [resolvedRoomRef, setResolvedRoomRef] = useState(roomRef);
  const localSession = getLocalSession();
  const roomAccessToken = user ? undefined : localSession?.roomAccessToken;

  useEffect(() => {
    setResolvedRoomRef(roomRef);
  }, [roomRef]);

  const roomQuery = useQuery({
    queryKey: ['room', resolvedRoomRef, user?.id ?? 'guest', roomAccessToken ?? 'no-token'],
    enabled: Boolean(user || roomAccessToken),
    queryFn: () => loadRoomSnapshotWithToken(resolvedRoomRef, roomAccessToken),
  });

  const snapshot = roomQuery.data;
  const roomId = snapshot?.room.id;

  // Use WebSocket for real-time updates instead of polling
  // Wait for resolved room ID before connecting WebSocket
  const authToken = user ? SessionManager.getToken() : roomAccessToken;
  useRoomWebSocket({
    roomId: roomId || resolvedRoomRef,  // Use resolved room ID from snapshot or fallback to ref
    token: authToken || undefined,
    enabled: Boolean(user || roomAccessToken) && roomId !== undefined,  // Only enable when we have real room ID
  });

  const refreshRoomData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['room', resolvedRoomRef, user?.id ?? 'guest', roomAccessToken ?? 'no-token'],
      }),
      queryClient.invalidateQueries({ queryKey: ['rooms'] }),
      queryClient.invalidateQueries({ queryKey: ['room-history', roomId] }),
    ]);
  };

  const createTaskMutation = useMutation({
    mutationFn: (title: string) => roomApi.createTask(roomId as string, title, roomAccessToken),
    onSuccess: refreshRoomData,
  });

  const selectTaskMutation = useMutation({
    mutationFn: (taskId: string) => roomApi.selectTask(roomId as string, taskId, roomAccessToken),
    onSuccess: refreshRoomData,
  });

  const startRoundMutation = useMutation({
    mutationFn: (taskId: string) => roomApi.startRound(roomId as string, taskId, roomAccessToken),
    onSuccess: refreshRoomData,
  });

  const voteMutation = useMutation({
    mutationFn: ({ roundId, value }: { roundId: string; value: string }) =>
      roomApi.submitVote(roomId as string, roundId, value, roomAccessToken),
    onSuccess: refreshRoomData,
  });

  const revealMutation = useMutation({
    mutationFn: (roundId: string) =>
      roomApi.revealRound(roomId as string, roundId, roomAccessToken),
    onSuccess: refreshRoomData,
  });

  const finalizeMutation = useMutation({
    mutationFn: ({ roundId, resultValue }: { roundId: string; resultValue?: string }) =>
      roomApi.finalizeRound(roomId as string, roundId, resultValue, roomAccessToken),
    onSuccess: refreshRoomData,
  });

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

  if (!user && !roomAccessToken) {
    return <Navigate to="/login" replace />;
  }

  if (roomQuery.isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8.5rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (roomQuery.isError || !snapshot) {
    return <NotFoundPage />;
  }

  const selfParticipant = snapshot.self_participant_id
    ? snapshot.participants.find((participant) => participant.id === snapshot.self_participant_id)
    : null;
  const isOwner = selfParticipant?.role === 'owner';
  const currentUserName = user?.name || selfParticipant?.name || localSession?.userName || 'Гость';
  const tasks = mapSnapshotTasks(snapshot);
  const players = mapSnapshotPlayers(snapshot);
  const { activeTaskId, activeTask, isRevealed, allPlayersVoted, anyPlayerVoted } =
    getRoomVotingView(snapshot, tasks);
  const roomOwnerName = resolveRoomOwnerName(snapshot);

  const isBusy =
    createTaskMutation.isPending ||
    selectTaskMutation.isPending ||
    startRoundMutation.isPending ||
    voteMutation.isPending ||
    revealMutation.isPending ||
    finalizeMutation.isPending;

  const handleSelectCard = (card: string) => {
    setPendingCard(card);
  };

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

  const handleReveal = async () => {
    await handleRevealAction({
      snapshot,
      isOwner,
      isBusy,
      revealRound: (roundId) => revealMutation.mutateAsync(roundId),
    });
  };

  const handleNextTask = async () => {
    await handleNextTaskAction({
      snapshot,
      isOwner,
      isBusy,
      finalizeRound: (payload) => finalizeMutation.mutateAsync(payload),
      selectTask: (taskId) => selectTaskMutation.mutateAsync(taskId),
    });
  };

  const handleAddTask = async () => {
    const isTaskCreated = await handleAddTaskAction({
      title: newTaskTitle,
      roomId,
      isOwner,
      isBusy,
      createTask: (title) => createTaskMutation.mutateAsync(title),
    });

    if (isTaskCreated) {
      setNewTaskTitle('');
    }
  };

  const handleSelectTask = async (taskId: string) => {
    await handleSelectTaskAction({
      taskId,
      snapshot,
      isOwner,
      isBusy,
      selectTask: (id) => selectTaskMutation.mutateAsync(id),
    });
  };

  const handleFinalize = async (resultValue: string) => {
    if (!isOwner || !snapshot.active_round) return;
    await finalizeMutation.mutateAsync({
      roundId: snapshot.active_round.id,
      resultValue,
    });
  };

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
          newTaskTitle={newTaskTitle}
          onNewTaskTitleChange={setNewTaskTitle}
          onAddTask={handleAddTask}
          onSelectTask={handleSelectTask}
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
    </div>
  );
}
