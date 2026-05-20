/**
 * Типы данных сущности «Комната».
 *
 * RoomState — базовое состояние комнаты (импортируется из @poker/shared).
 * RoomStatus — статус комнаты: 'waiting' | 'voting' | 'revealed'.
 * RoomDetails — расширенная информация: createdAt, moderatorId.
 */
import type { RoomState, RoomStatus } from '@poker/shared';

export type { RoomState, RoomStatus };

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

export interface RoomDetails extends RoomState {
  createdAt: string;
  moderatorId: string;
}
