import { useEffect, useRef, useCallback } from 'react'; // Импортируем хуки useEffect, useRef и useCallback для управления состоянием и побочными эффектами в компоненте
import { useQueryClient } from '@tanstack/react-query'; // Импортируем useQueryClient для доступа к клиенту React Query, который позволяет управлять кэшированием и обновлением данных

// Интерфейс RoomWebSocketMessage описывает структуру сообщений, которые будут получены через WebSocket. Он содержит тип сообщения и полезную нагрузку, которая может включать снимок состояния комнаты и другие данные.
interface RoomWebSocketMessage {
  type: string;
  payload: {
    snapshot?: unknown;
    [key: string]: unknown;
  };
}

// Интерфейс UseRoomWebSocketOptions описывает параметры, которые принимает хук useRoomWebSocket. Он включает идентификатор комнаты, токен доступа, флаг включения и необязательную функцию обратного вызова для обработки обновлений снимков состояния комнаты.
interface UseRoomWebSocketOptions {
  roomId: string;
  token: string | undefined;
  enabled: boolean;
  onSnapshotUpdate?: (snapshot: unknown) => void;
}

// Хук useRoomWebSocket управляет подключением к WebSocket для получения обновлений состояния комнаты в реальном времени. Он устанавливает соединение при включении, обрабатывает входящие сообщения, отправляет пинги для поддержания соединения и обеспечивает автоматическое переподключение при отключении. Этот хук также интегрируется с React Query для автоматического обновления данных комнаты при получении новых сообщений.
export function useRoomWebSocket({
  roomId,
  token,
  enabled,
  onSnapshotUpdate,
}: UseRoomWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null); // Реф для хранения текущего экземпляра WebSocket, чтобы его можно было использовать в различных функциях и эффектах
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined); // Реф для хранения идентификатора таймаута для автоматического переподключения, чтобы его можно было очистить при отключении
  const shouldReconnectRef = useRef(true); // Реф для отслеживания, должно ли происходить автоматическое переподключение при отключении, чтобы предотвратить попытки переподключения при намеренном отключении
  const queryClient = useQueryClient(); // Получаем клиент React Query для управления кэшированием и обновлением данных комнаты

  // Функция connect устанавливает соединение с WebSocket, используя URL, который включает идентификатор комнаты и токен доступа. Она также настраивает обработчики событий для открытия соединения, получения сообщений, ошибок и закрытия. При получении сообщений функция обрабатывает их в зависимости от типа и обновляет данные комнаты через React Query.
  const connect = useCallback(() => {
    if (!enabled || !token || !roomId) {
      return;
    }

    shouldReconnectRef.current = true; // Разрешаем автоматическое переподключение при установке нового соединения

    // Определяем URL для подключения к WebSocket. В продакшене используем текущий хост, а в режиме разработки подключаемся к localhost:8000. Протокол выбирается в зависимости от того, используется ли HTTPS.
    const isProduction =
      window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const wsHost = isProduction ? window.location.host : 'localhost:8000';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${wsHost}/api/v1/ws/rooms/${roomId}?token=${encodeURIComponent(token)}`;

    console.log('[WebSocket] Connecting to:', url); // Логируем URL для отладки подключения к WebSocket

    const ws = new WebSocket(url); // Создаем новый экземпляр WebSocket для подключения к серверу
    wsRef.current = ws; // Сохраняем экземпляр WebSocket в рефе для использования в других функциях и эффектах

    // Обработчик события открытия соединения
    ws.onopen = () => {
      console.log('[WebSocket] Connected to room', roomId);
    };

    // Обработчик события получения сообщения
    ws.onmessage = (event) => {
      try {
        const message: RoomWebSocketMessage = JSON.parse(event.data);
        console.log('[WebSocket] Message:', message.type, message.payload);

        // Handle snapshot updates
        if (message.type === 'room.snapshot' && message.payload.snapshot) {
          onSnapshotUpdate?.(message.payload.snapshot);
        }

        // Invalidate room query on any snapshot-related event
        if (
          message.type === 'room.snapshot' ||
          message.type === 'presence.changed' ||
          message.type === 'round.started' ||
          message.type === 'vote.submitted' ||
          message.type === 'round.revealed' ||
          message.type === 'round.finalized' ||
          message.type === 'task.updated'
        ) {
          // Invalidate all room-related queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['room'] });
          queryClient.invalidateQueries({ queryKey: ['rooms'] });
          queryClient.invalidateQueries({ queryKey: ['room-history'] });
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    };

    // Обработчик события ошибки соединения
    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    // Обработчик события закрытия соединения
    ws.onclose = () => {
      if (!shouldReconnectRef.current) {
        console.log('[WebSocket] Disconnected');
        return;
      }

      console.log('[WebSocket] Disconnected, will reconnect in 3s...');
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };
  }, [enabled, token, roomId, queryClient, onSnapshotUpdate]);

  // Функция disconnect закрывает текущее соединение WebSocket и предотвращает автоматическое переподключение. Она очищает таймаут для переподключения, если он установлен, и закрывает соединение, если оно существует.
  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Функция sendMessage отправляет сообщение через WebSocket, если соединение открыто. Она принимает объект сообщения, сериализует его в JSON и отправляет на сервер.
  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Эффект для управления жизненным циклом соединения WebSocket. Он устанавливает соединение при включении и отключает его при выключении или размонтировании компонента. Зависимости включают флаг enabled, функцию connect и функцию disconnect.
  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Эффект для отправки пингов через WebSocket каждые 30 секунд, чтобы поддерживать соединение активным. Он запускается при включении и наличии открытого соединения, и очищает таймаут при отключении или размонтировании компонента. Зависимости включают флаг enabled и функцию sendMessage.
  useEffect(() => {
    if (!enabled || !wsRef.current) return;

    const pingInterval = setInterval(() => {
      sendMessage({ type: 'presence.ping' });
    }, 30000); // Отправляем пинг каждые 30 секунд

    return () => clearInterval(pingInterval);
  }, [enabled, sendMessage]);

  return { isConnected: wsRef.current?.readyState === WebSocket.OPEN }; // Возвращаем объект с флагом isConnected, который указывает, открыто ли соединение WebSocket
}
