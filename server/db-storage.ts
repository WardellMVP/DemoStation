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
  UserScenarioUsage,
  InsertUserScenarioUsage,
  users,
  gitlabConfig,
  threatScenarios,
  scenarioExecutions,
  configParameters,
  userScenarioUsage
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { IStorage } from "./storage";
import { db } from "./db";

export class DatabaseStorage implements IStorage {
  // GitLab configuration
  async getGitlabConfig(): Promise<GitlabConfig | undefined> {
    const configs = await db.select().from(gitlabConfig).limit(1);
    return configs.length > 0 ? configs[0] : undefined;
  }

  async updateGitlabConfig(config: InsertGitlabConfig): Promise<GitlabConfig> {
    // Check if exists
    const exists = await this.getGitlabConfig();
    
    if (exists) {
      // Update existing
      const [updated] = await db
        .update(gitlabConfig)
        .set(config)
        .where(eq(gitlabConfig.id, exists.id))
        .returning();
      return updated;
    } else {
      // Create new
      const [created] = await db.insert(gitlabConfig).values(config).returning();
      return created;
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  // No longer needed as we're using local auth only
  async getUserByOktaId(oktaId: string): Promise<User | undefined> {
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email));
    return results.length > 0 ? results[0] : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // User scenario usage operations
  async getUserScenarioUsage(userId: number): Promise<UserScenarioUsage[]> {
    return await db
      .select()
      .from(userScenarioUsage)
      .where(eq(userScenarioUsage.userId, userId))
      .orderBy(desc(userScenarioUsage.usedAt));
  }

  async createUserScenarioUsage(usage: InsertUserScenarioUsage): Promise<UserScenarioUsage> {
    const [created] = await db.insert(userScenarioUsage).values(usage).returning();
    return created;
  }

  // Threat scenario operations
  async getAllScenarios(): Promise<ThreatScenario[]> {
    return await db.select().from(threatScenarios);
  }

  async getScenario(id: number): Promise<ThreatScenario | undefined> {
    const results = await db.select().from(threatScenarios).where(eq(threatScenarios.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async createScenario(scenario: InsertThreatScenario): Promise<ThreatScenario> {
    const [created] = await db.insert(threatScenarios).values(scenario).returning();
    return created;
  }

  async updateScenario(id: number, scenario: Partial<ThreatScenario>): Promise<ThreatScenario | undefined> {
    const [updated] = await db
      .update(threatScenarios)
      .set(scenario)
      .where(eq(threatScenarios.id, id))
      .returning();
    return updated;
  }

  async deleteScenario(id: number): Promise<boolean> {
    const result = await db.delete(threatScenarios).where(eq(threatScenarios.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Scenario execution operations
  async getScenarioExecutions(scenarioId: number): Promise<ScenarioExecution[]> {
    return await db
      .select()
      .from(scenarioExecutions)
      .where(eq(scenarioExecutions.scenarioId, scenarioId))
      .orderBy(desc(scenarioExecutions.timestamp));
  }

  async getUserScenarioExecutions(userId: number): Promise<ScenarioExecution[]> {
    return await db
      .select()
      .from(scenarioExecutions)
      .where(eq(scenarioExecutions.userId, userId))
      .orderBy(desc(scenarioExecutions.timestamp));
  }

  async createScenarioExecution(execution: InsertScenarioExecution): Promise<ScenarioExecution> {
    const [created] = await db.insert(scenarioExecutions).values(execution).returning();
    return created;
  }

  async updateScenarioExecution(id: number, execution: Partial<ScenarioExecution>): Promise<ScenarioExecution | undefined> {
    const [updated] = await db
      .update(scenarioExecutions)
      .set(execution)
      .where(eq(scenarioExecutions.id, id))
      .returning();
    return updated;
  }

  // Configuration parameters operations
  async getConfigParameters(scenarioId: number): Promise<ConfigParameter[]> {
    return await db
      .select()
      .from(configParameters)
      .where(eq(configParameters.scenarioId, scenarioId));
  }

  async createConfigParameter(parameter: InsertConfigParameter): Promise<ConfigParameter> {
    const [created] = await db.insert(configParameters).values(parameter).returning();
    return created;
  }

  async updateConfigParameter(id: number, parameter: Partial<ConfigParameter>): Promise<ConfigParameter | undefined> {
    const [updated] = await db
      .update(configParameters)
      .set(parameter)
      .where(eq(configParameters.id, id))
      .returning();
    return updated;
  }

  async deleteConfigParameter(id: number): Promise<boolean> {
    const result = await db.delete(configParameters).where(eq(configParameters.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}