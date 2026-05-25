const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}; // Объект, который сопоставляет значения size с соответствующими классами Tailwind CSS для размера спиннера

// Интерфейс для пропсов компонента Spinner, который описывает типы для размера и метки
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

// Компонент Spinner, который отображает индикатор загрузки с опциональной текстовой подписью
export function Spinner({ size = 'md', label }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`animate-spin rounded-full border-3 border-border border-t-primary ${sizeClasses[size]}`}
        style={{ borderWidth: '3px' }}
      />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}
