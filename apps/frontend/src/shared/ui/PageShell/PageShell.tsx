import { type ReactNode } from 'react'; // Импортируем тип ReactNode из React, который используется для описания типа детей компонента

// Объект, который сопоставляет значения maxWidth с соответствующими классами Tailwind CSS для ограничения максимальной ширины контейнера
const maxWidthClass = {
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  full: 'max-w-7xl',
};

// Интерфейс для пропсов компонента PageShell, который описывает типы для детей, максимальной ширины и классов CSS
interface PageShellProps {
  children: ReactNode;
  maxWidth?: keyof typeof maxWidthClass;
  className?: string;
  contentClassName?: string;
}

// Компонент PageShell, который оборачивает содержимое страницы и добавляет фоновую графику и ограничение ширины
export function PageShell({
  children,
  maxWidth = 'full',
  className = '',
  contentClassName = '',
}: PageShellProps) {
  return (
    <main className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-primary/14 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-accent/12 blur-3xl" />
      </div>
      <div
        className={`relative z-10 mx-auto w-full ${maxWidthClass[maxWidth]} px-4 py-10 sm:px-6 lg:px-8 ${contentClassName}`}
      >
        {children}
      </div>
    </main>
  );
}
