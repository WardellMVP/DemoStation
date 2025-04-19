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
  const wsUrlRef = useRef<string>(url);

  const connect = useCallback(() => {
    if (!wsUrlRef.current) {
      console.log('No WebSocket URL available yet');
      return;
    }
    
    // Clean up any existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }

    try {
      console.log(`Connecting to WebSocket at ${wsUrlRef.current}`);
      const socket = new WebSocket(wsUrlRef.current);
      socketRef.current = socket;
      setStatus(WebSocketStatus.CONNECTING);

      socket.onopen = (event) => {
        console.log('WebSocket connection opened');
        setStatus(WebSocketStatus.OPEN);
        reconnectCountRef.current = 0;
        if (options.onOpen) options.onOpen(event);
      };

      socket.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          console.log('WebSocket message received:', parsedData);
          setData((prev) => [...prev, parsedData]);
          if (options.onMessage) options.onMessage(event);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        setStatus(WebSocketStatus.CLOSED);
        if (options.onClose) options.onClose(event);
        
        // Attempt reconnection if not a normal closure
        if (event.code !== 1000 && reconnectCountRef.current < maxReconnectAttempts) {
          reconnectCountRef.current += 1;
          console.log(`Attempting reconnect ${reconnectCountRef.current}/${maxReconnectAttempts}...`);
          setTimeout(() => connect(), reconnectInterval);
        }
      };

      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        setStatus(WebSocketStatus.ERROR);
        if (options.onError) options.onError(event);
      };
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
      setStatus(WebSocketStatus.ERROR);
    }
  }, [options, maxReconnectAttempts, reconnectInterval]);

  // Send message through the WebSocket
  const sendMessage = useCallback((message: string | object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const messageString = typeof message === 'string' 
        ? message 
        : JSON.stringify(message);
        
      console.log('Sending WebSocket message:', messageString);
      socketRef.current.send(messageString);
      return true;
    }
    console.log('Cannot send message, WebSocket not open');
    return false;
  }, []);

  // Clean up and manual reconnect methods
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Manually disconnecting WebSocket');
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  const reconnect = useCallback(() => {
    console.log('Manually reconnecting WebSocket');
    disconnect();
    connect();
  }, [connect, disconnect]);

  // Check WebSocket Support
  const [wsSupported, setWsSupported] = useState<boolean>(true);
  
  useEffect(() => {
    console.log('Checking WebSocket support...');
    // Check if WebSockets are supported
    fetch('/api/websocket-status')
      .then(response => response.json())
      .then(data => {
        console.log('WebSocket status response:', data);
        setWsSupported(data.supported);
        if (data.supported) {
          // Build WebSocket URL
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsUrl = `${protocol}//${window.location.host}${data.path}`;
          
          console.log(`WebSocket URL constructed: ${wsUrl}`);
          // Update the URL to include the WebSocket path
          wsUrlRef.current = wsUrl;
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
  }, [connect, disconnect]);

  // Store socket reference in a global for easier component access
  if (socketRef.current) {
    (window as any).__wsConnection = socketRef.current;
  }

  return {
    status,
    data,
    wsSupported,
    sendMessage,
    disconnect,
    reconnect,
    socket: socketRef.current
  };
}