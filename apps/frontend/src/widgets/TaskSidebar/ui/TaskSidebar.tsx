import { useState, useMemo } from 'react'; // Импорт хуков useState и useMemo для управления состоянием и оптимизации вычислений в компоненте
import { Button } from '@/shared/ui'; // Импорт компонента Button из общей библиотеки UI компонентов
import { EditIcon, TrashIcon, CheckIcon } from '@/shared/ui/icons'; // Импорт иконок EditIcon и TrashIcon для отображения кнопок редактирования и удаления задач
import { cn } from '@/shared/lib'; // Импорт функции cn для удобного объединения классов CSS
import type { Task } from '@/shared/lib/poker'; // Импорт типа Task, который описывает структуру данных задачи в приложении

// Интерфейс для пропсов компонента TaskSidebar, который описывает все необходимые данные и функции для отображения и управления списком задач в боковой панели комнаты
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

type TaskFilter = 'all' | 'active' | 'completed'; // Тип для фильтра задач, который может принимать значения 'all' (все задачи), 'active' (только активные задачи) или 'completed' (только завершённые задачи)

// Компонент для отображения боковой панели задач в комнате, который позволяет пользователям видеть список задач, фильтровать их по статусу, открывать модальные окна для создания и редактирования задач, а также удалять задачи (для владельца комнаты)
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
  const [filter, setFilter] = useState<TaskFilter>('all'); // Состояние для хранения текущего фильтра задач, по умолчанию установлен в 'all' для отображения всех задач

  // Вычисление отфильтрованного списка задач на основе выбранного фильтра и активной задачи, с помощью useMemo для оптимизации, чтобы не пересчитывать список при каждом рендере, а только при изменении задач, фильтра или активной задачи
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === 'active') return task.id === activeTaskId && task.estimate === null;
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
                  <div className="flex items-start gap-2 w-full">
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
                  </div>
                </Button>

                {isOwner && (
                  <div className="absolute right-2 top-1/2 z-20 -translate-y-1/2 flex items-center gap-1 opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      className={cn(
                        'group h-7 w-7 p-0 border rounded-md backdrop-blur-sm',
                        isActive
                          ? 'bg-primary/15 border-primary/40 text-destructive'
                          : 'text-destructive hover:text-destructive bg-card/80 border-border/50',
                      )}
                      title="Выбрать активной"
                      disabled={isRevealed}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isRevealed) {
                          onSelectTask(task.id);
                        }
                      }}
                    >
                      <CheckIcon
                        className="h-4 w-4 flex-none text-destructive"
                        stroke="var(--destructive)"
                        strokeWidth={1.8}
                        style={{ width: 16, height: 16 }}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      className="group h-7 w-7 p-0 text-foreground hover:text-primary bg-card/80 backdrop-blur-sm border border-border/50 rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditModal(task);
                      }}
                    >
                      <EditIcon
                        className="h-4 w-4 flex-none"
                        stroke="var(--primary)"
                        strokeWidth={1.6}
                        style={{ width: 16, height: 16 }}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      className="group h-7 w-7 p-0 text-foreground hover:text-destructive bg-card/80 backdrop-blur-sm border border-border/50 rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Вы точно хотите удалить эту задачу?')) {
                          onDeleteTask(task.id);
                        }
                      }}
                    >
                      <TrashIcon
                        className="h-4 w-4 flex-none"
                        stroke="var(--destructive)"
                        strokeWidth={1.6}
                        style={{ width: 16, height: 16 }}
                      />
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
