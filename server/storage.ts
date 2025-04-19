import { 
  GitlabConfig,
  InsertGitlabConfig,
  ThreatScenario,
  InsertThreatScenario,
  ScenarioExecution,
  InsertScenarioExecution,
  ConfigParameter,
  InsertConfigParameter,
  User,
  InsertUser,
  RunHistory,
  InsertRunHistory
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Run history operations
  getRunHistory(limit?: number): Promise<RunHistory[]>;
  getUserRunHistory(userId: number, limit?: number): Promise<RunHistory[]>;
  createRunHistory(runHistory: InsertRunHistory): Promise<RunHistory>;
  updateRunHistory(id: number, runHistory: Partial<RunHistory>): Promise<RunHistory | undefined>;
  
  // GitLab configuration
  getGitlabConfig(): Promise<GitlabConfig | undefined>;
  updateGitlabConfig(config: InsertGitlabConfig): Promise<GitlabConfig>;
  
  // Threat scenario operations
  getAllScenarios(): Promise<ThreatScenario[]>;
  getScenario(id: number): Promise<ThreatScenario | undefined>;
  createScenario(scenario: InsertThreatScenario): Promise<ThreatScenario>;
  updateScenario(id: number, scenario: Partial<ThreatScenario>): Promise<ThreatScenario | undefined>;
  deleteScenario(id: number): Promise<boolean>;
  
  // Scenario execution operations
  getScenarioExecutions(scenarioId: number): Promise<ScenarioExecution[]>;
  createScenarioExecution(execution: InsertScenarioExecution): Promise<ScenarioExecution>;
  updateScenarioExecution(id: number, execution: Partial<ScenarioExecution>): Promise<ScenarioExecution | undefined>;
  
  // Configuration parameters operations
  getConfigParameters(scenarioId: number): Promise<ConfigParameter[]>;
  createConfigParameter(parameter: InsertConfigParameter): Promise<ConfigParameter>;
  updateConfigParameter(id: number, parameter: Partial<ConfigParameter>): Promise<ConfigParameter | undefined>;
  deleteConfigParameter(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private runHistory: Map<number, RunHistory>;
  private gitlabConfig: GitlabConfig | undefined;
  private scenarios: Map<number, ThreatScenario>;
  private executions: Map<number, ScenarioExecution>;
  private parameters: Map<number, ConfigParameter>;
  
  private currentUserId: number;
  private currentRunHistoryId: number;
  private currentScenarioId: number;
  private currentExecutionId: number;
  private currentParameterId: number;

  constructor() {
    this.users = new Map();
    this.runHistory = new Map();
    this.scenarios = new Map();
    this.executions = new Map();
    this.parameters = new Map();
    
    this.currentUserId = 1;
    this.currentRunHistoryId = 1;
    this.currentScenarioId = 1;
    this.currentExecutionId = 1;
    this.currentParameterId = 1;
    
    // Create initial GitLab config with empty values (to be filled by user)
    this.gitlabConfig = {
      id: 1,
      apiKey: "",
      projectId: "",
      scenariosPath: "scenarios",
      baseUrl: "https://gitlab.com"
    };
    
    // Add some example scenarios for development/testing
    this.createScenario({
      name: "Network Port Scanner",
      description: "Scans a network range for open ports and services",
      folderPath: "scenarios/port_scanner",
      scriptPath: "scenarios/port_scanner/scanner.py",
      configPath: "scenarios/port_scanner/config.yaml",
      readmePath: "scenarios/port_scanner/README.md",
      lastUpdated: new Date().toISOString(),
      readmeContent: "# Port Scanner\n\nA simple port scanner that can detect open ports and services."
    });
    
    this.createScenario({
      name: "SSH Brute Force Simulation",
      description: "Demonstrates SSH brute force attacks against a target",
      folderPath: "scenarios/ssh_bruteforce",
      scriptPath: "scenarios/ssh_bruteforce/bruteforce.py",
      configPath: "scenarios/ssh_bruteforce/config.yaml",
      readmePath: "scenarios/ssh_bruteforce/README.md",
      lastUpdated: new Date().toISOString(),
      readmeContent: "# SSH Brute Force\n\nDemonstrates SSH brute force attacks in a controlled environment."
    });
    
    // Add some example parameters for the port scanner
    this.createConfigParameter({
      scenarioId: 1,
      name: "target_ip",
      label: "Target IP Address",
      description: "The IP address to scan",
      type: "string",
      defaultValue: "192.168.1.1",
      required: true
    });
    
    this.createConfigParameter({
      scenarioId: 1,
      name: "port_range",
      label: "Port Range",
      description: "Range of ports to scan (e.g. 1-1024)",
      type: "string",
      defaultValue: "1-1024",
      required: true
    });
    
    this.createConfigParameter({
      scenarioId: 1,
      name: "scan_type",
      label: "Scan Type",
      description: "Type of scan to perform",
      type: "select",
      defaultValue: "TCP",
      required: true,
      options: [
        { label: "TCP Connect Scan", value: "TCP" },
        { label: "SYN Scan", value: "SYN" },
        { label: "UDP Scan", value: "UDP" }
      ]
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      email: insertUser.email,
      name: insertUser.name || null,
      provider: insertUser.provider,
      providerId: insertUser.providerId,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Run history operations
  async getRunHistory(limit: number = 10): Promise<RunHistory[]> {
    return Array.from(this.runHistory.values())
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }
  
  async getUserRunHistory(userId: number, limit: number = 10): Promise<RunHistory[]> {
    return Array.from(this.runHistory.values())
      .filter(run => run.userId === userId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }
  
  async createRunHistory(insertRunHistory: InsertRunHistory): Promise<RunHistory> {
    const id = this.currentRunHistoryId++;
    const runHistory: RunHistory = {
      id,
      userId: insertRunHistory.userId,
      scenarioId: insertRunHistory.scenarioId,
      startedAt: insertRunHistory.startedAt || new Date(),
      finishedAt: insertRunHistory.finishedAt || null,
      status: insertRunHistory.status,
      artefactPath: insertRunHistory.artefactPath || null
    };
    this.runHistory.set(id, runHistory);
    return runHistory;
  }
  
  async updateRunHistory(id: number, runHistoryUpdate: Partial<RunHistory>): Promise<RunHistory | undefined> {
    const runHistory = this.runHistory.get(id);
    if (!runHistory) return undefined;
    
    const updatedRunHistory = { ...runHistory, ...runHistoryUpdate };
    this.runHistory.set(id, updatedRunHistory);
    return updatedRunHistory;
  }
  
  // GitLab Configuration
  async getGitlabConfig(): Promise<GitlabConfig | undefined> {
    return this.gitlabConfig;
  }
  
  async updateGitlabConfig(config: InsertGitlabConfig): Promise<GitlabConfig> {
    // Ensure required fields are present with non-undefined values
    const updatedConfig: GitlabConfig = {
      id: 1,
      apiKey: config.apiKey || this.gitlabConfig?.apiKey || "",
      projectId: config.projectId || this.gitlabConfig?.projectId || "",
      scenariosPath: config.scenariosPath || this.gitlabConfig?.scenariosPath || "scenarios",
      baseUrl: config.baseUrl || this.gitlabConfig?.baseUrl || "https://gitlab.com"
    };
    
    this.gitlabConfig = updatedConfig;
    return this.gitlabConfig;
  }

  // Threat Scenario operations
  async getAllScenarios(): Promise<ThreatScenario[]> {
    return Array.from(this.scenarios.values());
  }
  
  async getScenario(id: number): Promise<ThreatScenario | undefined> {
    return this.scenarios.get(id);
  }
  
  async createScenario(insertScenario: InsertThreatScenario): Promise<ThreatScenario> {
    const id = this.currentScenarioId++;
    // Ensure all required fields have non-undefined values
    const scenario: ThreatScenario = {
      id,
      name: insertScenario.name,
      description: insertScenario.description || null,
      folderPath: insertScenario.folderPath,
      scriptPath: insertScenario.scriptPath,
      configPath: insertScenario.configPath,
      readmePath: insertScenario.readmePath || null,
      lastUpdated: insertScenario.lastUpdated || null,
      readmeContent: insertScenario.readmeContent || null
    };
    this.scenarios.set(id, scenario);
    return scenario;
  }
  
  async updateScenario(id: number, scenarioUpdate: Partial<ThreatScenario>): Promise<ThreatScenario | undefined> {
    const scenario = await this.getScenario(id);
    if (!scenario) return undefined;
    
    const updatedScenario = { ...scenario, ...scenarioUpdate };
    this.scenarios.set(id, updatedScenario);
    return updatedScenario;
  }
  
  async deleteScenario(id: number): Promise<boolean> {
    return this.scenarios.delete(id);
  }
  
  // Scenario execution operations
  async getScenarioExecutions(scenarioId: number): Promise<ScenarioExecution[]> {
    return Array.from(this.executions.values())
      .filter(execution => execution.scenarioId === scenarioId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  async createScenarioExecution(insertExecution: InsertScenarioExecution): Promise<ScenarioExecution> {
    const id = this.currentExecutionId++;
    // Ensure all required fields have non-undefined values
    const execution: ScenarioExecution = {
      id,
      userId: insertExecution.userId || null,
      scenarioId: insertExecution.scenarioId || null,
      timestamp: insertExecution.timestamp,
      status: insertExecution.status,
      output: insertExecution.output || null,
      configSnapshot: insertExecution.configSnapshot || {}
    };
    this.executions.set(id, execution);
    return execution;
  }
  
  async updateScenarioExecution(id: number, executionUpdate: Partial<ScenarioExecution>): Promise<ScenarioExecution | undefined> {
    const execution = this.executions.get(id);
    if (!execution) return undefined;
    
    const updatedExecution = { ...execution, ...executionUpdate };
    this.executions.set(id, updatedExecution);
    return updatedExecution;
  }
  
  // Configuration parameters operations
  async getConfigParameters(scenarioId: number): Promise<ConfigParameter[]> {
    return Array.from(this.parameters.values())
      .filter(param => param.scenarioId === scenarioId);
  }
  
  async createConfigParameter(insertParameter: InsertConfigParameter): Promise<ConfigParameter> {
    const id = this.currentParameterId++;
    // Ensure all required fields have non-undefined values
    const parameter: ConfigParameter = {
      id,
      name: insertParameter.name,
      label: insertParameter.label,
      type: insertParameter.type,
      scenarioId: insertParameter.scenarioId || null,
      description: insertParameter.description || null,
      defaultValue: insertParameter.defaultValue || null,
      required: insertParameter.required || null,
      options: insertParameter.options || {}
    };
    this.parameters.set(id, parameter);
    return parameter;
  }
  
  async updateConfigParameter(id: number, parameterUpdate: Partial<ConfigParameter>): Promise<ConfigParameter | undefined> {
    const parameter = this.parameters.get(id);
    if (!parameter) return undefined;
    
    const updatedParameter = { ...parameter, ...parameterUpdate };
    this.parameters.set(id, updatedParameter);
    return updatedParameter;
  }
  
  async deleteConfigParameter(id: number): Promise<boolean> {
    return this.parameters.delete(id);
  }
}

export const storage = new MemStorage();
