import { Button } from '../Button'; // Импортируем компонент Button из папки ui/Button

// Интерфейс для пропсов компонента EmptyState
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

// Компонент EmptyState, который отображает состояние пустоты с иконкой, заголовком, описанием и кнопкой действия
export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="mb-5 text-sm text-muted-foreground">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
