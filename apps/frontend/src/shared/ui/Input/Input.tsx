import { Field, Input as HeadlessInput, Label } from '@headlessui/react'; // Импортируем компоненты Field, Input и Label из библиотеки Headless UI
import { type InputHTMLAttributes, forwardRef } from 'react'; // Импортируем типы для HTML атрибутов и функцию forwardRef из React

// Интерфейс для пропсов компонента Input, расширяющий HTML атрибуты для input
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Компонент Input, который принимает пропсы и возвращает JSX элемент
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <Field className={`flex flex-col gap-1 ${className}`}>
        {label && (
          <Label htmlFor={inputId} className="text-sm font-medium text-muted-foreground">
            {label}
          </Label>
        )}
        <HeadlessInput
          ref={ref}
          id={inputId}
          className="rounded-lg border border-input bg-input px-3.5 py-2.5 text-base text-foreground placeholder:text-muted-foreground/80 transition-colors duration-200 hover:border-primary/45 focus:border-primary/65 focus:outline-none focus:ring-2 focus:ring-ring/35"
          {...props}
        />
        {error && <span className="text-xs text-destructive">{error}</span>}
      </Field>
    );
  },
);

Input.displayName = 'Input'; // Устанавливаем displayName для компонента Input, чтобы улучшить отладку и отображение в React DevTools
