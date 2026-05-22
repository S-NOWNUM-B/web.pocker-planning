import { Button, Card, PageShell } from '@/shared/ui'; // Импортируем компоненты Button, Card и PageShell из общей библиотеки пользовательского интерфейса для использования в структуре и оформлении страницы "О нас".

export function AboutPage() {
  const sectionContainerClass = 'mx-auto w-full max-w-7xl';

  return (
    <PageShell maxWidth="full" className="min-h-[calc(100vh-8.5rem)]">
      <section className="flex flex-col items-center py-16 text-center lg:py-20">
        <h1 className="max-w-4xl font-display text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
          Почему существует{' '}
          <span className="inline-block whitespace-nowrap bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            Pocker Planning
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Большинство команд теряют время не на разработку, а на споры об оценках. Здесь объясняем,
          почему — и как это починить
        </p>
      </section>

      <section className="py-20 sm:py-24">
        <div className={sectionContainerClass}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Проблема, которую проект решает
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              В классическом планировании команды часто теряют время и точность оценок из-за
              социальных и процессных перекосов — от эффекта якоря до неравного участия и потери
              контекста
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Эффект якоря',
                text: 'Когда первым высказывается самый уверенный участник, остальные бессознательно смещают оценку к его мнению. Это искажает результат и скрывает реальное понимание задачи',
              },
              {
                title: 'Дискуссии без рамки',
                text: 'Команда тратит много времени на спор о числе, вместо обсуждения рисков, неопределённости и объёма работы. Это приводит к затяжным встречам и усталости от планирования',
              },
              {
                title: 'Невидимые расхождения',
                text: 'Если оценки не собираются структурированно, сложно понять, где участники видят разные риски и зависимости. Это мешает синхронизации и выявлению проблем на ранней стади',
              },
              {
                title: 'Потеря контекста',
                text: 'После встречи исчезает связь между обсуждением и итогом, из-за чего сложно улучшать процесс от спринта к спринту. Команды не могут учиться на своих ошибках и повторять успехи',
              },
              {
                title: 'Неравное участие',
                text: 'В офлайн и распределённых командах часть людей молчит, и итоговая оценка не отражает общее понимание задачи. Это снижает вовлечённость и ответственность за результат',
              },
              {
                title: 'Сложно повторить успех',
                text: 'Без прозрачного ритуала оценки невозможно стабильно проводить планирование одинаково качественно от команды к команде. Успех зависит от наличия опытного фасилитатора и удачного стечения обстоятельств',
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="h-full border border-border/70 bg-card/88 p-6 shadow-lg backdrop-blur"
              >
                <h3 className="text-lg font-semibold leading-7 text-foreground">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-muted-foreground">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className={`${sectionContainerClass} grid grid-cols-1 gap-6 lg:grid-cols-3`}>
          <Card className="lg:col-span-2 border border-border/70 bg-card/90 p-6 shadow-lg backdrop-blur">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Принципы хорошей оценки
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              В Pocker Planning оценка рассматривается как способ синхронизировать понимание задачи,
              а не как формальное голосование ради числа. Поэтому мы придерживаемся следующих
              принципов:
            </p>
            
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                'Сначала независимая оценка, потом обсуждение расхождений',
                'Расхождение оценок это сигнал неопределённости, а не ошибка команды',
                'Цель раунда: общее понимание объёма и рисков, а не идеальная точность числа',
                'Каждый участник должен иметь равный голос в финальном результате (даже если он не самый громкий в комнате)',
                'Результат должен быть виден всем сразу, чтобы стимулировать обсуждение и обучение',
                'Ритуал оценки должен быть простым и воспроизводимым',
              ].map((principle) => (
                <div
                  key={principle}
                  className="rounded-xl border border-border/70 bg-secondary/25 px-4 py-3 text-sm text-muted-foreground"
                >
                  {principle}
                </div>
              ))}
            </div>
          </Card>

          <Card className="border border-border/70 bg-card/88 p-6 shadow-lg backdrop-blur">
            <h3 className="text-lg font-semibold leading-7 text-foreground">
              Для кого это полезно
            </h3>
            <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Product Manager:</span> быстрее
                фиксирует scope и зоны риска за счёт структурированного раунда оценки
              </p>
              <p>
                <span className="font-semibold text-foreground">Tech Lead:</span> видит разброс
                оценок и причины расхождений для более точного планирования и управления рисками
              </p>
              <p>
                <span className="font-semibold text-foreground">Developer:</span> участвует в оценке
                на равных и влияет на общий результат без доминирования более опытных коллег
              </p>
              <p>
                <span className="font-semibold text-foreground">Scrum Master:</span> ведёт ритуал
                предсказуемо и прозрачно для всей команды без зависимости от личного опыта и харизмы
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section className="relative isolate overflow-hidden py-20 sm:py-24">
        <div className={sectionContainerClass}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Сценарий до и после
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Как меняется планирование, когда у команды есть единый ритуал оценки и инструмент для
              его проведения
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                step: 'До',
                title: 'Непрозрачная оценка',
                text: '40 минут обсуждения, говорит в основном 1-2 человека, итоговая цифра принимается без явного понимания рисков и объёма работы',
              },
              {
                step: 'После',
                title: 'Структурированный раунд',
                text: '15-20 минут, голосуют все участники, расхождения видны сразу, команда фиксирует итог и причины принятой оценки для последующего анализа',
              },
            ].map((item) => (
              <Card
                key={item.step}
                className="border border-border/70 bg-card/88 p-6 shadow-lg backdrop-blur"
              >
                <time className="flex items-center text-sm font-semibold leading-6 text-primary">
                  <svg
                    viewBox="0 0 4 4"
                    className="mr-3 h-1 w-1 flex-none fill-primary"
                    aria-hidden="true"
                  >
                    <circle cx={2} cy={2} r={2} />
                  </svg>
                  {item.step}
                </time>
                <p className="mt-4 text-lg font-semibold leading-8 tracking-tight text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-base leading-7 text-muted-foreground">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className={`${sectionContainerClass} grid grid-cols-1 gap-6 lg:grid-cols-3`}>
          <Card className="lg:col-span-2 border border-border/70 bg-card/90 p-6 shadow-lg backdrop-blur">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Open source сегодня и что дальше
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Проект уже работает для командных сессий и параллельно готовится к production. В
              открытой разработке публично дорабатывается устойчивость, UX и операционные сценарии.
              Планируется релиз в ближайшие месяцы, а пока приглашаем всех заинтересованных
              личностей присоединиться к обсуждению и тестированию в репозитории
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  phase: 'Стабильно',
                  text: 'Базовые потоки комнат, голосования и раскрытия результатов в реальном времени работают стабильно и используются в нескольких командах для ежедневного планирования',
                },
                {
                  phase: 'В работе',
                  text: 'Наблюдаемость, обработка edge-cases, полировка UX для длительных сессий и оптимизация производительности при большом количестве участников',
                },
                {
                  phase: 'Перед релизом',
                  text: 'Финальная документация и эксплуатационные практики для production релиза, а также открытие доступа к публичному API для интеграции с другими инструментами',
                },
              ].map((item) => (
                <div
                  key={item.phase}
                  className="rounded-xl border border-border/70 bg-secondary/20 px-4 py-4"
                >
                  <p className="text-sm font-semibold text-foreground">{item.phase}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                as="a"
                href="https://github.com/S-NOWNUM-B/-Pocker-Planning-"
                target="_blank"
                rel="noreferrer"
              >
                Перейти в репозиторий
              </Button>
            </div>
          </Card>

          <Card className="border border-border/70 bg-card/88 p-6 shadow-lg backdrop-blur">
            <h3 className="text-lg font-semibold leading-7 text-foreground">FAQ</h3>
            <div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">Чем это лучше обычного созвона?</p>
                <p>Структура раунда делает оценку воспроизводимой и снижает эффект доминирования</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Подходит для распределённой команды?
                </p>
                <p>
                  Да, синхронизация в реальном времени сохраняет общий темп даже при удалённой
                  работе
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Можно адаптировать под свой процесс?
                </p>
                <p>
                  Да, вы можете менять ритуал оценки и наборы карт под внутренние практики команды
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Как начать использовать?</p>
                <p>
                  Просто создайте комнату, пригласите команду и начните планирование с первого
                  раунда оценки
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
