/**
 * Room API — операции с комнатами через REST API.
 *
 * Использует общий axios-клиент из shared/api.
 *
 * Методы:
 *  - getRoom(roomId) — GET /rooms/:roomId — получить данные комнаты
 *  - createRoom(name) — POST /rooms — создать новую комнату
 *  - updateRoomStatus(roomId, status) — PATCH /rooms/:roomId/status — изменить статус
 *  - resetRoom(roomId) — POST /rooms/:roomId/reset — сбросить голоса
 *
 * Типы данных: RoomState, RoomDetails из entities/room/model/types.
 */
import { api } from '@/shared/api';
import type { RoomState, RoomDetails, RoomListItem, RoomSnapshot } from '../model/types';

const withToken = (authToken?: string) => {
  if (!authToken) {
    return undefined;
  }

  return {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };
};

export const roomApi = {
  listRooms: async (authToken?: string): Promise<RoomListItem[]> => {
    const { data } = await api.get('/rooms', withToken(authToken));
    return data;
  },

  getRoom: async (roomId: string): Promise<RoomDetails> => {
    const { data } = await api.get(`/rooms/${roomId}`);
    return data;
  },

  getRoomSnapshot: async (roomId: string, authToken?: string): Promise<RoomSnapshot> => {
    const { data } = await api.get(`/rooms/${roomId}`, withToken(authToken));
    return data;
  },

  createRoom: async (
    name: string,
    deckPresetCode: 'fibonacci' | 'even' = 'fibonacci',
    authToken?: string,
  ): Promise<RoomSnapshot> => {
    const { data } = await api.post(
      '/rooms',
      { name, deck_preset_code: deckPresetCode },
      withToken(authToken),
    );
    return data;
  },

  joinRoomByCode: async (roomCode: string, authToken?: string): Promise<RoomSnapshot> => {
    const { data } = await api.post(
      `/rooms/code/${roomCode}/join`,
      undefined,
      withToken(authToken),
    );
    return data;
  },

  joinRoomByInvitation: async (token: string, authToken?: string): Promise<RoomSnapshot> => {
    const { data } = await api.post(`/invitations/${token}/join`, undefined, withToken(authToken));
    return data;
  },

  deleteRoom: async (roomId: string): Promise<void> => {
    await api.delete(`/rooms/${roomId}`);
  },

  createTask: async (roomId: string, title: string, authToken?: string): Promise<void> => {
    await api.post(`/rooms/${roomId}/tasks`, { title }, withToken(authToken));
  },

  updateTask: async (roomId: string, taskId: string, title: string, authToken?: string): Promise<void> => {
    await api.patch(`/rooms/${roomId}/tasks/${taskId}`, { title }, withToken(authToken));
  },

  deleteTask: async (roomId: string, taskId: string, authToken?: string): Promise<void> => {
    await api.delete(`/rooms/${roomId}/tasks/${taskId}`, withToken(authToken));
  },

  selectTask: async (roomId: string, taskId: string, authToken?: string): Promise<void> => {
    await api.post(`/rooms/${roomId}/tasks/select`, { task_id: taskId }, withToken(authToken));
  },

  startRound: async (roomId: string, taskId: string, authToken?: string): Promise<RoomSnapshot> => {
    const { data } = await api.post(
      `/rooms/${roomId}/rounds/start`,
      { task_id: taskId },
      withToken(authToken),
    );
    return data;
  },

  submitVote: async (
    roomId: string,
    roundId: string,
    value: string,
    authToken?: string,
  ): Promise<void> => {
    await api.post(`/rooms/${roomId}/rounds/${roundId}/vote`, { value }, withToken(authToken));
  },

  revealRound: async (
    roomId: string,
    roundId: string,
    authToken?: string,
  ): Promise<RoomSnapshot> => {
    const { data } = await api.post(
      `/rooms/${roomId}/rounds/${roundId}/reveal`,
      undefined,
      withToken(authToken),
    );
    return data;
  },

  finalizeRound: async (
    roomId: string,
    roundId: string,
    resultValue?: string,
    authToken?: string,
  ): Promise<RoomSnapshot> => {
    const { data } = await api.post(
      `/rooms/${roomId}/rounds/${roundId}/finalize`,
      {
        result_value: resultValue ?? null,
      },
      withToken(authToken),
    );
    return data;
  },

  updateRoomStatus: async (roomId: string, status: RoomState['status']): Promise<RoomDetails> => {
    const { data } = await api.patch(`/rooms/${roomId}/status`, { status });
    return data;
  },

  resetRoom: async (roomId: string): Promise<RoomDetails> => {
    const { data } = await api.post(`/rooms/${roomId}/reset`);
    return data;
  },
};
