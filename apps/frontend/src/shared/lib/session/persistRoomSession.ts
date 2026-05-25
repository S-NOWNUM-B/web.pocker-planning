import type { RoomSnapshot } from '@/entities/room/model/types'; // Импортируем тип RoomSnapshot из модели комнаты, который описывает структуру данных, получаемых при загрузке комнаты, включая информацию о комнате, участниках, задачах и активных раундах.
import { SESSION_STORAGE_KEY, type GameSession } from '@/shared/lib/poker'; // Импортируем константу SESSION_STORAGE_KEY, которая используется в качестве ключа для хранения данных сессии в localStorage, и тип GameSession, который описывает структуру данных сессии игры, включая информацию о комнате, пользователе и колоде карт.

// Интерфейс PersistRoomSessionParams описывает параметры, необходимые для сохранения сессии комнаты. Он включает в себя снимок комнаты (snapshot), имя пользователя из аутентификации (authUserName), локальное имя пользователя (localUserName) и токен доступа к комнате (roomAccessToken). Эти данные используются для создания объекта сессии, который затем сохраняется в localStorage для последующего восстановления при повторном посещении комнаты.
interface PersistRoomSessionParams {
  snapshot: RoomSnapshot;
  authUserName?: string;
  localUserName?: string;
  roomAccessToken?: string;
}

// persistRoomSession — это функция, которая сохраняет данные сессии комнаты в localStorage. Она принимает объект с параметрами, извлекает необходимую информацию из снимка комнаты и формирует объект GameSession, который затем сериализуется в JSON и сохраняется в localStorage под ключом SESSION_STORAGE_KEY. Это позволяет сохранять состояние пользователя и комнаты между сессиями браузера, обеспечивая более плавный пользовательский опыт при повторном посещении комнаты.
export function persistRoomSession({
  snapshot,
  authUserName,
  localUserName,
  roomAccessToken,
}: PersistRoomSessionParams): void {
  const selfParticipant = snapshot.self_participant_id
    ? snapshot.participants.find((participant) => participant.id === snapshot.self_participant_id)
    : null;
  const userName = authUserName || selfParticipant?.name || localUserName || 'Гость';
  const isOwner = selfParticipant?.role === 'owner';

  const session: GameSession = {
    roomId: snapshot.room.slug,
    roomName: snapshot.room.name,
    userName,
    ownerId: snapshot.room.owner_id,
    ownerName: isOwner ? userName : 'Владелец комнаты',
    deckType: snapshot.room.deck.code === 'even' ? 'even' : 'fibonacci',
    roomAccessToken,
    selfParticipantId: snapshot.self_participant_id,
  };

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}
