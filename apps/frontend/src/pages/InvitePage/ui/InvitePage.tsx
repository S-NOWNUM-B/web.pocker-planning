import { useEffect } from 'react'; // Импортируем useEffect для выполнения побочных эффектов при загрузке компонента
import { useMutation } from '@tanstack/react-query'; // Импортируем useMutation для выполнения мутации при попытке присоединиться к комнате по приглашению
import { useNavigate, useParams } from 'react-router-dom'; // Импортируем useNavigate для навигации между страницами и useParams для получения параметров из URL
import { roomApi } from '@/entities/room'; // Импортируем API для работы с комнатами, включая функцию для присоединения к комнате по приглашению
import { loginAsGuest } from '@/entities/user'; // Импортируем функцию для входа в систему как гость, если пользователь не авторизован
import { PageShell, Spinner } from '@/shared/ui'; // Импортируем UI-компоненты для отображения страницы и индикатора загрузки
import { SESSION_STORAGE_KEY, type DeckType, type GameSession } from '@/shared/lib/poker'; // Импортируем константу для хранения данных сессии в localStorage и типы для описания структуры данных сессии и типа колоды карт
import { useSession } from '@/app/providers'; // Импортируем хук для получения информации о текущей сессии пользователя

// Функция normalizeDeckType используется для нормализации типа колоды карт, возвращаемого с сервера, в один из ожидаемых типов в приложении (либо 'even', либо 'fibonacci').
function normalizeDeckType(code: string | undefined): DeckType {
  return code === 'even' ? 'even' : 'fibonacci';
}

// Компонент InvitePage отвечает за обработку приглашений в комнаты. Он получает токен приглашения из URL, пытается присоединиться к комнате, используя этот токен, и при успешном присоединении сохраняет информацию о сессии в localStorage и перенаправляет пользователя в комнату. Если токен недействителен или возникает ошибка при присоединении, пользователь перенаправляется на страницу присоединения к комнате.
export function InvitePage() {
  const navigate = useNavigate(); // Получаем функцию navigate для навигации между страницами
  const { token } = useParams<{ token: string }>(); // Получаем токен приглашения из параметров URL
  const { user } = useSession(); // Получаем информацию о текущем пользователе из сессии

  // Функция getSession пытается получить данные текущей игровой сессии из localStorage. Если данных нет или они не могут быть распарсены, возвращается null.
  const getSession = (): GameSession | null => {
    const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as GameSession;
    } catch {
      return null;
    }
  };

  // Функция ensureRoomAccessToken проверяет, есть ли у текущего пользователя действующий токен доступа к комнате. Если пользователь авторизован, возвращается пустой объект. Если пользователь не авторизован, функция проверяет наличие существующей сессии с токеном доступа к комнате. Если такой токен найден, он возвращается вместе с именем гостя. Если токена нет, выполняется вход в систему как гость, и возвращается новый токен доступа к комнате и имя гостя.
  const ensureRoomAccessToken = async (): Promise<{ token?: string; guestName?: string }> => {
    if (user) {
      return {};
    }

    const existingSession = getSession();
    if (existingSession?.roomAccessToken) {
      return { token: existingSession.roomAccessToken, guestName: existingSession.userName };
    }

    const guestAuth = await loginAsGuest({ name: 'Гость' });
    return { token: guestAuth.access_token, guestName: guestAuth.user.name };
  };

  // Используем useMutation для выполнения мутации при попытке присоединиться к комнате по приглашению. В функции mutationFn выполняется запрос на сервер для присоединения к комнате с использованием токена приглашения и токена доступа к комнате. При успешном выполнении мутации сохраняются данные сессии в localStorage, и пользователь перенаправляется в комнату. Если возникает ошибка, пользователь перенаправляется на страницу присоединения к комнате.
  const joinMutation = useMutation({
    mutationFn: async (invitationToken: string) => {
      const roomAccess = await ensureRoomAccessToken();
      const snapshot = await roomApi.joinRoomByInvitation(invitationToken, roomAccess.token);
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

      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      navigate(`/room/${snapshot.room.slug}`, { replace: true });
    },
    onError: () => {
      navigate('/join-room', { replace: true });
    },
  });

  // Используем useEffect для выполнения попытки присоединиться к комнате при загрузке компонента. Если токен приглашения отсутствует, пользователь перенаправляется на страницу присоединения к комнате. Если токен присутствует, выполняется мутация для присоединения к комнате.
  useEffect(() => {
    if (!token) {
      navigate('/join-room', { replace: true });
      return;
    }

    joinMutation.mutate(token);
  }, [joinMutation, navigate, token]);

  return (
    <PageShell className="min-h-[calc(100vh-8.5rem)]">
      <div className="flex min-h-[calc(100vh-8.5rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">Подключаем к комнате по приглашению...</p>
        </div>
      </div>
    </PageShell>
  );
}
