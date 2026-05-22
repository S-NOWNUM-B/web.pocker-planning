import { useState, useEffect } from 'react'; // Импортируем необходимые хуки из React
import { Modal, Input, Button } from '@/shared/ui'; // Импортируем компоненты Modal, Input и Button из общего UI-кита

// Интерфейс для пропсов компонента EditTaskModal
interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  initialTitle: string;
  isSaving: boolean;
}

// Этот компонент отображает модальное окно для редактирования названия задачи. Он принимает пропсы для управления открытием, закрытием, сохранением и начальным названием задачи.
export function EditTaskModal({
  isOpen,
  onClose,
  onSave,
  initialTitle,
  isSaving,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  const handleSave = () => {
    onSave(title);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактировать задачу">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Название задачи
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите название задачи..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
