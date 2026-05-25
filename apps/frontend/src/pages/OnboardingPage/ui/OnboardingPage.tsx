import { Link } from 'react-router-dom'; // Импортируем Link для навигации между страницами
import { Button, Card, PageShell } from '@/shared/ui'; // Импортируем UI-компоненты для отображения страницы, карточки и оболочки страницы

// Компонент OnboardingPage отображает главную страницу приложения с информацией о его функциональности и преимуществах. Он содержит несколько секций, включая Hero Section с заголовком и описанием, Features Grid с перечислением основных функций приложения и Steps Section с пошаговым руководством по использованию. Этот компонент используется для привлечения новых пользователей и предоставления им информации о том, как приложение может помочь в планировании задач.
const featureIcons = {
  'Совместная оценка': (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 12a5 5 0 1 0 10 0a5 5 0 1 0-10 0" />
      <path d="M4 20c1.7-2.8 4.1-4 8-4s6.3 1.2 8 4" />
    </svg>
  ),
  'В реальном времени': (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M4.9 4.9l2.8 2.8" />
      <path d="M16.3 16.3l2.8 2.8" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="M4.9 19.1l2.8-2.8" />
      <path d="M16.3 7.7l2.8-2.8" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  ),
  'Гибкие колоды': (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="6" width="10" height="14" rx="2" />
      <path d="M9 4h8a2 2 0 0 1 2 2v12" />
      <path d="M8 10h4" />
      <path d="M8 14h6" />
    </svg>
  ),
  'История сессий': (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 8v5l3 2" />
      <path d="M12 3a9 9 0 1 0 9 9" />
      <path d="M21 3v6h-6" />
    </svg>
  ),
};

// Компонент OnboardingPage отображает главную страницу приложения с информацией о его функциональности и преимуществах. Он содержит несколько секций, включая Hero Section с заголовком и описанием, Features Grid с перечислением основных функций приложения и Steps Section с пошаговым руководством по использованию. Этот компонент используется для привлечения новых пользователей и предоставления им информации о том, как приложение может помочь в планировании задач.
export function OnboardingPage() {
  return (
    <PageShell maxWidth="full" className="min-h-[calc(100vh-8.5rem)]">
      {/* Hero Section */}
      <section className="flex flex-col items-center py-16 text-center lg:py-20">
        <h1 className="max-w-4xl font-display text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
          Poker Planning для{' '}
          <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            эффективных команд
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Инструмент для честной и быстрой оценки задач. Устраните предвзятость, вовлеките каждого
          участника и сделайте планирование прозрачным
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button as={Link} to="/create-room" size="lg">
            Создать комнату
          </Button>
          <Button variant="ghost" size="lg" as={Link} to="/about">
            Узнать больше →
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Всё необходимое для оценки
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Мы собрали лучшие практики Agile в одном простом и быстром интерфейсе
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {[
              {
                name: 'Совместная оценка',
                description:
                  'Вся команда оценивает задачи одновременно, что устраняет эффект «якорного» мнения',
              },
              {
                name: 'В реальном времени',
                description:
                  'WebSocket-соединение обеспечивает мгновенную синхронизацию голосов между участниками',
              },
              {
                name: 'Гибкие колоды',
                description:
                  'Поддержка Фибоначчи, T-shirt размеров и пользовательских колод под ваши нужды',
              },
              {
                name: 'История сессий',
                description:
                  'Все результаты сохраняются и доступны для ретроспективы и анализа в любое время',
              },
            ].map((feature) => (
              <Card
                key={feature.name}
                className="flex flex-col border border-border/70 bg-card/88 p-5 shadow-lg backdrop-blur"
              >
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
                    {featureIcons[feature.name as keyof typeof featureIcons]}
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </Card>
            ))}
          </dl>
        </div>
      </section>

      {/* Steps Section */}
      <section className="relative isolate overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Как это работает
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Три простых шага к более точным оценкам в вашей команде
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 overflow-hidden lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Создайте комнату',
                description: 'Выберите колоду и поделитесь ссылкой с вашей командой',
              },
              {
                step: '2',
                title: 'Голосуйте вместе',
                description: 'Обсуждайте задачи и выбирайте карты в реальном времени.',
              },
              {
                step: '3',
                title: 'Анализируйте',
                description: 'Открывайте карты, обсуждайте расхождения и фиксируйте итог.',
              },
            ].map((item) => (
              <div key={item.step}>
                <time
                  dateTime="2024-01-01"
                  className="flex items-center text-sm font-semibold leading-6 text-primary"
                >
                  <svg
                    viewBox="0 0 4 4"
                    className="mr-4 h-1 w-1 flex-none fill-primary"
                    aria-hidden="true"
                  >
                    <circle cx={2} cy={2} r={2} />
                  </svg>
                  Шаг {item.step}
                  <div
                    className="absolute -ml-2 h-px w-screen bg-border/40 sm:-ml-4 lg:static lg:-mr-6 lg:ml-8 lg:w-auto lg:flex-auto lg:grow"
                    aria-hidden="true"
                  />
                </time>
                <p className="mt-6 text-lg font-semibold leading-8 tracking-tight text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-base leading-7 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
