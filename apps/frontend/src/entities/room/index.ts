export { RoomCard } from './ui/RoomCard'; // Экспорт компонента RoomCard для отображения карточки комнаты в списке комнат
export type { RoomState, RoomStatus, RoomDetails, RoomListItem } from './model/types'; // Экспорт типов для использования в других частях приложения
export { roomApi } from './api/roomApi'; // Экспорт API для работы с комнатами (создание, удаление, получение информации и т.д.)
export { statusLabels, getRoomStatusColor, isRoomActive } from './model/selectors'; // Экспорт селекторов для получения информации о статусе комнаты и её активности
