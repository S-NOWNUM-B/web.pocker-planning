/**
 * Набор SVG-иконок для интерфейса.
 *
 * Все иконки:
 *  - Размер 24×24 (viewBox)
 *  - stroke-width 1.8
 *  - round linecap/linejoin
 *  - aria-hidden="true"
 *
 * Экспортируемые иконки:
 *  SparklesIcon, MoonIcon, SunIcon, PlayIcon, TrophyIcon,
 *  UsersIcon, LinkIcon, LogOutIcon, TargetIcon, CheckIcon,
 *  CoffeeIcon, HelpCircleIcon, EyeIcon, RotateCcwIcon, PlusIcon,
 *  EditIcon, TrashIcon
 *
 * Принимают стандартные SVG-пропсы (className, style и т.д.).
 */
import type { SVGProps, ReactNode } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function IconShell({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M12 2l1.4 4.2L17.6 8 13.4 9.4 12 13.6l-1.4-4.2L6.4 8l4.2-1.8L12 2Z" />
      <path d="M19 12l.9 2.7L22 15.5l-2.1.8L19 19l-.9-2.7-2.1-.8 2.1-.8L19 12Z" />
      <path d="M5 13l.8 2.2L8 16l-2.2.8L5 19l-.8-2.2L2 16l2.2-.8L5 13Z" />
    </IconShell>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M20 14.2A8.5 8.5 0 1 1 9.8 4a7 7 0 0 0 10.2 10.2Z" />
    </IconShell>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </IconShell>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M9 7l8 5-8 5V7Z" />
    </IconShell>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M7 4h10v3a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H5a2 2 0 0 0 2 4M17 5h2a2 2 0 0 1-2 4" />
      <path d="M12 12v4M9 21h6M10 16h4" />
    </IconShell>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM15.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M3.5 20a5 5 0 0 1 10 0M13.5 20a4 4 0 0 1 7 0" />
    </IconShell>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M10 13a4 4 0 0 1 0-6l1.2-1.2a4 4 0 0 1 5.6 5.6L15.5 12" />
      <path d="M14 11a4 4 0 0 1 0 6L12.8 18.2a4 4 0 0 1-5.6-5.6L8.5 12" />
    </IconShell>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H10" />
    </IconShell>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </IconShell>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="m5 12 4 4 10-10" />
    </IconShell>
  );
}

export function CoffeeIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M6 8h9v5a4 4 0 0 1-4 4H9a3 3 0 0 1-3-3V8Z" />
      <path d="M15 9h2a2 2 0 0 1 0 4h-1" />
      <path d="M5 19h12" />
    </IconShell>
  );
}

export function HelpCircleIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.8 2.8 0 0 1 5 1.7c0 1.8-2.2 2.1-2.2 3.8" />
      <path d="M12 17.5h0" />
    </IconShell>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M2.5 12S5.5 5.5 12 5.5 21.5 12 21.5 12 18.5 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </IconShell>
  );
}

export function RotateCcwIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </IconShell>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M12 5v14M5 12h14" />
    </IconShell>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M4 20h4l10-10-4-4L4 16v4Z" />
      <path d="M13 6l4 4" />
    </IconShell>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M5 7h14" />
      <path d="M9 7V5h6v2" />
      <path d="M7 7l1 12h8l1-12" />
      <path d="M10 11v4M14 11v4" />
    </IconShell>
  );
}
