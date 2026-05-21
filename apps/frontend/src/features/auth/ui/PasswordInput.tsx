import { Field, Input as HeadlessInput, Label } from '@headlessui/react'; // Используем компоненты из Headless UI для создания стилизованного поля ввода пароля
import { forwardRef, useState, type ChangeEvent } from 'react'; // Импортируем необходимые хуки и типы из React
import { CheckIcon, EyeIcon } from '@/shared/ui/icons'; // Импортируем иконки для отображения состояния требований к паролю и переключения видимости
import type { InputProps } from '@/shared/ui/Input'; // Импортируем типы пропсов для базового компонента Input, который будет расширяться

// Определяем интерфейс пропсов для компонента PasswordInput, расширяя базовые пропсы Input и добавляя дополнительные опции
interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showRequirements?: boolean;
  showVisibilityToggle?: boolean;
}

// Интерфейс для описания каждого требования к паролю, включающего метку и флаг, указывающий, выполнено ли требование
interface RequirementItem {
  label: string;
  isMet: boolean;
}

// Функция для получения текстовой метки, описывающей силу пароля на основе количества выполненных требований
const getStrengthLabel = (score: number) => {
  if (score <= 1) {
    return 'Слабый пароль';
  }

  if (score <= 3) {
    return 'Средний пароль';
  }

  return 'Надёжный пароль';
};

// Компонент PasswordInput, который реализует поле ввода пароля с отображением требований и возможностью переключения видимости пароля. Используем forwardRef для передачи рефа к базовому элементу input.
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className = '',
      label,
      error,
      id,
      value,
      onFocus,
      onBlur,
      onChange,
      showRequirements = true,
      showVisibilityToggle = true,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [internalValue, setInternalValue] = useState('');

    const isControlled = typeof value === 'string';
    const currentValue = isControlled ? value : internalValue;

    const requirements: RequirementItem[] = [
      { label: 'Минимум 8 символов', isMet: currentValue.length >= 8 },
      { label: 'Хотя бы одна буква', isMet: /[a-zA-Zа-яА-Я]/.test(currentValue) },
      { label: 'Хотя бы одна цифра', isMet: /\d/.test(currentValue) },
      { label: 'Спецсимвол (!@#$%^&*)', isMet: /[!@#$%^&*]/.test(currentValue) },
    ];

    const strength = requirements.filter((item) => item.isMet).length;
    const showPanel = showRequirements && (isFocused || currentValue.length > 0);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(event.target.value);
      }

      onChange?.(event);
    };

    return (
      <Field className={`flex flex-col gap-1 ${className}`}>
        {label && (
          <Label htmlFor={inputId} className="text-sm font-medium text-muted-foreground">
            {label}
          </Label>
        )}

        <div className="relative">
          <HeadlessInput
            ref={ref}
            id={inputId}
            type={isVisible ? 'text' : 'password'}
            value={value}
            onChange={handleChange}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              onBlur?.(event);
            }}
            className="w-full rounded-lg border border-input bg-input px-3.5 py-2.5 pr-12 text-base text-foreground placeholder:text-muted-foreground/80 transition-colors duration-200 hover:border-primary/45 focus:border-primary/65 focus:outline-none focus:ring-2 focus:ring-ring/35"
            {...props}
          />

          {showVisibilityToggle && (
            <button
              type="button"
              aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
              onClick={() => setIsVisible((prev) => !prev)}
              className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
            >
              <EyeIcon className="h-4 w-4" />
              <span className="sr-only">{isVisible ? 'Скрыть пароль' : 'Показать пароль'}</span>
            </button>
          )}
        </div>

        {error && <span className="text-xs text-destructive">{error}</span>}

        {showPanel && (
          <div className="mt-1 rounded-lg border border-border/70 bg-card/65 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Надёжность пароля</p>
              <span className="text-xs text-foreground/80">{getStrengthLabel(strength)}</span>
            </div>

            <div className="mb-3 grid grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full ${index < strength ? 'bg-primary' : 'bg-secondary'}`}
                />
              ))}
            </div>

            <ul className="space-y-1.5">
              {requirements.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-xs">
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${
                      item.isMet
                        ? 'bg-primary/15 text-primary'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {item.isMet ? (
                      <CheckIcon className="h-3 w-3" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <span className={item.isMet ? 'text-foreground/85' : 'text-muted-foreground'}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Field>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
