import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'; // Импортируем компоненты для создания выпадающего меню из библиотеки headlessui
import { Link, useMatch } from 'react-router-dom'; // Импортируем необходимые компоненты и хуки из react-router-dom
import { useTheme } from '@/shared/lib/hooks'; // Импортируем хук для управления темой из общего набора хуков
import { Switch } from '@/shared/ui'; // Импортируем компонент Switch для переключения темы из общего набора UI-компонентов
import { LogOutIcon, MoonIcon, SunIcon, TrophyIcon, UsersIcon } from '@/shared/ui/icons'; // Импортируем необходимые иконки из общего набора UI-иконок
import { baseButtonClasses, sizeClasses, variantClasses } from '@/shared/ui/Button/Button'; // Импортируем классы для кнопок из компонента Button для использования в стилях кнопок в Header

// Интерфейс для пропсов компонента Header, который описывает типы для отображения кнопок авторизации, меню профиля и функции выхода из аккаунта
interface HeaderProps {
  showAuthButtons?: boolean;
  showLoginButton?: boolean;
  showRegisterButton?: boolean;
  showProfileMenu?: boolean;
  profileLabel?: string;
  onLogout?: () => void;
}

// Компонент Header, который отображает верхнюю панель с логотипом, кнопками авторизации, переключателем темы и меню профиля. Компонент адаптируется в зависимости от текущего маршрута и пропсов, скрываясь на странице комнаты и отображая соответствующие элементы управления в зависимости от переданных пропсов
export function Header({
  showAuthButtons = false,
  showLoginButton,
  showRegisterButton,
  showProfileMenu = false,
  profileLabel = 'Профиль',
  onLogout,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const isRoomPage = useMatch('/room/:roomId') !== null;
  const shouldShowLoginButton = showLoginButton ?? showAuthButtons;
  const shouldShowRegisterButton = showRegisterButton ?? showAuthButtons;
  const showAuthControls = shouldShowLoginButton || shouldShowRegisterButton;

  if (isRoomPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-card/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Логотип */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <TrophyIcon className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground">
            Poker<span className="text-primary">.</span>Planning
          </span>
        </Link>

        {/* Кнопки управления и авторизации */}
        <div className="flex items-center gap-2">
          {showAuthControls && (
            <div className="hidden items-center gap-2 sm:flex">
              {shouldShowLoginButton && (
                <Link
                  to="/login"
                  className={`${baseButtonClasses} h-10 px-4 ${variantClasses.outline} ${sizeClasses.md}`}
                >
                  Войти
                </Link>
              )}
              {shouldShowRegisterButton && (
                <Link
                  to="/register"
                  className={`${baseButtonClasses} h-10 px-4 ${variantClasses.primary} ${sizeClasses.md}`}
                >
                  Регистрация
                </Link>
              )}
            </div>
          )}

          <div className="flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card/70 px-2">
            {theme === 'dark' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
            <Switch
              checked={theme === 'dark'}
              onChange={(isDark) => setTheme(isDark ? 'dark' : 'light')}
              label="Переключить тему"
            />
            <span className="hidden text-left text-xs sm:inline sm:whitespace-nowrap">
              {theme === 'dark' ? 'Темная' : 'Светлая'}
            </span>
          </div>

          {showProfileMenu && (
            <Menu as="div" className="relative hidden sm:block">
              <MenuButton
                className={`${baseButtonClasses} h-10 max-w-220px truncate px-4 ${variantClasses.outline} ${sizeClasses.md}`}
              >
                {profileLabel}
              </MenuButton>

              <MenuItems
                anchor="bottom end"
                className="z-50 mt-2 w-56 origin-top-right rounded-xl border border-border/70 bg-card p-1.5 shadow-xl focus:outline-none"
              >
                <MenuItem>
                  <Link
                    to="/dashboard"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors data-focus:bg-secondary/80"
                  >
                    <UsersIcon className="h-4 w-4" />
                    <span>Мои комнаты</span>
                  </Link>
                </MenuItem>

                <MenuItem>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive transition-colors data-focus:bg-destructive/10"
                  >
                    <LogOutIcon className="h-4 w-4" />
                    <span>Выйти из аккаунта</span>
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          )}
        </div>
      </div>
    </header>
  );
}
