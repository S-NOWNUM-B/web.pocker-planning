import { CheckIcon, CoffeeIcon, HelpCircleIcon, TargetIcon } from '@/shared/ui/icons'; // Импорт иконок из библиотеки иконок
import { cn } from '@/shared/lib'; // Импорт функции для объединения классов (например, clsx или classnames)
import type { Player } from '@/shared/lib/poker'; // Импорт типа Player, который описывает структуру данных игрока

// Интерфейс для пропсов компонента ParticipantsList
interface ParticipantsListProps {
  players: Player[];
  hasActiveTask: boolean;
  isRevealed: boolean;
  className?: string;
}

// Компонент для отображения списка участников с их голосами и статусами
export function ParticipantsList({
  players,
  hasActiveTask,
  isRevealed,
  className,
}: ParticipantsListProps) {
  if (players.length === 0) {
    return null;
  }

  // Функция для отображения видимого голоса в зависимости от его значения
  const renderVisibleVote = (value: string) => {
    if (value === '☕' || value === 'break') {
      return (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CoffeeIcon className="h-3 w-3" />
        </span>
      );
    }

    if (value === '?') {
      return (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HelpCircleIcon className="h-3 w-3" />
        </span>
      );
    }

    return <span className="text-xs font-black">{value}</span>;
  };

  return (
    <section className={cn('w-full', className)}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Участники
          </h2>
          <span className="text-xs font-medium text-muted-foreground/60">{players.length}</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {players.map((player) => {
            const hasVote = player.vote !== null;
            const voteIsVisible = isRevealed && hasVote;
            const isWaitingForTask = !hasActiveTask;

            return (
              <div
                key={player.id}
                className={cn(
                  'group relative flex min-w-140px items-center gap-3 rounded-2xl border bg-card/30 p-2 backdrop-blur-sm transition-all duration-300',
                  hasVote && !voteIsVisible
                    ? 'border-primary/30 ring-1 ring-primary/10'
                    : 'border-border/50',
                )}
              >
                {/* Subtle glow for players who voted */}
                {hasVote && !voteIsVisible && (
                  <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-md pointer-events-none" />
                )}

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary-foreground/20 text-[10px] font-bold text-primary-foreground shadow-sm transition-transform">
                  {player.name.slice(0, 1).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold text-foreground transition-colors">
                    {player.name}
                  </div>
                  {player.role ? (
                    <div className="truncate text-[10px] text-muted-foreground">{player.role}</div>
                  ) : null}
                </div>

                <div
                  className={cn(
                    'relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold transition-all duration-300',
                    voteIsVisible
                      ? 'border-primary/50 bg-background text-foreground'
                      : hasVote
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm animate-vote-pulse'
                        : 'border-border/50 bg-card/50 text-muted-foreground/40',
                  )}
                  aria-label={`Голос ${player.name}: ${
                    voteIsVisible
                      ? player.vote
                      : hasVote
                        ? 'проголосовал'
                        : isWaitingForTask
                          ? 'вопрос не выбран'
                          : 'ожидает оценки'
                  }`}
                >
                  {voteIsVisible ? (
                    renderVisibleVote(player.vote as string)
                  ) : hasVote ? (
                    <CheckIcon className="h-3 w-3" />
                  ) : isWaitingForTask ? (
                    <TargetIcon className="h-3 w-3" />
                  ) : (
                    '...'
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
