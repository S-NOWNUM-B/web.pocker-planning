import { useState, useEffect, useMemo } from 'react'; // Импорт хуков useState, useEffect и useMemo для управления состоянием и оптимизации вычислений в компоненте
import { Button, Modal } from '@/shared/ui'; // Импорт компонентов Button и Modal из библиотеки UI компонентов
import { cn } from '@/shared/lib'; // Импорт функции cn для условного объединения классов
import { CheckIcon } from '@/shared/ui/icons'; // Импорт иконки CheckIcon для отображения на кнопке подтверждения оценки
import type { RoomSnapshot } from '@/entities/room/model/types'; // Импорт типа RoomSnapshot, который описывает структуру данных снимка комнаты

// Интерфейс для пропсов компонента RoomResults, который описывает все необходимые данные и функции для отображения результатов голосования в комнате
interface RoomResultsProps {
  activeTaskTitle: string | null;
  cards: string[];
  isRevealed: boolean;
  isFinalized: boolean;
  allPlayersVoted: boolean;
  anyPlayerVoted: boolean;
  onReveal: () => void;
  onFinalize: (value: string) => void;
  onNextTask: () => void;
  isOwner: boolean;
  snapshot: RoomSnapshot;
  className?: string;
}

// Вспомогательный интерфейс для статистики голосов, который содержит значение голоса и количество таких голосов
interface VoteStat {
  value: string;
  count: number;
}

// Функция для получения статистики топовых голосов из снимка комнаты и списка карточек, которая возвращает массив объектов с значением голоса и количеством таких голосов, отсортированных по популярности и порядку в колоде
function getTopVoteStats(snapshot: RoomSnapshot, cards: string[]): VoteStat[] {
  const counts = new Map<string, number>(); // Создание карты для подсчёта количества голосов для каждого значения

  for (const vote of snapshot.active_round?.votes ?? []) {
    if (!vote.value) continue;
    counts.set(vote.value, (counts.get(vote.value) ?? 0) + 1);
  }

  const cardOrder = new Map(cards.map((card, index) => [card, index])); // Создание карты для определения порядка карточек в колоде, которая будет использоваться для сортировки голосов с одинаковой популярностью

  return [...counts.entries()]
    .sort((left, right) => {
      const countDiff = right[1] - left[1]; // Сортировка по количеству голосов (от большего к меньшему)
      if (countDiff !== 0) return countDiff; // Если количество голосов отличается, то сортируем по нему

      const leftOrder = cardOrder.get(left[0]) ?? Number.POSITIVE_INFINITY; // Получение порядка карточки для левого голоса, если его нет в колоде, то ставим его в конец
      const rightOrder = cardOrder.get(right[0]) ?? Number.POSITIVE_INFINITY; // Получение порядка карточки для правого голоса, если его нет в колоде, то ставим его в конец
      if (leftOrder !== rightOrder) return leftOrder - rightOrder; // Если порядок карточек отличается, то сортируем по нему (от меньшего к большему)

      return left[0].localeCompare(right[0], 'ru'); // Если количество голосов и порядок карточек одинаковый, то сортируем по значению голоса в алфавитном порядке с учётом русской локали
    })
    .slice(0, 3)
    .map(([value, count]) => ({ value, count })); // Ограничение до 3 топовых голосов и преобразование в массив объектов с полями value и count
}

// Функция для определения стиля карточки голоса в зависимости от её позиции в топе голосов (самый частый, средний или редкий)
function getVoteCardTone(index: number) {
  if (index === 0) {
    return 'border-primary/40 bg-primary/10 text-primary shadow-lg shadow-primary/10';
  }

  if (index === 1) {
    return 'border-border/70 bg-background/70 text-foreground';
  }

  return 'border-border/50 bg-background/40 text-muted-foreground';
}

// Вспомогательная функция для правильного склонения слова "человек" в зависимости от количества голосов
function formatVoteCount(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return 'человек';
  }

  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) {
    return 'человека';
  }

  return 'человек';
}

