import type { RoomState, RoomStatus } from '@poker/shared'; // Импорт типов из общего пакета

export type { RoomState, RoomStatus }; // Экспорт типов для использования в других частях приложения

// Дополнительные типы, специфичные для фронтенда
export interface RoomListItem {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  invite_link: string | null;
  participants_count: number;
  active_task_title: string | null;
  last_activity_at: string;
  created_at: string;
}

// Тип для данных, получаемых при загрузке страницы комнаты
export interface RoomHistoryItem {
  id: string;
  round_id: string;
  task_id: string;
  task_title: string;
  result_value: string;
  average_score: number | null;
  consensus: boolean;
  votes_count: number;
  distribution: Record<string, number>;
  created_at: string;
}

// Тип для данных, получаемых при загрузке страницы комнаты
export interface RoomSnapshot {
  room: {
    id: string;
    name: string;
    slug: string;
    description: string;
    status: string;
    owner_id: string;
    current_task_id: string | null;
    invite_link: string | null;
    created_at: string;
    updated_at: string;
    deck: {
      code: string;
      cards: string[];
    };
  };
  self_participant_id: string | null;
  participants: Array<{
    id: string;
    user_id: string;
    name: string;
    role: 'owner' | 'member';
    has_voted: boolean;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: 'backlog' | 'active' | 'estimated';
    estimate_value: string | null;
    position: number;
  }>;
  active_round: {
    id: string;
    task_id: string;
    status: 'voting' | 'revealed' | 'finalized' | 'cancelled';
    votes_submitted: number;
    total_participants: number;
    suggested_result: string | null;
    average_score: number | null;
    consensus: boolean;
    self_vote_value: string | null;
    votes: Array<{
      participant_id: string;
      value: string | null;
      has_voted: boolean;
    }>;
  } | null;
  history: RoomHistoryItem[];
}

// Тип для данных, получаемых при загрузке страницы комнаты с более подробной информацией
export interface RoomDetails extends RoomState {
  createdAt: string;
  moderatorId: string;
}
