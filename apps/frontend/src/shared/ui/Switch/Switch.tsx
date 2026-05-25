import { Switch as HeadlessSwitch } from '@headlessui/react'; // Импортируем компонент Switch из библиотеки Headless UI

// Интерфейс для пропсов компонента Switch, который описывает типы для состояния переключателя, функции изменения, метки и классов CSS
export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

// Компонент Switch, который отображает переключатель с меткой и обрабатывает изменение состояния
export function Switch({ checked, onChange, label, className = '' }: SwitchProps) {
  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      className={`group inline-flex h-6 w-11 items-center rounded-full border border-border bg-secondary/70 p-0.5 outline-none transition-colors data-checked:bg-primary data-focus:ring-2 data-focus:ring-primary/40 ${className}`}
      aria-label={label ?? 'Переключатель'}
    >
      <span className="size-5 rounded-full bg-white transition-transform group-data-checked:translate-x-5" />
    </HeadlessSwitch>
  );
}
