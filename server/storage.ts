import { 
  User, 
  InsertUser, 
  Script, 
  InsertScript, 
  ScriptExecution, 
  InsertScriptExecution,
  ScriptCategory,
  InsertScriptCategory
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserToken(id: number, gitlabToken: string): Promise<User | undefined>;
  
  // Script operations
  getScripts(): Promise<Script[]>;
  getScriptsByUser(userId: number): Promise<Script[]>;
  getScriptsByCategory(category: string): Promise<Script[]>;
  getScript(id: number): Promise<Script | undefined>;
  createScript(script: InsertScript): Promise<Script>;
  updateScript(id: number, script: Partial<Script>): Promise<Script | undefined>;
  deleteScript(id: number): Promise<boolean>;
  
  // Script execution operations
  getScriptExecutions(scriptId: number): Promise<ScriptExecution[]>;
  createScriptExecution(execution: InsertScriptExecution): Promise<ScriptExecution>;
  
  // Category operations
  getCategories(): Promise<ScriptCategory[]>;
  createCategory(category: InsertScriptCategory): Promise<ScriptCategory>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scripts: Map<number, Script>;
  private executions: Map<number, ScriptExecution>;
  private categories: Map<number, ScriptCategory>;
  private currentUserId: number;
  private currentScriptId: number;
  private currentExecutionId: number;
  private currentCategoryId: number;

  constructor() {
    this.users = new Map();
    this.scripts = new Map();
    this.executions = new Map();
    this.categories = new Map();
    this.currentUserId = 1;
    this.currentScriptId = 1;
    this.currentExecutionId = 1;
    this.currentCategoryId = 1;
    
    // Add default categories
    this.createCategory({ name: 'Security', icon: 'shield-check', color: 'green' });
    this.createCategory({ name: 'Analytics', icon: 'bar-chart', color: 'blue' });
    this.createCategory({ name: 'Data', icon: 'database-2', color: 'purple' });
    this.createCategory({ name: 'Automation', icon: 'robot', color: 'amber' });
    this.createCategory({ name: 'Utility', icon: 'file-transfer', color: 'teal' });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserToken(id: number, gitlabToken: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, gitlabToken };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Script operations
  async getScripts(): Promise<Script[]> {
    return Array.from(this.scripts.values());
  }
  
  async getScriptsByUser(userId: number): Promise<Script[]> {
    return Array.from(this.scripts.values()).filter(
      (script) => script.userId === userId,
    );
  }
  
  async getScriptsByCategory(category: string): Promise<Script[]> {
    return Array.from(this.scripts.values()).filter(
      (script) => script.category === category,
    );
  }
  
  async getScript(id: number): Promise<Script | undefined> {
    return this.scripts.get(id);
  }
  
  async createScript(insertScript: InsertScript): Promise<Script> {
    const id = this.currentScriptId++;
    const script: Script = { ...insertScript, id };
    this.scripts.set(id, script);
    return script;
  }
  
  async updateScript(id: number, scriptUpdate: Partial<Script>): Promise<Script | undefined> {
    const script = await this.getScript(id);
    if (!script) return undefined;
    
    const updatedScript = { ...script, ...scriptUpdate };
    this.scripts.set(id, updatedScript);
    return updatedScript;
  }
  
  async deleteScript(id: number): Promise<boolean> {
    return this.scripts.delete(id);
  }
  
  // Script execution operations
  async getScriptExecutions(scriptId: number): Promise<ScriptExecution[]> {
    return Array.from(this.executions.values()).filter(
      (execution) => execution.scriptId === scriptId,
    );
  }
  
  async createScriptExecution(insertExecution: InsertScriptExecution): Promise<ScriptExecution> {
    const id = this.currentExecutionId++;
    const execution: ScriptExecution = { ...insertExecution, id };
    this.executions.set(id, execution);
    return execution;
  }
  
  // Category operations
  async getCategories(): Promise<ScriptCategory[]> {
    return Array.from(this.categories.values());
  }
  
  async createCategory(insertCategory: InsertScriptCategory): Promise<ScriptCategory> {
    const id = this.currentCategoryId++;
    const category: ScriptCategory = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
}

export const storage = new MemStorage();
