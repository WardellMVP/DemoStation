import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Global GitLab configuration
export const gitlabConfig = pgTable("gitlab_config", {
  id: serial("id").primaryKey(),
  apiKey: text("api_key"),
  projectId: text("project_id"),
  scenariosPath: text("scenarios_path").default("scenarios"),
  baseUrl: text("base_url").default("https://gitlab.com"),
});

export const insertGitlabConfigSchema = createInsertSchema(gitlabConfig).omit({
  id: true,
});

// User accounts for Okta SSO
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  oktaId: text("okta_id").unique().notNull(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  lastLogin: timestamp("last_login").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Threat scenarios table (replaces scripts)
export const threatScenarios = pgTable("threat_scenarios", {
  id: serial("id").primaryKey(), 
  name: text("name").notNull(),
  description: text("description"),
  folderPath: text("folder_path").notNull(),
  scriptPath: text("script_path").notNull(),
  configPath: text("config_path").notNull(),
  readmePath: text("readme_path"),
  lastUpdated: text("last_updated"),
  readmeContent: text("readme_content"),
});

export const insertThreatScenarioSchema = createInsertSchema(threatScenarios).omit({
  id: true,
});

// User scenario usage tracking
export const userScenarioUsage = pgTable("user_scenario_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  scenarioId: integer("scenario_id").references(() => threatScenarios.id).notNull(),
  usedAt: timestamp("used_at").defaultNow().notNull(),
  configSnapshot: jsonb("config_snapshot"),
});

export const insertUserScenarioUsageSchema = createInsertSchema(userScenarioUsage).omit({
  id: true,
  usedAt: true,
});

// Scenario executions to track history
export const scenarioExecutions = pgTable("scenario_executions", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id").references(() => threatScenarios.id),
  userId: integer("user_id").references(() => users.id),
  timestamp: text("timestamp").notNull(),
  status: text("status").notNull(),
  output: text("output"),
  configSnapshot: jsonb("config_snapshot"),
});

export const insertScenarioExecutionSchema = createInsertSchema(scenarioExecutions).omit({
  id: true,
});

// Configuration parameter schema
export const configParameters = pgTable("config_parameters", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id").references(() => threatScenarios.id),
  name: text("name").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  type: text("type").notNull(), // string, number, boolean, select
  defaultValue: text("default_value"),
  required: boolean("required").default(false),
  options: jsonb("options"), // For select type parameters
});

export const insertConfigParameterSchema = createInsertSchema(configParameters).omit({
  id: true,
});

// Type definitions
export type GitlabConfig = typeof gitlabConfig.$inferSelect;
export type InsertGitlabConfig = z.infer<typeof insertGitlabConfigSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserScenarioUsage = typeof userScenarioUsage.$inferSelect;
export type InsertUserScenarioUsage = z.infer<typeof insertUserScenarioUsageSchema>;

export type ThreatScenario = typeof threatScenarios.$inferSelect;
export type InsertThreatScenario = z.infer<typeof insertThreatScenarioSchema>;

export type ScenarioExecution = typeof scenarioExecutions.$inferSelect;
export type InsertScenarioExecution = z.infer<typeof insertScenarioExecutionSchema>;

export type ConfigParameter = typeof configParameters.$inferSelect;
export type InsertConfigParameter = z.infer<typeof insertConfigParameterSchema>;

// Define YAML Config Schema for parsing configuration files
export const yamlConfigSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  parameters: z.record(z.any()).optional(),
});

// Parameter type for form generation
export const configParameterSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(["string", "number", "boolean", "select"]),
  defaultValue: z.any(),
  description: z.string().optional(),
  required: z.boolean().optional().default(false),
  options: z.array(z.object({
    label: z.string(),
    value: z.any()
  })).optional(),
});

export type YamlConfig = z.infer<typeof yamlConfigSchema>;
export type ConfigParameterType = z.infer<typeof configParameterSchema>;
