import { 
  GitlabConfig,
  InsertGitlabConfig,
  ThreatScenario,
  InsertThreatScenario,
  ScenarioExecution,
  InsertScenarioExecution,
  ConfigParameter,
  InsertConfigParameter
} from "@shared/schema";

export interface IStorage {
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
  private gitlabConfig: GitlabConfig | undefined;
  private scenarios: Map<number, ThreatScenario>;
  private executions: Map<number, ScenarioExecution>;
  private parameters: Map<number, ConfigParameter>;
  
  private currentScenarioId: number;
  private currentExecutionId: number;
  private currentParameterId: number;

  constructor() {
    this.scenarios = new Map();
    this.executions = new Map();
    this.parameters = new Map();
    
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
    const scenario: ThreatScenario = { ...insertScenario, id };
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
    const execution: ScenarioExecution = { ...insertExecution, id };
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
    const parameter: ConfigParameter = { ...insertParameter, id };
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
