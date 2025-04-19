import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { spawn, exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import axios from "axios";
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import {
  insertThreatScenarioSchema,
  insertScenarioExecutionSchema,
  yamlConfigSchema,
  InsertScenarioExecution,
  ConfigParameterType,
  configParameterSchema
} from "@shared/schema";
import * as yaml from 'js-yaml';
import { z } from "zod";
import { executeScenario } from "./runs";
import { fromZodError } from "zod-validation-error";

// GitLab API helper functions
async function getGitLabApiToken(): Promise<string> {
  const config = await storage.getGitlabConfig();
  return config?.apiKey || "";
}

async function getGitLabProjectId(): Promise<string> {
  const config = await storage.getGitlabConfig();
  return config?.projectId || "";
}

async function makeGitLabApiRequest(
  endpoint: string,
  options: {
    method?: string;
    params?: Record<string, any>;
    headers?: Record<string, string>;
    responseType?: "json" | "arraybuffer" | "text";
  } = {}
) {
  const token = await getGitLabApiToken();
  const baseUrl = (await storage.getGitlabConfig())?.baseUrl || "https://gitlab.com";
  
  if (!token) {
    throw new Error("GitLab API key not configured");
  }
  
  const url = `${baseUrl}/api/v4/${endpoint}`;
  const method = options.method || "GET";
  
  const response = await axios({
    url,
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    params: options.params || {},
    responseType: options.responseType || "json",
  });
  
  return response.data;
}

// Function to download a project archive from GitLab
async function downloadProjectArchive(projectId: string, ref: string = "main"): Promise<string> {
  const token = await getGitLabApiToken();
  const baseUrl = (await storage.getGitlabConfig())?.baseUrl || "https://gitlab.com";
  
  if (!token) {
    throw new Error("GitLab API key not configured");
  }
  
  const url = `${baseUrl}/api/v4/projects/${projectId}/repository/archive.zip?ref=${ref}`;
  const tempFilePath = path.join(os.tmpdir(), `gitlab-project-${projectId}-${Date.now()}.zip`);
  
  const response = await axios({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: 'stream',
  });
  
  const writer = createWriteStream(tempFilePath);
  
  await pipeline(response.data, writer);
  
  return tempFilePath;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // GitLab configuration endpoints
  app.get('/api/gitlab/config', async (req: Request, res: Response) => {
    try {
      const config = await storage.getGitlabConfig();
      
      // Mask the API key for security
      if (config && config.apiKey) {
        config.apiKey = config.apiKey.substring(0, 4) + '*'.repeat(config.apiKey.length - 4);
      }
      
      res.json(config || {});
    } catch (error) {
      console.error('Error fetching GitLab config:', error);
      res.status(500).json({ message: 'Error fetching GitLab configuration' });
    }
  });
  
  app.post('/api/gitlab/config', async (req: Request, res: Response) => {
    try {
      const { apiKey, projectId, scenariosPath, baseUrl } = req.body;
      
      // Basic validation
      if (!apiKey || !projectId) {
        return res.status(400).json({ 
          message: 'API key and project ID are required' 
        });
      }
      
      // Test the API key by making a simple request
      try {
        const response = await axios.get(`${baseUrl || 'https://gitlab.com'}/api/v4/projects/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        
        // If we get here, the API key works
      } catch (apiError) {
        return res.status(401).json({
          message: 'Invalid GitLab API key or project ID'
        });
      }
      
      const updatedConfig = await storage.updateGitlabConfig({
        apiKey,
        projectId,
        scenariosPath: scenariosPath || 'scenarios',
        baseUrl: baseUrl || 'https://gitlab.com'
      });
      
      // Reload scenarios after config update
      await reloadScenariosFromGitLab();
      
      // Return a sanitized version (no API key)
      const sanitizedConfig = { ...updatedConfig };
      if (sanitizedConfig.apiKey) {
        sanitizedConfig.apiKey = sanitizedConfig.apiKey.substring(0, 4) + '*'.repeat(sanitizedConfig.apiKey.length - 4);
      }
      
      res.status(200).json(sanitizedConfig);
    } catch (error) {
      console.error('Error updating GitLab config:', error);
      res.status(500).json({ message: 'Error updating GitLab configuration' });
    }
  });

  // GitLab API endpoints
  app.get('/api/gitlab/project-info', async (req: Request, res: Response) => {
    try {
      const projectId = await getGitLabProjectId();
      
      if (!projectId) {
        return res.status(401).json({ message: 'GitLab project not configured' });
      }
      
      const projectData = await makeGitLabApiRequest(`projects/${projectId}`);
      res.json(projectData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.status(error.response?.status || 500).json({ 
          message: error.response?.data?.message || 'Error fetching GitLab project info' 
        });
      } else {
        console.error('GitLab API error:', error);
        res.status(500).json({ message: 'Error fetching GitLab project info' });
      }
    }
  });
  
  // Download entire project from GitLab
  app.get('/api/gitlab/download-project', async (req: Request, res: Response) => {
    try {
      const projectId = await getGitLabProjectId();
      
      if (!projectId) {
        return res.status(401).json({ message: 'GitLab project not configured' });
      }
      
      const ref = req.query.ref as string || 'main';
      
      try {
        const tempFilePath = await downloadProjectArchive(projectId, ref);
        
        // Set appropriate headers for download
        res.setHeader('Content-Disposition', `attachment; filename=gitlab-project-${projectId}.zip`);
        res.setHeader('Content-Type', 'application/zip');
        
        // Stream the file to the client
        const fileStream = createReadStream(tempFilePath);
        fileStream.pipe(res);
        
        // Cleanup temp file after sending
        fileStream.on('end', async () => {
          try {
            await fs.unlink(tempFilePath);
          } catch (err) {
            console.error('Error cleaning up temp file:', err);
          }
        });
      } catch (downloadError) {
        console.error('Error downloading project:', downloadError);
        res.status(500).json({ message: 'Error downloading project archive' });
      }
    } catch (error) {
      console.error('Error in download-project endpoint:', error);
      res.status(500).json({ message: 'Error downloading project' });
    }
  });
  
  // Get file content from GitLab
  app.get('/api/gitlab/file', async (req: Request, res: Response) => {
    try {
      const projectId = await getGitLabProjectId();
      const { path: filePath, ref = 'main' } = req.query;
      
      if (!projectId) {
        return res.status(401).json({ message: 'GitLab project not configured' });
      }
      
      if (!filePath) {
        return res.status(400).json({ message: 'File path is required' });
      }
      
      const encodedFilePath = encodeURIComponent(filePath as string);
      
      try {
        const fileData = await makeGitLabApiRequest(`projects/${projectId}/repository/files/${encodedFilePath}`, {
          params: { ref }
        });
        
        // GitLab returns base64 encoded content
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        res.json({ content });
      } catch (fileError) {
        res.status(404).json({ message: 'File not found in GitLab repository' });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.status(error.response?.status || 500).json({ 
          message: error.response?.data?.message || 'Error fetching file from GitLab' 
        });
      } else {
        console.error('GitLab API error:', error);
        res.status(500).json({ message: 'Error fetching file from GitLab' });
      }
    }
  });
  
  // Scenario operations
  app.get('/api/scenarios', async (req: Request, res: Response) => {
    try {
      const scenarios = await storage.getAllScenarios();
      res.json(scenarios);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      res.status(500).json({ message: 'Error fetching scenarios' });
    }
  });
  
  app.get('/api/scenarios/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const scenario = await storage.getScenario(id);
      
      if (!scenario) {
        return res.status(404).json({ message: 'Scenario not found' });
      }
      
      res.json(scenario);
    } catch (error) {
      console.error('Error fetching scenario:', error);
      res.status(500).json({ message: 'Error fetching scenario' });
    }
  });
  
  // Get configuration parameters for a scenario
  app.get('/api/scenarios/:id/parameters', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const scenario = await storage.getScenario(id);
      
      if (!scenario) {
        return res.status(404).json({ message: 'Scenario not found' });
      }
      
      const parameters = await storage.getConfigParameters(id);
      res.json(parameters);
    } catch (error) {
      console.error('Error fetching scenario parameters:', error);
      res.status(500).json({ message: 'Error fetching scenario parameters' });
    }
  });
  
  // Execute a scenario
  app.post('/api/scenarios/:id/execute', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { config } = req.body;
      
      const scenario = await storage.getScenario(id);
      
      if (!scenario) {
        return res.status(404).json({ message: 'Scenario not found' });
      }
      
      // Get user ID from authentication if available
      const userId = req.user?.id || null;
      
      // Use the new executor with WebSocket support
      const execution = await executeScenario(id, userId, config || {});
      
      res.status(202).json({ 
        message: 'Scenario execution started', 
        executionId: execution.id 
      });
    } catch (error: any) {
      console.error('Error executing scenario:', error);
      res.status(500).json({ message: error.message || 'Error executing scenario' });
    }
  });
  
  // Get execution history for a scenario
  app.get('/api/scenarios/:id/executions', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const scenario = await storage.getScenario(id);
      
      if (!scenario) {
        return res.status(404).json({ message: 'Scenario not found' });
      }
      
      const executions = await storage.getScenarioExecutions(id);
      res.json(executions);
    } catch (error) {
      console.error('Error fetching scenario executions:', error);
      res.status(500).json({ message: 'Error fetching scenario executions' });
    }
  });
  
  // Get execution details
  app.get('/api/executions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // In a real implementation, we would look up the execution directly
      // For now, we'll scan all executions for all scenarios
      const scenarios = await storage.getAllScenarios();
      
      for (const scenario of scenarios) {
        const executions = await storage.getScenarioExecutions(scenario.id);
        const execution = executions.find(e => e.id === id);
        
        if (execution) {
          return res.json(execution);
        }
      }
      
      res.status(404).json({ message: 'Execution not found' });
    } catch (error) {
      console.error('Error fetching execution details:', error);
      res.status(500).json({ message: 'Error fetching execution details' });
    }
  });
  
  // Force reload of scenarios from GitLab
  app.post('/api/reload-scenarios', async (req: Request, res: Response) => {
    try {
      await reloadScenariosFromGitLab();
      res.json({ message: 'Scenarios reloaded successfully' });
    } catch (error) {
      console.error('Error reloading scenarios:', error);
      res.status(500).json({ message: 'Error reloading scenarios from GitLab' });
    }
  });
  
  // Get websocket status - for client to check if WebSocket is supported
  app.get('/api/websocket-status', (req: Request, res: Response) => {
    res.json({ 
      supported: true,
      path: '/ws'
    });
  });
  
  // Get user run history
  app.get('/api/run-history', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (userId) {
        // Get authenticated user's run history
        const history = await storage.getUserRunHistory(userId);
        res.json(history);
      } else {
        // Get recent global history
        const history = await storage.getRunHistory();
        res.json(history);
      }
    } catch (error) {
      console.error('Error fetching run history:', error);
      res.status(500).json({ message: 'Error fetching run history' });
    }
  });

  // Helper function to load scenarios from GitLab
  async function reloadScenariosFromGitLab() {
    const config = await storage.getGitlabConfig();
    if (!config || !config.apiKey || !config.projectId) {
      console.log('GitLab not configured, skipping scenario reload');
      return;
    }
    
    try {
      console.log('Reloading scenarios from GitLab...');
      
      // Get list of directories in the scenarios path
      const scenariosPath = config.scenariosPath || 'scenarios';
      const encodedPath = encodeURIComponent(scenariosPath);
      
      // First, try to get the contents of the scenarios directory
      try {
        const treeData = await makeGitLabApiRequest(`projects/${config.projectId}/repository/tree`, {
          params: { path: scenariosPath, ref: 'main' }
        });
        
        // Filter for directories only
        const directories = treeData.filter((item: any) => item.type === 'tree');
        
        // Process each directory as a potential scenario
        for (const directory of directories) {
          const scenarioPath = directory.path;
          const scenarioName = directory.name;
          
          // Look for config.yaml, script.py and README.md in the directory
          try {
            const dirContents = await makeGitLabApiRequest(`projects/${config.projectId}/repository/tree`, {
              params: { path: scenarioPath, ref: 'main' }
            });
            
            const configFile = dirContents.find((f: any) => f.name.toLowerCase() === 'config.yaml' || f.name.toLowerCase() === 'config.yml');
            const scriptFile = dirContents.find((f: any) => f.name.toLowerCase().endsWith('.py'));
            const readmeFile = dirContents.find((f: any) => f.name.toLowerCase() === 'readme.md');
            
            if (scriptFile && configFile) {
              // This is a valid scenario, get the readme content if available
              let readmeContent = '';
              if (readmeFile) {
                try {
                  const encodedReadmePath = encodeURIComponent(readmeFile.path);
                  const readmeData = await makeGitLabApiRequest(`projects/${config.projectId}/repository/files/${encodedReadmePath}`, {
                    params: { ref: 'main' }
                  });
                  readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
                } catch (readmeError) {
                  console.warn(`Could not fetch README for scenario ${scenarioName}`);
                }
              }
              
              // Get config content to parse parameters
              const encodedConfigPath = encodeURIComponent(configFile.path);
              const configData = await makeGitLabApiRequest(`projects/${config.projectId}/repository/files/${encodedConfigPath}`, {
                params: { ref: 'main' }
              });
              const configContent = Buffer.from(configData.content, 'base64').toString('utf-8');
              
              // Parse config to extract description and parameters
              let configYaml;
              try {
                configYaml = yaml.load(configContent) as Record<string, any>;
              } catch (yamlError) {
                console.warn(`Could not parse YAML for scenario ${scenarioName}`);
                configYaml = {};
              }
              
              // Create or update the scenario
              const existingScenarios = await storage.getAllScenarios();
              const existingScenario = existingScenarios.find(s => 
                s.folderPath === scenarioPath || s.name === scenarioName
              );
              
              const scenarioData = {
                name: scenarioName,
                description: configYaml.description || `${scenarioName} scenario`,
                folderPath: scenarioPath,
                scriptPath: scriptFile.path,
                configPath: configFile.path,
                readmePath: readmeFile?.path || '',
                lastUpdated: new Date().toISOString(),
                readmeContent
              };
              
              let scenario;
              if (existingScenario) {
                scenario = await storage.updateScenario(existingScenario.id, scenarioData);
              } else {
                scenario = await storage.createScenario(scenarioData);
              }
              
              // Handle parameters
              if (scenario && configYaml.parameters && typeof configYaml.parameters === 'object') {
                // Get existing parameters for this scenario
                const existingParams = await storage.getConfigParameters(scenario.id);
                
                // For each parameter in the config
                for (const [paramName, paramDataRaw] of Object.entries(configYaml.parameters)) {
                  if (typeof paramDataRaw === 'object' && paramDataRaw !== null) {
                    const existingParam = existingParams.find(p => p.name === paramName);
                    const paramData = paramDataRaw as Record<string, any>;
                    
                    // Create a parameter definition from the config
                    const paramType = detectParameterType(paramData);
                    const paramOptions = getParameterOptions(paramData, paramType);
                    
                    const paramDefinition = {
                      scenarioId: scenario.id,
                      name: paramName,
                      label: (paramData.label as string) || toTitleCase(paramName),
                      description: (paramData.description as string) || '',
                      type: paramType,
                      defaultValue: paramData.default !== undefined ? String(paramData.default) : '',
                      required: paramData.required === true,
                      options: paramOptions
                    };
                    
                    if (existingParam) {
                      await storage.updateConfigParameter(existingParam.id, paramDefinition);
                    } else {
                      await storage.createConfigParameter(paramDefinition);
                    }
                  }
                }
              }
            }
          } catch (dirError) {
            console.warn(`Error processing scenario directory ${scenarioPath}:`, dirError);
          }
        }
        
        console.log('Scenarios loaded successfully');
      } catch (treeError) {
        console.error('Error fetching scenarios tree:', treeError);
        throw new Error('Error accessing scenarios directory in GitLab');
      }
    } catch (error) {
      console.error('Error reloading scenarios:', error);
      throw error;
    }
  }
  
  // Helper functions for parameter detection
  function detectParameterType(paramData: any): string {
    if (paramData.type) {
      // If type is explicitly specified, use it
      return paramData.type;
    } else if (paramData.options || paramData.enum || Array.isArray(paramData.values)) {
      // If it has options/enum/values, it's a select
      return 'select';
    } else if (paramData.default !== undefined) {
      // Infer from default value
      const defaultType = typeof paramData.default;
      if (defaultType === 'boolean') return 'boolean';
      if (defaultType === 'number') return 'number';
      return 'string';
    }
    
    // Default to string
    return 'string';
  }
  
  function getParameterOptions(paramData: any, type: string): any[] {
    if (type !== 'select') return [];
    
    const optionsArray = paramData.options || paramData.enum || paramData.values || [];
    
    if (Array.isArray(optionsArray)) {
      // Convert simple array to {label, value} format
      return optionsArray.map(option => {
        if (typeof option === 'object' && option.label && option.value !== undefined) {
          return option;
        }
        return {
          label: String(option),
          value: option
        };
      });
    }
    
    return [];
  }
  
  function toTitleCase(str: string): string {
    return str
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  const httpServer = createServer(app);
  return httpServer;
}
