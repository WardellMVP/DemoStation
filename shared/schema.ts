import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  gitlabToken: text("gitlab_token"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  gitlabToken: true,
});

// Scripts table to store script metadata
export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(), 
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  gitlabProjectId: text("gitlab_project_id"),
  filePath: text("file_path"),
  configPath: text("config_path"),
  readmePath: text("readme_path"),
  lastUpdated: text("last_updated"),
  userId: integer("user_id").references(() => users.id),
});

export const insertScriptSchema = createInsertSchema(scripts).omit({
  id: true,
});

// Script executions to track history
export const scriptExecutions = pgTable("script_executions", {
  id: serial("id").primaryKey(),
  scriptId: integer("script_id").references(() => scripts.id),
  userId: integer("user_id").references(() => users.id),
  timestamp: text("timestamp").notNull(),
  status: text("status").notNull(),
  output: text("output"),
  configSnapshot: jsonb("config_snapshot"),
});

export const insertScriptExecutionSchema = createInsertSchema(scriptExecutions).omit({
  id: true,
});

// Script categories
export const scriptCategories = pgTable("script_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon"),
  color: text("color"),
});

export const insertScriptCategorySchema = createInsertSchema(scriptCategories).omit({
  id: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Script = typeof scripts.$inferSelect;
export type InsertScript = z.infer<typeof insertScriptSchema>;

export type ScriptExecution = typeof scriptExecutions.$inferSelect;
export type InsertScriptExecution = z.infer<typeof insertScriptExecutionSchema>;

export type ScriptCategory = typeof scriptCategories.$inferSelect;
export type InsertScriptCategory = z.infer<typeof insertScriptCategorySchema>;

// Define API types
export const yamlConfigSchema = z.object({
  content: z.string(),
});

export type YamlConfig = z.infer<typeof yamlConfigSchema>;
