import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import axios from "axios";
import { 
  insertScriptSchema, 
  insertScriptExecutionSchema,
  yamlConfigSchema,
  InsertScriptExecution
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // GitLab API endpoints
  app.get('/api/gitlab/projects', async (req: Request, res: Response) => {
    try {
      const token = process.env.GITLAB_API_TOKEN || '';
      if (!token) {
        return res.status(401).json({ message: 'GitLab token not configured' });
      }
      
      const response = await axios.get('https://gitlab.com/api/v4/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          membership: true
        }
      });
      
      res.json(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.status(error.response?.status || 500).json({ 
          message: error.response?.data?.message || 'Error fetching GitLab projects' 
        });
      } else {
        console.error('GitLab API error:', error);
        res.status(500).json({ message: 'Error fetching GitLab projects' });
      }
    }
  });
  
  app.get('/api/gitlab/files', async (req: Request, res: Response) => {
    try {
      const token = process.env.GITLAB_API_TOKEN || '';
      const { projectId, path: filePath, ref = 'main' } = req.query;
      
      if (!token) {
        return res.status(401).json({ message: 'GitLab token not configured' });
      }
      
      if (!projectId || !filePath) {
        return res.status(400).json({ message: 'Project ID and file path are required' });
      }
      
      const encodedFilePath = encodeURIComponent(filePath as string);
      const url = `https://gitlab.com/api/v4/projects/${projectId}/repository/files/${encodedFilePath}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          ref
        }
      });
      
      // GitLab returns base64 encoded content
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      res.json({ content });
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
  
  // Download script from GitLab
  app.get('/api/scripts/download', async (req: Request, res: Response) => {
    try {
      const token = process.env.GITLAB_API_TOKEN || '';
      const { projectId, filePath, ref = 'main' } = req.query;
      
      if (!token) {
        return res.status(401).json({ message: 'GitLab token not configured' });
      }
      
      if (!projectId || !filePath) {
        return res.status(400).json({ message: 'Project ID and file path are required' });
      }
      
      const encodedFilePath = encodeURIComponent(filePath as string);
      const url = `https://gitlab.com/api/v4/projects/${projectId}/repository/files/${encodedFilePath}/raw`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          ref
        },
        responseType: 'arraybuffer'
      });
      
      // Set appropriate headers for download
      const filename = (filePath as string).split('/').pop() || 'script.py';
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.status(error.response?.status || 500).json({ 
          message: error.response?.data?.message || 'Error downloading file from GitLab' 
        });
      } else {
        console.error('GitLab API error:', error);
        res.status(500).json({ message: 'Error downloading file from GitLab' });
      }
    }
  });
  
  // Script CRUD operations
  app.get('/api/scripts', async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      let scripts;
      
      if (category) {
        scripts = await storage.getScriptsByCategory(category);
      } else {
        scripts = await storage.getScripts();
      }
      
      res.json(scripts);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      res.status(500).json({ message: 'Error fetching scripts' });
    }
  });
  
  app.get('/api/scripts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const script = await storage.getScript(id);
      
      if (!script) {
        return res.status(404).json({ message: 'Script not found' });
      }
      
      res.json(script);
    } catch (error) {
      console.error('Error fetching script:', error);
      res.status(500).json({ message: 'Error fetching script' });
    }
  });
  
  app.post('/api/scripts', async (req: Request, res: Response) => {
    try {
      const scriptData = insertScriptSchema.parse(req.body);
      const script = await storage.createScript(scriptData);
      res.status(201).json(script);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error('Error creating script:', error);
        res.status(500).json({ message: 'Error creating script' });
      }
    }
  });
  
  app.put('/api/scripts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const scriptData = req.body;
      
      const updatedScript = await storage.updateScript(id, scriptData);
      
      if (!updatedScript) {
        return res.status(404).json({ message: 'Script not found' });
      }
      
      res.json(updatedScript);
    } catch (error) {
      console.error('Error updating script:', error);
      res.status(500).json({ message: 'Error updating script' });
    }
  });
  
  app.delete('/api/scripts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteScript(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Script not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting script:', error);
      res.status(500).json({ message: 'Error deleting script' });
    }
  });
  
  // Script execution endpoint
  app.post('/api/scripts/:id/execute', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { yamlConfig } = req.body;
      
      const script = await storage.getScript(id);
      
      if (!script) {
        return res.status(404).json({ message: 'Script not found' });
      }
      
      if (!script.gitlabProjectId || !script.filePath) {
        return res.status(400).json({ message: 'Script has no GitLab file information' });
      }
      
      // Get script content from GitLab
      const token = process.env.GITLAB_API_TOKEN || '';
      const encodedFilePath = encodeURIComponent(script.filePath);
      const url = `https://gitlab.com/api/v4/projects/${script.gitlabProjectId}/repository/files/${encodedFilePath}/raw`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          ref: 'main'
        }
      });
      
      // Create temporary directory for execution
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scriptExecutor-'));
      const scriptPath = path.join(tempDir, 'script.py');
      const configPath = path.join(tempDir, 'config.yaml');
      
      // Write script and config to temp files
      await fs.writeFile(scriptPath, response.data);
      
      if (yamlConfig) {
        await fs.writeFile(configPath, yamlConfig);
      }
      
      // Execute the script
      const scriptExecution = {
        scriptId: id,
        userId: 1, // Assuming user 1 for now
        timestamp: new Date().toISOString(),
        status: 'running',
        configSnapshot: yamlConfig,
      };
      
      let executionRecord = await storage.createScriptExecution(scriptExecution);
      
      // Execute with python
      exec(`python ${scriptPath} --config ${configPath}`, async (error, stdout, stderr) => {
        const output = stdout + (stderr ? `\nErrors:\n${stderr}` : '');
        const status = error ? 'failed' : 'completed';
        
        // Update execution record
        const updatedExecution = {
          scriptId: executionRecord.scriptId,
          userId: executionRecord.userId,
          timestamp: executionRecord.timestamp,
          status: status,
          output: output,
          configSnapshot: executionRecord.configSnapshot as Json
        };
        
        await storage.createScriptExecution(updatedExecution);
        
        // Clean up temp files
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (err) {
          console.error('Error cleaning up temp files:', err);
        }
      });
      
      res.status(202).json({ message: 'Script execution started', executionId: executionRecord.id });
    } catch (error) {
      console.error('Error executing script:', error);
      res.status(500).json({ message: 'Error executing script' });
    }
  });
  
  // Get script execution history
  app.get('/api/scripts/:id/executions', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const executions = await storage.getScriptExecutions(id);
      res.json(executions);
    } catch (error) {
      console.error('Error fetching script executions:', error);
      res.status(500).json({ message: 'Error fetching script executions' });
    }
  });
  
  // Categories endpoint
  app.get('/api/categories', async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Error fetching categories' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
