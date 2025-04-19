import { useEffect, useState } from 'react';
import { useWebSocket, WebSocketStatus } from '@/hooks/use-websocket';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ConsoleOutput } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ExecutionStatusProps = {
  status: 'running' | 'completed' | 'failed';
}

function ExecutionStatus({ status }: ExecutionStatusProps) {
  return (
    <div className={cn(
      "px-2 py-1 rounded font-medium text-xs flex items-center",
      status === 'completed' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
      status === 'failed' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
      "bg-blue-500/10 text-blue-500 border border-blue-500/20"
    )}>
      {status === 'completed' ? (
        <CheckCircle className="w-3 h-3 mr-1" />
      ) : status === 'failed' ? (
        <XCircle className="w-3 h-3 mr-1" />
      ) : (
        <Clock className="w-3 h-3 mr-1 animate-pulse" />
      )}
      {status.toUpperCase()}
    </div>
  );
}

interface ExecutionLogProps {
  executionId: number;
  status?: 'running' | 'completed' | 'failed';
  initialOutput?: string;
}

export function ExecutionLog({ executionId, status: initialStatus, initialOutput }: ExecutionLogProps) {
  const [status, setStatus] = useState<'running' | 'completed' | 'failed'>(initialStatus || 'running');
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>(() => {
    if (initialOutput) {
      return [
        {
          id: 'initial',
          timestamp: new Date().toISOString(),
          text: initialOutput,
          type: 'info'
        }
      ];
    }
    return [];
  });

  // Initialize WebSocket connection
  const { status: wsStatus, data, wsSupported, socket, sendMessage } = useWebSocket('', {
    onOpen: () => {
      console.log('WebSocket connection established');
      // Subscribe to execution updates
      sendSubscribeMessage();
    },
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  });

  // Send subscription message through WebSocket
  const sendSubscribeMessage = () => {
    if (wsStatus === WebSocketStatus.OPEN) {
      const subscribeMessage = {
        type: 'subscribe',
        executionId
      };
      
      // Use the sendMessage helper from the hook
      sendMessage(subscribeMessage);
    }
  };

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    if (data.type === 'execution_update' && data.executionId === executionId) {
      // Update execution status if included
      if (data.update && data.update.status) {
        setStatus(data.update.status);
      }

      // Add output if included
      if (data.update && data.update.output) {
        addOutputLine(data.update.output, 'info', data.timestamp);
      }
    } else if (data.type === 'execution_output' && data.executionId === executionId) {
      // Add new console output line
      addOutputLine(data.output, 'info', data.timestamp);
    }
  };

  // Helper to add a line to the console output
  const addOutputLine = (text: string, type: 'info' | 'warning' | 'error' | 'success', timestamp?: string) => {
    setConsoleOutput(prev => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: timestamp || new Date().toISOString(),
        text,
        type
      }
    ]);
  };

  // Automatically scroll to bottom when output changes
  useEffect(() => {
    const scrollArea = document.querySelector('.scroll-area-viewport');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [consoleOutput]);

  // Display message if WebSockets are not supported
  if (!wsSupported) {
    return (
      <Card className="bg-background-900 border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Terminal className="w-5 h-5 mr-2 text-primary" />
            Execution Log
          </CardTitle>
          <CardDescription>
            Live updates not available - refresh page for latest status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            WebSocket connection not available. Please refresh the page to see the latest execution status.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background-900 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Terminal className="w-5 h-5 mr-2 text-primary" />
          Execution Log
        </CardTitle>
        <CardDescription className="flex justify-between">
          <span>Execution #{executionId}</span>
          <ExecutionStatus status={status} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        {wsStatus === WebSocketStatus.CONNECTING ? (
          <div className="space-y-2 my-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-black font-mono text-sm">
            {consoleOutput.length === 0 ? (
              <div className="text-muted-foreground italic">
                Waiting for execution output...
              </div>
            ) : (
              consoleOutput.map((line) => (
                <div key={line.id} className="mb-1">
                  <span className="text-muted-foreground text-xs mr-2">
                    [{formatDate(line.timestamp)}]
                  </span>
                  <span className={
                    line.type === 'error' ? 'text-red-500' :
                    line.type === 'warning' ? 'text-yellow-500' :
                    line.type === 'success' ? 'text-green-500' :
                    'text-foreground'
                  }>
                    {line.text}
                  </span>
                </div>
              ))
            )}
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {wsStatus === WebSocketStatus.OPEN ? (
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Connected to real-time updates
          </span>
        ) : (
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
            {wsStatus === WebSocketStatus.CONNECTING ? 'Connecting...' : 'Disconnected from real-time updates'}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}