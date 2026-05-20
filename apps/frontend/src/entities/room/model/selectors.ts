import type { RoomState, RoomStatus } from '@poker/shared'; // Импорт типов из общего пакета

// Селекторы для получения информации о комнате
export const statusLabels: Record<RoomStatus, string> = {
  waiting: 'Waiting',
  voting: 'Voting',
  revealed: 'Revealed',
};

// Функция для получения цвета статуса комнаты
export function getRoomStatusColor(status: RoomStatus): string {
  const colorMap: Record<RoomStatus, string> = {
    waiting: 'blue',
    voting: 'yellow',
    revealed: 'green',
  };
  return colorMap[status];
}

// Функция для проверки, активна ли комната (статус "voting" или "waiting")
export function isRoomActive(room: RoomState): boolean {
  return room.status === 'voting' || room.status === 'waiting';
}
