// Тип голоса, который может быть использован в приложении для голосования.
export type VoteValue =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '8'
  | '10'
  | '12'
  | '13'
  | '14'
  | '16'
  | '18'
  | '20'
  | '21'
  | '34'
  | '55'
  | '89'
  | '?'
  | 'coffee';

export type RoomStatus = 'waiting' | 'voting' | 'revealed'; // Статусы комнаты: ожидание, голосование, результаты раскрыты

// Интерфейс для участника комнаты
export interface Participant {
  id: string;
  name: string;
  hasVoted: boolean;
}

// Интерфейс для комнаты
export interface RoomState {
  id: string;
  name: string;
  status: RoomStatus;
  participants: Participant[];
}

// Интерфейс для ответа от API при ошибке
export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}
