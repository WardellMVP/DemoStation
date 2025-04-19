import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { WebSocketStatus } from '@/hooks/use-websocket';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

interface WebSocketContextType {
  status: WebSocketStatus;
  socket: WebSocket | null;
  connected: boolean;
  sendMessage: (message: string | object) => boolean;
  subscribe: (executionId: number) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  status: WebSocketStatus.CONNECTING,
  socket: null,
  connected: false,
  sendMessage: () => false,
  subscribe: () => {}
});

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [status, setStatus] = useState<WebSocketStatus>(WebSocketStatus.CONNECTING);
  const [supported, setSupported] = useState<boolean>(true);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000;

  // Check WebSocket support and initialize connection
  useEffect(() => {
    const checkWebSocketSupport = async () => {
      try {
        const response = await fetch('/api/websocket-status');
        const data = await response.json();
        
        console.log('WebSocket status response:', data);
        setSupported(data.supported);
        
        if (data.supported) {
          // Build WebSocket URL
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsUrl = `${protocol}//${window.location.host}${data.path}`;
          
          console.log(`WebSocket URL constructed: ${wsUrl}`);
          connectWebSocket(wsUrl);
        }
      } catch (error) {
        console.error('Error checking WebSocket support:', error);
        setSupported(false);
      }
    };
    
    checkWebSocketSupport();
    
    return () => {
      disconnectWebSocket();
    };
  }, []);

  // Connect to WebSocket server
  const connectWebSocket = useCallback((url: string) => {
    if (!url) {
      console.log('No WebSocket URL provided');
      return;
    }
    
    // Clean up any existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    try {
      console.log(`Connecting to WebSocket at ${url}`);
      const socket = new WebSocket(url);
      socketRef.current = socket;
      setStatus(WebSocketStatus.CONNECTING);
      
      socket.onopen = () => {
        console.log('WebSocket connection opened');
        setStatus(WebSocketStatus.OPEN);
        reconnectCountRef.current = 0;
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          // We don't store messages here - components will handle their own messages
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        setStatus(WebSocketStatus.CLOSED);
        
        // Attempt reconnection if not a normal closure
        if (event.code !== 1000 && reconnectCountRef.current < maxReconnectAttempts) {
          reconnectCountRef.current += 1;
          console.log(`Attempting reconnect ${reconnectCountRef.current}/${maxReconnectAttempts}...`);
          setTimeout(() => connectWebSocket(url), reconnectInterval);
        }
      };
      
      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        setStatus(WebSocketStatus.ERROR);
      };
      
      // Store socket reference globally for components to access
      window.__wsConnection = socket;
      
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
      setStatus(WebSocketStatus.ERROR);
    }
  }, []);
  
  // Disconnect from WebSocket server
  const disconnectWebSocket = useCallback(() => {
    if (socketRef.current) {
      console.log('Closing WebSocket connection');
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);
  
  // Send message through WebSocket
  const sendMessage = useCallback((message: string | object) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.log('Cannot send message, WebSocket not open');
      return false;
    }
    
    try {
      const messageString = typeof message === 'string' ? message : JSON.stringify(message);
      socketRef.current.send(messageString);
      console.log('Message sent:', messageString);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }, []);
  
  // Subscribe to execution updates
  const subscribe = useCallback((executionId: number) => {
    sendMessage({
      type: 'subscribe',
      executionId
    });
  }, [sendMessage]);

  // Context value
  const value = {
    status,
    socket: socketRef.current,
    connected: status === WebSocketStatus.OPEN,
    sendMessage,
    subscribe
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom hook to use the WebSocket context
export const useWebSocketContext = () => useContext(WebSocketContext);

// Add global type for window
declare global {
  interface Window {
    __wsConnection?: WebSocket;
  }
}