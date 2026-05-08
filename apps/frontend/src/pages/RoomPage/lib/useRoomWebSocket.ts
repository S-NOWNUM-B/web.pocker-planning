import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface RoomWebSocketMessage {
  type: string;
  payload: {
    snapshot?: unknown;
    [key: string]: unknown;
  };
}

interface UseRoomWebSocketOptions {
  roomId: string;
  token: string | undefined;
  enabled: boolean;
  onSnapshotUpdate?: (snapshot: unknown) => void;
}

export function useRoomWebSocket({
  roomId,
  token,
  enabled,
  onSnapshotUpdate,
}: UseRoomWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const shouldReconnectRef = useRef(true);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (!enabled || !token || !roomId) {
      return;
    }

    shouldReconnectRef.current = true;

    // Use backend URL directly for WebSocket (proxy may not work reliably)
    // In development, connect to localhost:8000; in production, use relative path
    const isProduction =
      window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const wsHost = isProduction ? window.location.host : 'localhost:8000';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${wsHost}/api/v1/ws/rooms/${roomId}?token=${encodeURIComponent(token)}`;

    console.log('[WebSocket] Connecting to:', url);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Connected to room', roomId);
    };

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

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    ws.onclose = () => {
      if (!shouldReconnectRef.current) {
        console.log('[WebSocket] Disconnected');
        return;
      }

      console.log('[WebSocket] Disconnected, will reconnect in 3s...');
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };
  }, [enabled, token, roomId, queryClient, onSnapshotUpdate]);

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

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Connect on mount/dependency changes, disconnect on unmount
  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Periodically ping to keep connection alive
  useEffect(() => {
    if (!enabled || !wsRef.current) return;

    const pingInterval = setInterval(() => {
      sendMessage({ type: 'presence.ping' });
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [enabled, sendMessage]);

  return { isConnected: wsRef.current?.readyState === WebSocket.OPEN };
}
