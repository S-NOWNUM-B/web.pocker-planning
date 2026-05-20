import { useEffect, useMemo, useState } from 'react';
import { Modal, Input, Button } from '@/shared/ui';

const MAX_TITLE_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 500;

type TaskModalMode = 'create' | 'view' | 'edit';

type TaskModalTask = {
  id: string;
  title: string;
  description: string;
};

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

  const trimmedTitle = title.trim();
  const isTitleValid = trimmedTitle.length > 0 && trimmedTitle.length <= MAX_TITLE_LENGTH;
  const isDescriptionValid = description.length <= MAX_DESCRIPTION_LENGTH;
  const isFormValid = isTitleValid && isDescriptionValid;

  const titleCounter = useMemo(
    () => `${title.length}/${MAX_TITLE_LENGTH}`,
    [title.length],
  );
  const descriptionCounter = useMemo(
    () => `${description.length}/${MAX_DESCRIPTION_LENGTH}`,
    [description.length],
  );

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
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Описание
              </div>
              <div className="min-h-30 rounded-xl border border-border/60 bg-secondary/20 px-3 py-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {task?.description?.trim()
                  ? task?.description
                  : 'Описание отсутствует.'}
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
                  className={
                    description.length > MAX_DESCRIPTION_LENGTH ? 'text-destructive' : ''
                  }
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
