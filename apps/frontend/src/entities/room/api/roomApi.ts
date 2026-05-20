import { api } from '@/shared/api'; // Импорт настроенного экземпляра axios для выполнения HTTP-запросов
import type { RoomState, RoomDetails, RoomListItem, RoomSnapshot } from '../model/types'; // Импорт типов данных, связанных с комнатами, для обеспечения типизации

// Вспомогательная функция для добавления токена авторизации в заголовки запросов, если он предоставлен
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

// Основной объект API для работы с комнатами, предоставляющий методы для получения списка комнат, деталей комнаты, создания комнаты, присоединения к комнате и управления задачами и раундами внутри комнаты
export const roomApi = {

  // Получение списка всех комнат. Если предоставлен токен авторизации, он будет включен в заголовки запроса для получения дополнительной информации о комнатах, доступных пользователю.
  listRooms: async (authToken?: string): Promise<RoomListItem[]> => {
    const { data } = await api.get('/rooms', withToken(authToken));
    return data;
  },

  // Получение подробной информации о конкретной комнате по ее идентификатору. Этот метод возвращает данные о комнате, включая ее участников и статус.
  getRoom: async (roomId: string): Promise<RoomDetails> => {
    const { data } = await api.get(`/rooms/${roomId}`);
    return data;
  },

  // Получение снимка комнаты, который включает в себя полную информацию о комнате, ее участниках, задачах и текущем раунде. Этот метод полезен для получения актуального состояния комнаты после выполнения различных действий, таких как присоединение к комнате или обновление статуса.
  getRoomSnapshot: async (roomId: string, authToken?: string): Promise<RoomSnapshot> => {
    const { data } = await api.get(`/rooms/${roomId}`, withToken(authToken));
    return data;
  },

  // Создание новой комнаты с заданным именем и предустановкой колоды карт. Этот метод возвращает снимок новой комнаты, который включает в себя ее идентификатор, имя, статус и другие детали.
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

  // Присоединение к комнате по ее уникальному коду. Этот метод позволяет пользователю присоединиться к существующей комнате, используя код, который может быть предоставлен владельцем комнаты или другим участником. Возвращает снимок комнаты с обновленной информацией о участниках и статусе.
  joinRoomByCode: async (roomCode: string, authToken?: string): Promise<RoomSnapshot> => {
    const { data } = await api.post(
      `/rooms/code/${roomCode}/join`,
      undefined,
      withToken(authToken),
    );
    return data;
  },

  // Присоединение к комнате по приглашению, используя уникальный токен. Этот метод позволяет пользователю присоединиться к комнате, используя специальный токен приглашения, который может быть предоставлен владельцем комнаты или другим участником. Возвращает снимок комнаты с обновленной информацией о участниках и статусе.
  joinRoomByInvitation: async (token: string, authToken?: string): Promise<RoomSnapshot> => {
    const { data } = await api.post(`/invitations/${token}/join`, undefined, withToken(authToken));
    return data;
  },

  // Удаление комнаты по ее идентификатору. Этот метод позволяет владельцу комнаты или пользователю с соответствующими правами удалить комнату, что приведет к удалению всех связанных данных, включая участников, задачи и раунды.
  deleteRoom: async (roomId: string): Promise<void> => {
    await api.delete(`/rooms/${roomId}`);
  },

  // Создание новой задачи внутри комнаты. Этот метод позволяет владельцу комнаты или пользователю с соответствующими правами создать новую задачу, указав ее название и описание. Новая задача будет добавлена в список задач комнаты и станет доступной для выбора и оценки участниками.
  createTask: async (
    roomId: string,
    payload: { title: string; description: string },
    authToken?: string,
  ): Promise<void> => {
    await api.post(`/rooms/${roomId}/tasks`, payload, withToken(authToken));
  },

  // Обновление информации о задаче внутри комнаты, такой как ее название и описание. Этот метод позволяет владельцу комнаты или пользователю с соответствующими правами изменить детали задачи, что может быть полезно для поддержания актуальной информации о задачах для всех участников.
  updateTask: async (
    roomId: string,
    taskId: string,
    payload: { title: string; description: string },
    authToken?: string,
  ): Promise<void> => {
    await api.patch(`/rooms/${roomId}/tasks/${taskId}`, payload, withToken(authToken));
  },

  // Удаление задачи из комнаты по ее идентификатору. Этот метод позволяет владельцу комнаты или пользователю с соответствующими правами удалить задачу, что приведет к удалению всех связанных данных, таких как оценки и раунды, связанные с этой задачей.
  deleteTask: async (roomId: string, taskId: string, authToken?: string): Promise<void> => {
    await api.delete(`/rooms/${roomId}/tasks/${taskId}`, withToken(authToken));
  },

  // Выбор задачи для оценки в комнате. Этот метод позволяет владельцу комнаты или пользователю с соответствующими правами выбрать задачу, которая будет оцениваться участниками. После выбора задачи участники смогут начать процесс оценки, который включает в себя голосование и раскрытие результатов.
  selectTask: async (roomId: string, taskId: string, authToken?: string): Promise<void> => {
    await api.post(`/rooms/${roomId}/tasks/select`, { task_id: taskId }, withToken(authToken));
  },

  // Сброс выбора задачи в комнате, что позволяет снять текущую выбранную задачу и вернуться к состоянию, когда никакая задача не выбрана для оценки. Этот метод может быть полезен, если выбранная задача больше не актуальна или если владелец комнаты хочет изменить выбор задачи.
  startRound: async (roomId: string, taskId: string, authToken?: string): Promise<RoomSnapshot> => {
    const { data } = await api.post(
      `/rooms/${roomId}/rounds/start`,
      { task_id: taskId },
      withToken(authToken),
    );
    return data;
  },

  // Отмена текущего раунда в комнате, что позволяет остановить процесс оценки и вернуться к состоянию, когда задача выбрана, но раунд не начат. Этот метод может быть полезен, если участники столкнулись с проблемами во время голосования или если владелец комнаты хочет изменить условия раунда.
  submitVote: async (
    roomId: string,
    roundId: string,
    value: string,
    authToken?: string,
  ): Promise<void> => {
    await api.post(`/rooms/${roomId}/rounds/${roundId}/vote`, { value }, withToken(authToken));
  },

  // Сброс текущего раунда в комнате, что позволяет отменить все голоса, связанные с этим раундом, и вернуться к состоянию, когда задача выбрана, но раунд не начат. Этот метод может быть полезен, если участники столкнулись с проблемами во время голосования или если владелец комнаты хочет изменить условия раунда.
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

  // Завершение текущего раунда в комнате, что позволяет зафиксировать результаты голосования и обновить статус задачи на "оцененная". Этот метод может быть полезен, когда все участники завершили голосование и владелец комнаты готов объявить результаты и перейти к следующей задаче.
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

  // Обновление статуса комнаты. Этот метод позволяет владельцу комнаты или пользователю с соответствующими правами обновить статус комнаты, что может повлиять на ее доступность и функциональность.
  updateRoomStatus: async (roomId: string, status: RoomState['status']): Promise<RoomDetails> => {
    const { data } = await api.patch(`/rooms/${roomId}/status`, { status });
    return data;
  },

  // Сброс комнаты, что позволяет удалить все задачи, раунды и голоса, связанные с этой комнатой, и вернуться к состоянию, когда комната только что создана. Этот метод может быть полезен, если владелец комнаты хочет начать процесс планирования заново или если комната была использована для тестирования и теперь должна быть очищена для реального использования.
  resetRoom: async (roomId: string): Promise<RoomDetails> => {
    const { data } = await api.post(`/rooms/${roomId}/reset`);
    return data;
  },
};
