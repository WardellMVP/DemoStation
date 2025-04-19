import { useState, useEffect, useRef, useCallback } from 'react';

export enum WebSocketStatus {
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSED = 'closed',
  ERROR = 'error'
}

interface WebSocketOptions {
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

export function useWebSocket(url: string, options: WebSocketOptions = {}) {
  const [status, setStatus] = useState<WebSocketStatus>(WebSocketStatus.CONNECTING);
  const [data, setData] = useState<any[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const maxReconnectAttempts = options.reconnectAttempts || 5;
  const reconnectInterval = options.reconnectInterval || 3000;

  const connect = useCallback(() => {
    if (!url) {
      setStatus(WebSocketStatus.ERROR);
      return;
    }
    
    // Clean up any existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }

    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;
      setStatus(WebSocketStatus.CONNECTING);

      socket.onopen = (event) => {
        setStatus(WebSocketStatus.OPEN);
        reconnectCountRef.current = 0;
        if (options.onOpen) options.onOpen(event);
      };

      socket.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setData((prev) => [...prev, parsedData]);
          if (options.onMessage) options.onMessage(event);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onclose = (event) => {
        setStatus(WebSocketStatus.CLOSED);
        if (options.onClose) options.onClose(event);
        
        // Attempt reconnection if not a normal closure
        if (event.code !== 1000 && reconnectCountRef.current < maxReconnectAttempts) {
          reconnectCountRef.current += 1;
          setTimeout(() => connect(), reconnectInterval);
        }
      };

      socket.onerror = (event) => {
        setStatus(WebSocketStatus.ERROR);
        if (options.onError) options.onError(event);
      };
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
      setStatus(WebSocketStatus.ERROR);
    }
  }, [url, options, maxReconnectAttempts, reconnectInterval]);

  // Send message through the WebSocket
  const sendMessage = useCallback((message: string | object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const messageString = typeof message === 'string' 
        ? message 
        : JSON.stringify(message);
        
      socketRef.current.send(messageString);
      return true;
    }
    return false;
  }, []);

  // Clean up and manual reconnect methods
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [connect, disconnect]);

  // Check WebSocket Support
  const [wsSupported, setWsSupported] = useState<boolean>(true);
  
  useEffect(() => {
    // Check if WebSockets are supported
    fetch('/api/websocket-status')
      .then(response => response.json())
      .then(data => {
        setWsSupported(data.supported);
        if (data.supported) {
          // Build WebSocket URL
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsUrl = `${protocol}//${window.location.host}${data.path}`;
          
          // Update the URL to include the WebSocket path
          url = wsUrl;
          connect();
        }
      })
      .catch(error => {
        console.error('Error checking WebSocket support:', error);
        setWsSupported(false);
      });
      
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  return {
    status,
    data,
    wsSupported,
    sendMessage,
    disconnect,
    reconnect
  };
}