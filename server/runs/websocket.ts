import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import { ScenarioExecution } from '@shared/schema';
import { storage } from '../storage';

// Map to store active connections by execution ID
const connections = new Map<number, Set<WebSocket>>();

export function setupWebsocketServer(server: http.Server) {
  const wss = new WebSocketServer({ 
    server, 
    path: '/ws'
  });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');
    
    // Parse execution ID from URL
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const executionId = parseInt(url.searchParams.get('executionId') || '0');
    
    if (executionId) {
      // Add this connection to the set for this execution
      if (!connections.has(executionId)) {
        connections.set(executionId, new Set());
      }
      connections.get(executionId)?.add(ws);
      
      // Set up cleanup on connection close
      ws.on('close', () => {
        console.log('WebSocket connection closed');
        const executionConnections = connections.get(executionId);
        if (executionConnections) {
          executionConnections.delete(ws);
          if (executionConnections.size === 0) {
            connections.delete(executionId);
          }
        }
      });
    } else {
      // Invalid connection without execution ID
      ws.close(1008, 'Missing executionId');
    }
  });

  return wss;
}

// Function to broadcast execution updates to all connected clients
export function broadcastExecutionUpdate(executionId: number, update: Partial<ScenarioExecution>) {
  const clients = connections.get(executionId);
  if (!clients) return;
  
  const message = JSON.stringify({
    type: 'execution_update',
    data: update
  });
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Function to send log output to connected clients
export function sendExecutionOutput(executionId: number, output: string) {
  const clients = connections.get(executionId);
  if (!clients) return;
  
  const message = JSON.stringify({
    type: 'execution_output',
    data: {
      timestamp: new Date().toISOString(),
      text: output
    }
  });
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Update the execution status and broadcast the change
export async function updateExecutionStatus(
  executionId: number, 
  status: 'running' | 'completed' | 'failed', 
  output?: string
) {
  try {
    const update: Partial<ScenarioExecution> = { status };
    if (output) {
      update.output = output;
    }
    
    // Update in database
    const updated = await storage.updateScenarioExecution(executionId, update);
    
    // Broadcast to clients
    if (updated) {
      broadcastExecutionUpdate(executionId, updated);
    }
    
    return updated;
  } catch (error) {
    console.error('Error updating execution status:', error);
    return null;
  }
}