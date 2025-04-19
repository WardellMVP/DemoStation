import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { InsertScenarioExecution, InsertRunHistory } from '@shared/schema';
import { storage } from '../storage';
import { sendExecutionOutput, updateExecutionStatus } from './websocket';

// Execute a scenario with the given configuration
export async function executeScenario(
  scenarioId: number, 
  userId: number | null, 
  configSnapshot: any
) {
  try {
    // Get the scenario details
    const scenario = await storage.getScenario(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario with ID ${scenarioId} not found`);
    }

    // Create a new execution record
    const execution = await storage.createScenarioExecution({
      scenarioId,
      userId,
      timestamp: new Date().toISOString(),
      status: 'running',
      configSnapshot
    });

    // Create run history record
    const runHistory = await storage.createRunHistory({
      userId: userId || 0, // Default to 0 if no user
      scenarioId: scenario.name, // Store the name as the ID
      status: 'pending'
    });

    // Execute the scenario in the background
    executeScenarioProcess(scenario.scriptPath, configSnapshot, execution.id, runHistory.id);

    return execution;
  } catch (error) {
    console.error('Error executing scenario:', error);
    throw error;
  }
}

// Execute the scenario script in a child process
async function executeScenarioProcess(
  scriptPath: string, 
  configSnapshot: any, 
  executionId: number,
  runHistoryId: number
) {
  try {
    // Prepare temporary config file
    const configFilePath = await prepareConfigFile(configSnapshot);
    
    // Determine script type and command
    const command = getScriptCommand(scriptPath);
    const args = [scriptPath, '--config', configFilePath];
    
    // Start the process
    const process = spawn(command, args);
    
    // Stream output to WebSocket
    process.stdout.on('data', (data) => {
      const output = data.toString();
      sendExecutionOutput(executionId, output);
    });
    
    process.stderr.on('data', (data) => {
      const output = data.toString();
      sendExecutionOutput(executionId, `ERROR: ${output}`);
    });
    
    // Handle process completion
    process.on('close', async (code) => {
      const status = code === 0 ? 'completed' : 'failed';
      await updateExecutionStatus(executionId, status);
      
      // Update run history
      await storage.updateRunHistory(runHistoryId, {
        status: status === 'completed' ? 'success' : 'error',
        finishedAt: new Date()
      });
      
      // Clean up temp file
      try {
        await fs.unlink(configFilePath);
      } catch (err) {
        console.error('Error cleaning up temporary config file:', err);
      }
    });
  } catch (error) {
    console.error('Error in scenario execution process:', error);
    await updateExecutionStatus(executionId, 'failed', `Error: ${error.message}`);
    
    // Update run history
    await storage.updateRunHistory(runHistoryId, {
      status: 'error',
      finishedAt: new Date()
    });
  }
}

// Create a temporary configuration file
async function prepareConfigFile(configSnapshot: any): Promise<string> {
  const tempDir = path.resolve(process.cwd(), 'temp');
  
  try {
    // Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true });
    
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `config_${timestamp}.json`;
    const filePath = path.join(tempDir, filename);
    
    // Write config to file
    await fs.writeFile(filePath, JSON.stringify(configSnapshot, null, 2), 'utf8');
    
    return filePath;
  } catch (error: any) {
    console.error('Error preparing config file:', error);
    throw new Error(error.message || 'Error preparing config file');
  }
}

// Determine the appropriate command based on script extension
function getScriptCommand(scriptPath: string): string {
  const ext = path.extname(scriptPath).toLowerCase();
  
  switch (ext) {
    case '.py':
      return 'python';
    case '.js':
      return 'node';
    case '.sh':
      return 'bash';
    default:
      throw new Error(`Unsupported script type: ${ext}`);
  }
}