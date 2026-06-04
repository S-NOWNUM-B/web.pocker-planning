import { useEffect, useMemo, useState } from 'react'; // Импортируем необходимые хуки из React
import { Modal, Input, Button } from '@/shared/ui'; // Импортируем компоненты Modal, Input и Button из общего UI-кита

const MAX_TITLE_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 500;

type TaskModalMode = 'create' | 'view' | 'edit'; // Тип для режима отображения модального окна задачи, который может быть "создание", "просмотр" или "редактирование".

// Тип для данных задачи, который используется в компоненте TaskModal для отображения и редактирования информации о задаче.
type TaskModalTask = {
  id: string;
  title: string;
  description: string;
  estimate: string | null;
};

// Интерфейс для пропсов компонента TaskModal, который отображает модальное окно для создания, просмотра или редактирования задачи. Он принимает пропсы для управления открытием, режимом, данными задачи, правами доступа, состоянием сохранения и функциями для обработки действий с задачей.
interface TaskModalProps {
  isOpen: boolean;
  mode: TaskModalMode;
  task?: TaskModalTask | null;
  isOwner: boolean;
  isSaving: boolean;
  onClose: () => void;
  onCreate: (payload: { title: string; description: string }) => void;
  onUpdate: (payload: { id: string; title: string; description: string }) => void;
  onRequestEdit?: () => void;
}

// Этот компонент отображает модальное окно для создания, просмотра или редактирования задачи. В режиме "просмотр" отображается информация о задаче, а в режимах "создание" и "редактирование" отображается форма для ввода названия и описания задачи с валидацией и счетчиками символов.
export function TaskModal({
  isOpen,
  mode,
  task,
  isOwner,
  isSaving,
  onClose,
  onCreate,
  onUpdate,
  onRequestEdit,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Этот эффект выполняется при открытии модального окна и изменении режима или данных задачи. Он устанавливает начальные значения для полей названия и описания в зависимости от режима: при создании поля очищаются, а при редактировании заполняются данными задачи.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (mode === 'create') {
      setTitle('');
      setDescription('');
      return;
    }

    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
  }, [isOpen, mode, task?.description, task?.title]);

  const trimmedTitle = title.trim(); // Удаляем пробелы в начале и конце названия задачи для более точной валидации
  const isTitleValid = trimmedTitle.length > 0 && trimmedTitle.length <= MAX_TITLE_LENGTH; // Проверяем, что название задачи не пустое и не превышает максимальную длину, чтобы определить, является ли оно валидным для сохранения.
  const isDescriptionValid = description.length <= MAX_DESCRIPTION_LENGTH; // Проверяем, что описание задачи не превышает максимальную длину, чтобы определить, является ли оно валидным для сохранения.
  const isFormValid = isTitleValid && isDescriptionValid; // Флаг, который указывает, что форма для создания или редактирования задачи является валидной и может быть сохранена, если оба поля (название и описание) проходят валидацию по длине.

  const titleCounter = useMemo(() => `${title.length}/${MAX_TITLE_LENGTH}`, [title.length]); // С помощью хука useMemo создаем строку счетчика символов для названия задачи, которая обновляется только при изменении длины названия, чтобы оптимизировать производительность и избежать лишних вычислений при каждом рендере.
  const descriptionCounter = useMemo(
    () => `${description.length}/${MAX_DESCRIPTION_LENGTH}`,
    [description.length],
  ); // С помощью хука useMemo создаем строку счетчика символов для описания задачи, которая обновляется только при изменении длины описания, чтобы оптимизировать производительность и избежать лишних вычислений при каждом рендере.

  // Эта функция обрабатывает сохранение задачи при нажатии на кнопку "Сохранить" или при нажатии клавиши Enter. Она проверяет, что форма является валидной и не находится в процессе сохранения, а затем вызывает соответствующую функцию для создания или обновления задачи в зависимости от текущего режима.
  const handleSubmit = () => {
    if (!isFormValid || isSaving) {
      return;
    }

    if (mode === 'create') {
      onCreate({ title: trimmedTitle, description: description.trim() });
      return;
    }

    if (mode === 'edit' && task) {
      onUpdate({ id: task.id, title: trimmedTitle, description: description.trim() });
    }
  };

  // Выбираем заголовок модального окна в зависимости от текущего режима: "Новая задача" для создания, "Редактировать задачу" для редактирования и "Описание задачи" для просмотра.
  const modalTitle =
    mode === 'create'
      ? 'Новая задача'
      : mode === 'edit'
        ? 'Редактировать задачу'
        : 'Описание задачи';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div className="space-y-4">
        {mode === 'view' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Название
              </div>
              <div className="rounded-xl border border-border/60 bg-secondary/30 px-3 py-2 text-sm font-medium">
                {task?.title || 'Без названия'}
              </div>
            </div>
            {task?.estimate && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Оценка
                </div>
                <div className="inline-flex items-center justify-center rounded-xl border border-border/60 bg-secondary/30 px-3 py-2 text-sm font-semibold text-foreground">
                  {task.estimate}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Описание
              </div>
              <div className="min-h-30 rounded-xl border border-border/60 bg-secondary/20 px-3 py-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {task?.description?.trim() ? task?.description : 'Описание отсутствует.'}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Название</span>
                <span className={title.length > MAX_TITLE_LENGTH ? 'text-destructive' : ''}>
                  {titleCounter}
                </span>
              </div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название задачи..."
                autoFocus
                maxLength={MAX_TITLE_LENGTH}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Описание</span>
                <span
                  className={description.length > MAX_DESCRIPTION_LENGTH ? 'text-destructive' : ''}
                >
                  {descriptionCounter}
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишите задачу подробнее..."
                maxLength={MAX_DESCRIPTION_LENGTH}
                rows={6}
                className="w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          {mode === 'view' ? (
            <>
              {isOwner && onRequestEdit && (
                <Button variant="ghost" onClick={onRequestEdit}>
                  Редактировать
                </Button>
              )}
              <Button onClick={onClose}>Закрыть</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                Отмена
              </Button>
              <Button onClick={handleSubmit} disabled={!isFormValid || isSaving}>
                {isSaving ? 'Сохранение...' : mode === 'create' ? 'Создать' : 'Сохранить'}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
