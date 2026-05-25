import { VotingCards } from '@/widgets/VotingCards'; // Импорт компонента для отображения карточек голосования
import { Button } from '@/shared/ui'; // Импорт компонента Button из библиотеки UI компонентов
import { CheckIcon } from '@/shared/ui/icons'; // Импорт иконки CheckIcon для отображения на кнопке подтверждения голоса

// Интерфейс для пропсов компонента RoomFooter
interface RoomFooterProps {
  cards: string[];
  selectedCard: string | null;
  disabled?: boolean;
  isVoting?: boolean;
  onSelectCard: (card: string) => void;
  onConfirmVote?: () => void;
}

// Компонент для отображения нижней части комнаты, где игроки могут выбирать карточки и подтверждать свой голос
export function RoomFooter({
  cards,
  selectedCard,
  disabled = false,
  isVoting = false,
  onSelectCard,
  onConfirmVote,
}: RoomFooterProps) {
  return (
    <footer className="mt-auto relative z-20">
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-3 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/50 bg-card/40 p-3 shadow-[0_-12px_38px_-26px_rgba(0,0,0,0.3)] backdrop-blur-sm sm:p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <VotingCards
                cards={cards}
                selectedCard={selectedCard}
                disabled={disabled}
                onSelectCard={onSelectCard}
              />
            </div>

            {onConfirmVote && (
              <Button
                onClick={onConfirmVote}
                disabled={!selectedCard || disabled || isVoting}
                className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap"
              >
                {isVoting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Отправка...
                  </span>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5" />
                    Готов
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
