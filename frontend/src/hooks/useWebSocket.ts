import { useEffect, useRef, useState, useCallback } from 'react';
import { Match, Commentary } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

interface UseWebSocketProps {
  onMatchCreated?: (match: Match) => void;
  onCommentaryCreated?: (commentary: Commentary) => void;
}

export function useWebSocket({ onMatchCreated, onCommentaryCreated }: UseWebSocketProps = {}) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const subscribedMatchesRef = useRef<Set<number>>(new Set());

  const onMatchCreatedRef = useRef(onMatchCreated);
  const onCommentaryCreatedRef = useRef(onCommentaryCreated);

  useEffect(() => {
    onMatchCreatedRef.current = onMatchCreated;
  }, [onMatchCreated]);

  useEffect(() => {
    onCommentaryCreatedRef.current = onCommentaryCreated;
  }, [onCommentaryCreated]);

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(WS_URL);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        setLastHeartbeat(new Date());

        // Resubscribe to any previously tracked matches on reconnect
        subscribedMatchesRef.current.forEach((matchId) => {
          socket.send(JSON.stringify({ type: 'subscribe', matchId }));
        });
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'match_created' && payload.data) {
            onMatchCreatedRef.current?.(payload.data);
          } else if (payload.type === 'commentary_created' && payload.data) {
            onCommentaryCreatedRef.current?.(payload.data);
          } else if (payload.type === 'welcome') {
            setLastHeartbeat(new Date());
          }
        } catch (err) {
          console.error('Error parsing incoming WS message:', err);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect after 3 seconds
        setTimeout(() => {
          connect();
        }, 3000);
      };

      socket.onerror = (err) => {
        console.error('WebSocket encountered error:', err);
        socket.close();
      };
    } catch (err) {
      console.error('Failed to initiate WebSocket connection:', err);
      setTimeout(connect, 3000);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const subscribeToMatch = useCallback((matchId: number) => {
    subscribedMatchesRef.current.add(matchId);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', matchId }));
    }
  }, []);

  const unsubscribeFromMatch = useCallback((matchId: number) => {
    subscribedMatchesRef.current.delete(matchId);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', matchId }));
    }
  }, []);

  return {
    isConnected,
    lastHeartbeat,
    subscribeToMatch,
    unsubscribeFromMatch,
  };
}
