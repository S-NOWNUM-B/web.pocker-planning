import { roomApi } from '@/entities/room'; // Импортируем API для работы с комнатами из сущности room, который предоставляет методы для получения снимка комнаты и присоединения к комнате по коду. Этот API используется в функции loadRoomSnapshotWithToken для загрузки данных комнаты на основе ее идентификатора или кода доступа.
import type { RoomSnapshot } from '@/entities/room/model/types'; // Импортируем тип RoomSnapshot из модели комнаты, который описывает структуру данных, получаемых при загрузке комнаты, включая информацию о комнате, участниках, задачах и активных раундах. Этот тип используется для типизации данных, возвращаемых функцией loadRoomSnapshotWithToken, которая загружает снимок комнаты на основе ее идентификатора или кода доступа.
import { SESSION_STORAGE_KEY, type GameSession } from '@/shared/lib/poker'; // Импортируем константу SESSION_STORAGE_KEY, которая используется в качестве ключа для хранения данных сессии в localStorage, и тип GameSession, который описывает структуру данных сессии игры, включая информацию о комнате, пользователе и колоде карт. Эти импорты используются в функции getLocalSession для получения данных сессии из localStorage и в функции persistRoomSession для сохранения данных сессии в localStorage.

// toAverageLabel — это функция, которая принимает числовое значение и возвращает его в виде строки. Если значение равно null или undefined, функция возвращает строку '0'. Если значение является целым числом, оно преобразуется в строку без десятичных знаков. Если значение является дробным числом, оно округляется до одного десятичного знака и возвращается в виде строки. Эта функция используется для отображения средней оценки задачи на основе голосов игроков в игре для планирования покера, обеспечивая удобочитаемый формат для пользователей.
export function toAverageLabel(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '0';
  }

  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

// roomRefLooksLikeCode — это функция, которая проверяет, соответствует ли переданная строка формату кода комнаты. Она использует регулярное выражение /^[a-zA-Z]{4}$/ для проверки, что строка состоит ровно из 4 букв (без цифр и специальных символов). Эта функция используется в функции loadRoomSnapshotWithToken для определения, является ли переданная строка кодом комнаты, что позволяет правильно обрабатывать запросы на загрузку комнаты по коду доступа.
export function roomRefLooksLikeCode(value: string) {
  return /^[a-zA-Z]{4}$/.test(value);
}

// getLocalSession — это функция, которая извлекает данные сессии игры из localStorage. Она пытается получить строку с данными сессии по ключу SESSION_STORAGE_KEY, а затем парсит эту строку как JSON и возвращает объект типа GameSession. Если данных нет или при парсинге возникает ошибка, функция возвращает null. Эта функция используется для восстановления состояния пользователя и комнаты при повторном посещении приложения, обеспечивая более плавный пользовательский опыт.
export function getLocalSession(): GameSession | null {
  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as GameSession;
  } catch {
    return null;
  }
}

// loadRoomSnapshotWithToken — это асинхронная функция, которая загружает снимок комнаты на основе переданного идентификатора комнаты (roomRef) и необязательного токена доступа к комнате (roomAccessToken). Если roomRef выглядит как код комнаты (4 буквы), функция пытается присоединиться к комнате по этому коду с помощью метода joinRoomByCode из roomApi. Если roomRef не выглядит как код, функция пытается получить снимок комнаты по идентификатору с помощью метода getRoomSnapshot из roomApi. Если загрузка комнаты не удалась, функция выбрасывает ошибку с сообщением 'room_not_available'. Эта функция используется для получения данных комнаты при входе пользователя в комнату, обеспечивая правильную обработку различных форматов идентификаторов комнаты.
export async function loadRoomSnapshotWithToken(
  roomRef: string,
  roomAccessToken?: string,
): Promise<RoomSnapshot> {
  try {
    if (roomRefLooksLikeCode(roomRef)) {
      return roomApi.joinRoomByCode(roomRef.toUpperCase(), roomAccessToken);
    }

    return await roomApi.getRoomSnapshot(roomRef, roomAccessToken);
  } catch {
    throw new Error('room_not_available');
  }
}
