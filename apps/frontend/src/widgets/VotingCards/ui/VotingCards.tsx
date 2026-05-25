import { Button } from '@/shared/ui'; // Импорт компонента Button из общей библиотеки пользовательского интерфейса для использования в карточках голосования
import { cn } from '@/shared/lib'; // Импорт функции cn для удобного объединения классов CSS в зависимости от условий, используемой для стилизации карточек голосования
import { CheckIcon, CoffeeIcon, HelpCircleIcon, TrophyIcon } from '@/shared/ui/icons'; // Импорт иконок из библиотеки иконок для отображения в карточках голосования и заголовке

// Интерфейс для пропсов компонента VotingCards, который описывает ожидаемые свойства, такие как массив карт для голосования, выбранная карта, флаг отключения и функция для обработки выбора карты
interface VotingCardsProps {
  cards: string[];
  selectedCard: string | null;
  disabled?: boolean;
  onSelectCard: (card: string) => void;
}

// Компонент для отображения карточек голосования, который позволяет игрокам выбирать карту для голосования, отображает выбранную карту и может быть отключён в зависимости от состояния комнаты
export function VotingCards({
  cards,
  selectedCard,
  disabled = false,
  onSelectCard,
}: VotingCardsProps) {
  return (
    <div className="flex flex-col w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          <TrophyIcon className="h-3 w-3 text-primary" />
          Карты голосования
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/60">
          <CheckIcon
            className={cn(
              'h-3 w-3 transition-colors',
              selectedCard ? 'text-primary' : 'text-muted-foreground/40',
            )}
          />
          {selectedCard ? `Выбрано: ${selectedCard}` : 'Карта не выбрана'}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(2.8rem,1fr))] gap-2 justify-items-center sm:grid-cols-[repeat(auto-fit,minmax(3rem,1fr))] sm:gap-3">
        {cards.map((card) => {
          const isSelected = selectedCard === card;
          return (
            <Button
              key={card}
              type="button"
              disabled={disabled}
              onClick={() => onSelectCard(card)}
              variant="ghost"
              className={cn(
                'flex h-12 w-10 rounded-xl border text-sm font-black transition-all duration-200 sm:h-14 sm:w-12 sm:text-base',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105 ring-2 ring-primary/20'
                  : 'border-border/50 bg-card/50 text-foreground hover:border-primary/30 hover:bg-card hover:-translate-y-0.5',
                'disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:scale-100',
              )}
            >
              {card === '☕' || card === 'break' ? (
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full',
                    isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary',
                  )}
                >
                  <CoffeeIcon className="h-4 w-4" strokeWidth={2.8} />
                </span>
              ) : card === '?' ? (
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full',
                    isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary',
                  )}
                >
                  <HelpCircleIcon className="h-4 w-4" strokeWidth={2.8} />
                </span>
              ) : (
                card
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
