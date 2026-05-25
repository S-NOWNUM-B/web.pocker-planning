import { useState } from 'react'; // Импорт хука useState для управления состоянием компонента
import { Link, useNavigate } from 'react-router-dom'; // Импорт компонентов Link и useNavigate из библиотеки react-router-dom для навигации между страницами
import { useTheme } from '@/shared/lib/hooks'; // Импорт пользовательского хука useTheme для управления темой приложения
import { Button, Switch } from '@/shared/ui'; // Импорт компонентов Button и Switch из библиотеки UI компонентов
import { LinkIcon, LogOutIcon, MoonIcon, SunIcon, TrophyIcon } from '@/shared/ui/icons'; // Импорт иконок из библиотеки иконок

// Интерфейс для пропсов компонента RoomHeader
interface RoomHeaderProps {
  roomName: string;
  roomId: string;
  deckName: string;
  inviteLink?: string | null;
}

// Компонент для отображения верхней части комнаты, включая название, идентификатор, колоду и кнопки для приглашения, выхода и переключения темы
export function RoomHeader({ roomName, roomId, deckName, inviteLink }: RoomHeaderProps) {
  const navigate = useNavigate(); // Хук для программной навигации между страницами
  const { theme, setTheme } = useTheme(); // Хук для получения текущей темы и функции для её изменения
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle'); // Состояние для управления состоянием кнопки копирования ссылки (по умолчанию 'idle')

  // Функция для копирования ссылки на комнату в буфер обмена и изменения состояния кнопки на 'copied' на короткое время
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink || window.location.href);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      return;
    }
  };

  // Функция для выхода из комнаты и перехода на страницу дашборда
  const handleExitRoom = () => {
    navigate('/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-card/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <TrophyIcon className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">
              Poker<span className="text-primary">.</span>Planning
            </span>
          </Link>

          <div className="hidden min-w-0 items-center gap-2 text-xs text-muted-foreground md:flex">
            <span className="max-w-48 truncate font-medium text-foreground/80">{roomName}</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="truncate font-mono opacity-60">{roomId}</span>
            <span className="rounded-md border border-border bg-secondary/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {deckName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCopyLink}
            className="h-9 px-3 text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <LinkIcon className="mr-1.5 h-3.5 w-3.5" />
            <span>{copyState === 'copied' ? 'Скопировано' : 'Пригласить'}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleExitRoom}
            className="h-9 px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOutIcon className="mr-1.5 h-3.5 w-3.5" />
            <span>Выйти</span>
          </Button>
          <div className="ml-1 flex h-8 items-center gap-2 rounded-full border border-border bg-secondary/20 px-1.5">
            {theme === 'dark' ? (
              <MoonIcon className="ml-1 h-3.5 w-3.5" />
            ) : (
              <SunIcon className="ml-1 h-3.5 w-3.5" />
            )}
            <Switch
              checked={theme === 'dark'}
              onChange={(isDark) => setTheme(isDark ? 'dark' : 'light')}
              label="Тема"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