// Компонент для отображения результатов голосования в комнате, который показывает активную задачу, топовые голоса, итоговую оценку и кнопки для действий владельца комнаты
export function RoomResults({
  activeTaskTitle,
  cards,
  isRevealed,
  isFinalized,
  allPlayersVoted,
  anyPlayerVoted,
  onReveal,
  onFinalize,
  onNextTask,
  isOwner,
  snapshot,
  className,
}: RoomResultsProps) {
  const topVoteStats = useMemo(() => getTopVoteStats(snapshot, cards), [cards, snapshot]); // Вычисление топовых голосов с помощью useMemo для оптимизации, чтобы не пересчитывать их при каждом рендере, а только при изменении колоды или снимка комнаты
  const [finalValue, setFinalValue] = useState(topVoteStats[0]?.value ?? cards[0] ?? ''); // Состояние для хранения итоговой оценки, по умолчанию устанавливается в самое популярное значение голоса или первое значение из колоды, если голосов нет
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Состояние для управления открытием модального окна редактирования итоговой оценки

  const hasActiveTask = Boolean(activeTaskTitle); // Логическое значение, указывающее, есть ли активная задача для оценки

  // Эффект для обновления итоговой оценки при изменении колоды или топовых голосов, чтобы итоговая оценка всегда была актуальной и соответствовала текущим результатам голосования
  useEffect(() => {
    setFinalValue(topVoteStats[0]?.value ?? cards[0] ?? '');
  }, [cards, topVoteStats]);

  return (
    <>
      <section
        className={cn(
          'relative flex flex-col rounded-3xl border border-border/50 bg-card/30 shadow-xl backdrop-blur-sm transition-all duration-500',
          className,
        )}
      >
        <div className="relative z-10 flex h-full min-h-0 flex-col p-4 sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Активная задача
              </div>
              <div className="line-clamp-2 text-lg font-bold leading-tight text-foreground sm:text-2xl">
                {activeTaskTitle ?? 'Добавьте задачу для оценки'}
              </div>
            </div>
            <div className="w-full max-w-15rem shrink-0 rounded-2xl border border-border/50 bg-background/55 p-1.5 shadow-inner backdrop-blur-sm sm:max-w-17rem lg:max-w-72">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  {isRevealed ? 'Топ голосов' : 'Голоса скрыты'}
                </div>
                {isRevealed && (
                  <div className="rounded-full border border-border/60 bg-background/80 px-1.5 py-0.5 text-[8px] font-semibold text-muted-foreground">
                    {topVoteStats.reduce((sum, item) => sum + item.count, 0)} голосов
                  </div>
                )}
              </div>

              {isRevealed ? (
                <div className="grid grid-cols-3 gap-1">
                  {topVoteStats.length > 0 ? (
                    topVoteStats.map((item, index) => (
                      <div
                        key={`${item.value}-${index}`}
                        className={cn(
                          'flex min-h-14 flex-col justify-between rounded-2xl border px-1.5 py-1 text-center backdrop-blur-sm transition-transform hover:-translate-y-0.5',
                          getVoteCardTone(index),
                        )}
                      >
                        <div className="flex items-center justify-between text-[7px] font-semibold uppercase tracking-[0.18em] opacity-70">
                          <span>
                            {index === 0 ? 'Самый частый' : index === 1 ? 'Средний' : 'Редкий'}
                          </span>
                          <span>#{index + 1}</span>
                        </div>
                        <div className="mt-0.5 text-[1.1rem] font-black leading-none sm:text-[1.35rem]">
                          {item.value}
                        </div>
                        <div className="mt-1 flex items-center justify-center gap-1 text-[8px] font-medium opacity-80">
                          <span className="rounded-full bg-current/10 px-1 py-0.5">
                            {item.count}
                          </span>
                          <span>{formatVoteCount(item.count)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 rounded-2xl border border-dashed border-border/60 bg-background/40 px-2 py-2 text-center text-[10px] text-muted-foreground">
                      Пока нет голосов для подсчёта
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/35 px-2 py-2 text-center text-[10px] text-muted-foreground">
                  После вскрытия покажем 3 самых популярных значения
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center py-2 sm:py-3">
            {isRevealed ? (
              <div className="flex w-full max-w-xs flex-col items-center gap-2 text-center">
                <div className="relative group shrink-0">
                  <div className="absolute -inset-8 rounded-full bg-primary/30 blur-3xl animate-pulse-glow" />
                  <div
                    className={cn(
                      'relative flex flex-col items-center justify-center rounded-full border-4 border-primary bg-card p-3 shadow-2xl w-24 h-24 sm:w-32 sm:h-32 transition-all',
                      'animate-reveal-pop',
                      isOwner &&
                        !isFinalized &&
                        'cursor-pointer hover:scale-105 hover:border-primary/80 active:scale-95',
                    )}
                    onClick={() => {
                      if (isOwner && !isFinalized) {
                        setIsEditModalOpen(true);
                      }
                    }}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                      Итог
                    </div>
                    <div className="text-4xl font-black text-foreground sm:text-5xl">
                      {finalValue}
                    </div>
                    <div className="text-[9px] font-medium text-muted-foreground mt-1">
                      Story Points
                    </div>
                    {!isFinalized && isOwner && (
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg animate-bounce">
                        <CheckIcon className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </div>
                </div>

                {isFinalized ? (
                  <Button
                    type="button"
                    onClick={onNextTask}
                    className="h-10 rounded-full px-8 text-sm font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                  >
                    Следующая задача
                  </Button>
                ) : isOwner ? (
                  <Button
                    type="button"
                    onClick={() => onFinalize(finalValue)}
                    className="h-10 rounded-full px-8 text-sm font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 bg-primary text-primary-foreground"
                  >
                    Подтвердить оценку
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="max-w-sm text-sm font-medium text-muted-foreground leading-relaxed">
                  {allPlayersVoted
                    ? isOwner
                      ? 'Все участники проголосовали. Можно показывать результат.'
                      : 'Все участники проголосовали. Ожидайте вскрытия карт.'
                    : anyPlayerVoted
                      ? isOwner
                        ? 'Часть голосов уже есть. Можно вскрыть сейчас или подождать остальных.'
                        : 'Идут голосования. Ожидайте вскрытия карт.'
                      : hasActiveTask
                        ? 'Пока нет голосов. Выберите карту, чтобы начать раунд.'
                        : 'Пока нет активной задачи. Добавьте задачу и начните раунд.'}
                </div>
                {isOwner ? (
                  <Button
                    type="button"
                    onClick={onReveal}
                    disabled={!hasActiveTask || (!allPlayersVoted && !anyPlayerVoted)}
                    className="h-12 rounded-full px-10 text-sm font-bold shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    Вскрыть карты
                  </Button>
                ) : (
                  <div className="text-xs font-medium text-muted-foreground/60 italic">
                    Только владелец может вскрыть карты
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      <EditResultModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={(value) => {
          setFinalValue(value);
          setIsEditModalOpen(false);
        }}
        cards={cards}
        currentValue={finalValue}
      />
    </>
  );
}

// Компонент для отображения модального окна редактирования итоговой оценки, который позволяет владельцу комнаты выбрать другое значение из колоды для финальной оценки задачи
function EditResultModal({
  isOpen,
  onClose,
  onConfirm,
  cards,
  currentValue,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  cards: string[];
  currentValue: string;
}) {
  const [selected, setSelected] = useState(currentValue); // Состояние для хранения выбранного значения в модальном окне, по умолчанию устанавливается в текущее итоговое значение

  // Эффект для обновления выбранного значения при изменении текущего итогового значения, чтобы при открытии модального окна всегда отображалось актуальное значение
  useEffect(() => {
    setSelected(currentValue);
  }, [currentValue]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редактировать итоговую оценку"
      className="max-w-md"
    >
      <div className="flex flex-col gap-6">
        <div className="text-sm text-muted-foreground text-center mb-2">
          Выберите подходящее значение из колоды для финальной оценки задачи
        </div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {cards.map((card) => (
            <button
              key={card}
              onClick={() => setSelected(card)}
              className={cn(
                'h-12 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-sm',
                selected === card
                  ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                  : 'border-border/50 bg-card text-foreground hover:border-primary/50 hover:bg-primary/5',
              )}
            >
              {card}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="rounded-full px-6">
            Отмена
          </Button>
          <Button
            onClick={() => onConfirm(selected)}
            className="rounded-full px-6 bg-primary text-primary-foreground"
          >
            Подтвердить
          </Button>
        </div>
      </div>
    </Modal>
  );
}
