/**
 * Боковая панель задач в игровой комнате.
 *
 * Левая колонка RoomPage (на десктопе). Содержит:
 *  - Фильтрацию задач (Все, Активные, Завершенные)
 *  - Список задач с отметкой оценённых (SP)
 *  - Счётчик оценённых/всего задач
 *  - Поле ввода для добавления новой задачи
 *
 * При клике на задачу — она становится активной для голосования.
 * Оценённые задачи визуально отличаются (приглушённый цвет + бейдж SP).
 *
 * @param tasks — массив задач
 * @param activeTaskId — ID текущей активной задачи
 * @param isRevealed — раскрыты ли результаты (блокирует переключение)
 * @param newTaskTitle — значение поля ввода новой задачи
 * @param onNewTaskTitleChange — обработчик изменения поля
 * @param onAddTask — добавление задачи (Enter или кнопка)
 * @param onSelectTask — выбор активной задачи
 * @param className — дополнительный CSS-класс
 */
import { useState, useMemo } from 'react';
import { Button } from '@/shared/ui';
import { cn } from '@/shared/lib';
import type { Task } from '@/shared/lib/poker';

interface TaskSidebarProps {
  tasks: Task[];
  activeTaskId: string | null;
  isRevealed: boolean;
  onSelectTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCreateModal: () => void;
  onOpenTaskModal: (task: Task) => void;
  onOpenEditModal: (task: Task) => void;
  isOwner: boolean;
  className?: string;
}

type TaskFilter = 'all' | 'active' | 'completed';

export function TaskSidebar({
  tasks,
  activeTaskId,
  isRevealed,
  onSelectTask,
  onDeleteTask,
  onOpenEditModal,
  onOpenCreateModal,
  onOpenTaskModal,
  isOwner,
  className,
}: TaskSidebarProps) {
  const [filter, setFilter] = useState<TaskFilter>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === 'active') return task.id === activeTaskId;
      if (filter === 'completed') return task.estimate !== null;
      return true;
    });
  }, [tasks, filter, activeTaskId]);

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 w-full shrink-0 flex-col rounded-3xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm lg:w-80',
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/80">Задачи</h2>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
          {tasks.filter((task) => task.estimate).length}/{tasks.length}
        </span>
      </div>

      <div className="mb-6 flex p-1 rounded-xl bg-background/50 border border-border/50 backdrop-blur-xs">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200',
              filter === f
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {f === 'all' ? 'Все' : f === 'active' ? 'В работе' : 'Готовы'}
          </button>
        ))}
      </div>

      <div className="mb-6 max-h-58 space-y-2 overflow-y-auto pr-1 lg:min-h-0 lg:flex-1 lg:max-h-none scrollbar-hide">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-secondary/20 p-8 text-center text-xs text-muted-foreground leading-relaxed">
            {filter === 'all'
              ? 'Список задач пуст. Добавьте первую задачу'
              : 'Нет задач в этом фильтре'}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isActive = task.id === activeTaskId;

            return (
              <div key={task.id} className="group relative">
                <Button
                  type="button"
                  onClick={() => {
                    onOpenTaskModal(task);
                    if (!isRevealed) {
                      onSelectTask(task.id);
                    }
                  }}
                  variant="ghost"
                  className={cn(
                    'w-full border p-3 text-left transition-all duration-200',
                    isActive
                      ? 'border-primary/30 bg-primary/10 shadow-sm ring-1 ring-primary/10'
                      : task.estimate
                        ? 'border-border/50 bg-secondary/30 text-muted-foreground opacity-70'
                        : 'border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/80',
                  )}
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <span
                      className={cn(
                        'line-clamp-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    >
                      {task.title}
                    </span>
                    {task.estimate && (
                      <span className="shrink-0 rounded-md bg-secondary text-[10px] font-bold px-1.5 py-0.5 text-muted-foreground border border-border/50">
                        {task.estimate}
                      </span>
                    )}
                  </div>
                </Button>

                {isOwner && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity">
                    <Button
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-primary bg-card/80 backdrop-blur-sm border border-border/50 rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditModal(task);
                      }}
                    >
                      <span className="text-[10px]">✎</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive bg-card/80 backdrop-blur-sm border border-border/50 rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Вы точно хотите удалить эту задачу?')) {
                          onDeleteTask(task.id);
                        }
                      }}
                    >
                      <span className="text-[10px]">🗑</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="pt-2">
        <Button
          onClick={onOpenCreateModal}
          disabled={!isOwner}
          className="w-full rounded-xl"
          variant="ghost"
        >
          Новая задача
        </Button>
      </div>
    </aside>
  );
}
