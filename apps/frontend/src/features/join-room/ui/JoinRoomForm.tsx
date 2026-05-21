import { useState } from 'react'; // Импортируем useState для управления состоянием формы
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Импортируем useMutation для выполнения мутации и useQueryClient для управления кэшом
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate для навигации после успешного входа в комнату
import { useSession } from '@/app/providers'; // Импортируем useSession для получения информации о текущем пользователе
import { loginAsGuest } from '@/entities/user'; // Импортируем функцию для входа в систему как гость
import { roomApi } from '@/entities/room'; // Импортируем API для работы с комнатами
import { Input, Button } from '@/shared/ui'; // Импортируем компоненты Input и Button для создания формы
import { SESSION_STORAGE_KEY, type DeckType, type GameSession } from '@/shared/lib/poker'; // Импортируем константу для ключа хранения сессии и типы данных для игры в покер

// Функция для нормализации типа колоды, возвращает 'even' или 'fibonacci' в зависимости от входного кода
function normalizeDeckType(code: string | undefined): DeckType {
  return code === 'even' ? 'even' : 'fibonacci';
}

// Компонент формы для входа в комнату по коду
export function JoinRoomForm() {
  const [roomId, setRoomId] = useState('');
  const { user } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Функция для получения текущей игровой сессии из localStorage
  const getSession = (): GameSession | null => {
    const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY); // Получаем строку сессии из localStorage
    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as GameSession; // Парсим строку в объект GameSession
    } catch {
      return null;
    }
  };

  // Функция для обеспечения наличия токена доступа к комнате, если пользователь не авторизован
  const ensureRoomAccessToken = async (): Promise<{ token?: string; guestName?: string }> => {
    if (user) {
      return {};
    }

    // Если пользователь не авторизован, проверяем наличие существующей сессии гостя
    const existingSession = getSession();
    if (existingSession?.roomAccessToken) {
      return { token: existingSession.roomAccessToken, guestName: existingSession.userName };
    }

    // Если сессии нет, выполняем вход как гость и получаем токен доступа к комнате
    const guestAuth = await loginAsGuest({ name: 'Гость' });
    return { token: guestAuth.access_token, guestName: guestAuth.user.name };
  };

  // Используем useMutation для выполнения мутации при попытке войти в комнату по коду
  const joinMutation = useMutation({
    mutationFn: async (code: string) => {
      const roomAccess = await ensureRoomAccessToken();
      const snapshot = await roomApi.joinRoomByCode(code, roomAccess.token);
      return { snapshot, roomAccessToken: roomAccess.token, guestName: roomAccess.guestName };
    },
    onSuccess: ({ snapshot, roomAccessToken, guestName }) => {
      const session: GameSession = {
        roomId: snapshot.room.slug,
        roomName: snapshot.room.name,
        userName: user?.name?.trim() || guestName || 'Гость',
        ownerId: snapshot.room.owner_id,
        ownerName: 'Владелец комнаты',
        deckType: normalizeDeckType(snapshot.room.deck?.code),
        roomAccessToken,
        selfParticipantId: snapshot.self_participant_id,
      };

      // Сохраняем сессию в localStorage и обновляем кэш с комнатами, затем навигируем пользователя в комнату
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      navigate(`/room/${snapshot.room.slug}`);
    },
  });

  // Обработчик отправки формы, который предотвращает стандартное поведение и выполняет мутацию для входа в комнату
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || joinMutation.isPending) {
      return;
    }

    joinMutation.mutate(roomId.trim().toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Код комнаты"
        placeholder="Например, ABCD"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value.toUpperCase())}
        maxLength={4}
        disabled={joinMutation.isPending}
      />
      <Button type="submit" disabled={!roomId.trim() || joinMutation.isPending}>
        {joinMutation.isPending ? 'Входим...' : 'Войти в комнату'}
      </Button>
      {joinMutation.isError && (
        <p className="text-sm text-destructive">Комната с таким кодом не найдена или недоступна.</p>
      )}
    </form>
  );
}
