import { type HTMLAttributes, type ReactNode } from 'react'; // Импортируем типы для HTML атрибутов и ReactNode

// Определяем классы для разных вариантов карточки
const variantClasses = {
  default: 'border border-border/70 bg-card',
  elevated: 'border border-border/60 bg-card shadow-md',
  outlined: 'border border-border/80 bg-transparent',
};

// Интерфейс для пропсов компонента Card, расширяющий HTML атрибуты для div
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
}

// Компонент Card, который принимает пропсы и возвращает JSX элемент
export function Card({ className = '', variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl p-5 text-card-foreground ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
