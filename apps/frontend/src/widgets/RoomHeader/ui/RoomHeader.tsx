/**
 * Шапка игровой комнаты.
 *
 * Верхняя панель RoomPage. Содержит:
 *  - Название комнаты и ID
 *  - Бейдж выбранной колоды
 *  - Кнопку копирования ссылки для приглашения
 *  - Кнопку выхода из комнаты
 *  - Переключатель темы
 *
 * Прикрепляется к верху экрана (sticky).
 *
 * @param roomName — название комнаты
 * @param roomId — ID комнаты
 * @param deckName — название колоды
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/shared/lib/hooks';
import { Button, Switch } from '@/shared/ui';
import { LinkIcon, LogOutIcon, MoonIcon, SunIcon, TrophyIcon } from '@/shared/ui/icons';

interface RoomHeaderProps {
  roomName: string;
  roomId: string;
  deckName: string;
  inviteLink?: string | null;
}

export function RoomHeader({ roomName, roomId, deckName, inviteLink }: RoomHeaderProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink || window.location.href);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      return;
    }
  };

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
