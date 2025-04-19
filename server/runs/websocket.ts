import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { ScenarioExecution } from '@shared/schema';
import { log } from '../vite';

let wss: WebSocketServer | null = null;
const connections = new Map<number, WebSocket[]>();

export function setupWebsocketServer(server: http.Server) {
  try {
    // Create a WebSocket server on the /ws path
    wss = new WebSocketServer({ server, path: '/ws' });
    
    log('WebSocket server initialized on path /ws', 'websocket');
    
    wss.on('connection', (ws) => {
      log('New WebSocket connection established', 'websocket');
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          
          // Handle subscription to execution updates
          if (data.type === 'subscribe' && data.executionId) {
            const executionId = Number(data.executionId);
            
            // Add this connection to the execution's subscribers
            if (!connections.has(executionId)) {
              connections.set(executionId, []);
            }
            connections.get(executionId)?.push(ws);
            
            log(`Client subscribed to execution ${executionId}`, 'websocket');
            
            // Send confirmation to client
            ws.send(JSON.stringify({ 
              type: 'subscribed', 
              executionId, 
              message: 'Successfully subscribed to execution updates' 
            }));
          }
        } catch (error) {
          log(`Error processing WebSocket message: ${error}`, 'websocket');
        }
      });
      
      ws.on('close', () => {
        log('WebSocket connection closed', 'websocket');
        
        // Remove this connection from all subscriptions
        connections.forEach((subscribers, executionId) => {
          const index = subscribers.indexOf(ws);
          if (index !== -1) {
            subscribers.splice(index, 1);
          }
          
          // Clean up empty subscription lists
          if (subscribers.length === 0) {
            connections.delete(executionId);
          }
        });
      });
      
      ws.on('error', (error) => {
        log(`WebSocket error: ${error}`, 'websocket');
      });
      
      // Send initial welcome message
      ws.send(JSON.stringify({ 
        type: 'connect', 
        message: 'Connected to Demo Codex WebSocket Server',
        timestamp: new Date().toISOString()
      }));
    });
    
    return true;
  } catch (error) {
    log(`Error setting up WebSocket server: ${error}`, 'websocket');
    return false;
  }
}

export function broadcastExecutionUpdate(executionId: number, update: Partial<ScenarioExecution>) {
  if (!wss) {
    log('WebSocket server not initialized', 'websocket');
    return false;
  }
  
  const subscribers = connections.get(executionId) || [];
  if (subscribers.length === 0) {
    log(`No subscribers for execution ${executionId}`, 'websocket');
    return false;
  }
  
  const message = JSON.stringify({
    type: 'execution_update',
    executionId,
    update,
    timestamp: new Date().toISOString()
  });
  
  let deliveredCount = 0;
  
  for (const client of subscribers) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      deliveredCount++;
    }
  }
  
  log(`Sent execution update to ${deliveredCount}/${subscribers.length} clients`, 'websocket');
  return deliveredCount > 0;
}

export function sendExecutionOutput(executionId: number, output: string) {
  if (!wss) {
    log('WebSocket server not initialized', 'websocket');
    return false;
  }
  
  const subscribers = connections.get(executionId) || [];
  if (subscribers.length === 0) {
    log(`No subscribers for execution ${executionId}`, 'websocket');
    return false;
  }
  
  const message = JSON.stringify({
    type: 'execution_output',
    executionId,
    output,
    timestamp: new Date().toISOString()
  });
  
  let deliveredCount = 0;
  
  for (const client of subscribers) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      deliveredCount++;
    }
  }
  
  log(`Sent execution output to ${deliveredCount}/${subscribers.length} clients`, 'websocket');
  return deliveredCount > 0;
}

export async function updateExecutionStatus(
  executionId: number, 
  status: 'running' | 'completed' | 'failed', 
  output?: string
) {
  const update: Partial<ScenarioExecution> = { status };
  if (output !== undefined) {
    update.output = output;
  }
  
  broadcastExecutionUpdate(executionId, update);
  
  // Return true to indicate successful broadcast
  return true;
}