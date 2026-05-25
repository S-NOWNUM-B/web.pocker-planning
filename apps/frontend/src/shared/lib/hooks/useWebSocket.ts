import { useEffect, useRef, useCallback } from 'react'; // Импортируем необходимые хуки из React: useEffect для управления жизненным циклом компонента, useRef для хранения ссылки на объект WebSocket и таймаут для переподключения, useCallback для мемоизации функций connect и disconnect.

// UseWebSocketOptions — это интерфейс, который определяет типы для параметров, передаваемых в хук useWebSocket. Он включает URL для подключения к WebSocket, функцию onMessage для обработки входящих сообщений, необязательный интервал переподключения и флаг autoConnect для автоматического подключения при монтировании компонента.
interface UseWebSocketOptions<T> {
  url: string;
  onMessage: (data: T) => void;
  reconnectInterval?: number;
  autoConnect?: boolean;
}

// useWebSocket — это пользовательский хук, который позволяет легко подключаться к WebSocket, отправлять сообщения и обрабатывать входящие сообщения с помощью коллбеков. Он также поддерживает автоматическое переподключение при отключении и позволяет управлять состоянием подключения.
export function useWebSocket<T>({
  url,
  onMessage,
  reconnectInterval = 3000,
  autoConnect = true,
}: UseWebSocketOptions<T>) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // connect — это функция, которая устанавливает соединение с WebSocket по указанному URL. Она также настраивает обработчики событий для открытия соединения, получения сообщений, ошибок и закрытия соединения. В случае закрытия соединения, функция планирует повторное подключение через заданный интервал времени.
  const connect = useCallback(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    // Обработчик события открытия соединения, который просто логирует успешное подключение.
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    // Обработчик события получения сообщения, который пытается распарсить входящее сообщение как JSON и вызывает переданную функцию onMessage с распарсенными данными. Если парсинг не удался, ошибка логируется в консоль.
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Обработчик события ошибки, который логирует ошибку в консоль.
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Обработчик события закрытия соединения, который логирует отключение и планирует повторное подключение через заданный интервал времени.
    ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting...');
      reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
    };
  }, [url, onMessage, reconnectInterval]);

  // disconnect — это функция, которая закрывает текущее соединение WebSocket и очищает таймаут для переподключения, если он установлен. Это позволяет вручную отключиться от WebSocket и предотвратить автоматическое переподключение.
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // useEffect для автоматического подключения при монтировании компонента, если autoConnect установлен в true. Также возвращает функцию очистки, которая отключает WebSocket при размонтировании компонента, чтобы предотвратить утечки памяти и нежелательные подключения.
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoConnect]);

  // sendMessage — это функция, которая отправляет сообщение через WebSocket. Она принимает произвольные данные, сериализует их в JSON и отправляет, если соединение открыто. Если соединение не открыто, сообщение не отправляется.
  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { sendMessage, disconnect, isConnected: wsRef.current?.readyState === WebSocket.OPEN }; // Возвращаем объект с функцией sendMessage для отправки сообщений, функцией disconnect для отключения от WebSocket и флагом isConnected для проверки состояния подключения.
}
