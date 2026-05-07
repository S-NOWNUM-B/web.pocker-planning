/**
 * Подвал сайта.
 *
 * Отображается на всех страницах, кроме /room/:roomId.
 */
import { Link, useMatch } from 'react-router-dom';

export function Footer() {
  const isRoomPage = useMatch('/room/:roomId') !== null;

  if (isRoomPage) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-card/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {currentYear} Pocker Planning</p>
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:text-foreground">
            О проекте
          </Link>
          <a
            href="https://github.com/S-NOWNUM-B/web.pocker-planning.git"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
