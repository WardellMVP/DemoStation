export interface GitlabConfig {
  id: number;
  apiKey: string | null;
  projectId: string | null;
  scenariosPath: string | null;
  baseUrl: string | null;
}

export interface ThreatScenario {
  id: number;
  name: string;
  description: string | null;
  folderPath: string;
  scriptPath: string;
  configPath: string;
  readmePath: string | null;
  lastUpdated: string | null;
  readmeContent: string | null;
}

export interface ScenarioExecution {
  id: number;
  scenarioId: number | null;
  timestamp: string;
  status: 'running' | 'completed' | 'failed';
  output: string | null;
  configSnapshot: any;
}

export interface ConfigParameter {
  id: number;
  scenarioId: number | null;
  name: string;
  label: string;
  description: string | null;
  type: string;
  defaultValue: string | null;
  required: boolean | null;
  options: any;
}

export interface GitLabProject {
  id: number;
  name: string;
  description: string;
  web_url: string;
  last_activity_at: string;
}

export interface GitLabFile {
  file_name: string;
  file_path: string;
  size: number;
  encoding: string;
  content: string;
  content_sha256: string;
  ref: string;
  blob_id: string;
  commit_id: string;
  last_commit_id: string;
}

export interface User {
  id: number;
  username: string;
  gitlabToken?: string;
}

export interface YamlEditorState {
  value: string;
  isValid: boolean;
  error?: string;
}

export enum FormEditorFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
}

export interface FormEditorOption {
  label: string;
  value: string;
}

export interface FormEditorField {
  name: string;
  label: string;
  type: FormEditorFieldType;
  value: any;
  options?: FormEditorOption[];
}

export interface FormEditorSection {
  title: string;
  fields: FormEditorField[];
}

export interface ConsoleOutput {
  id: string;
  timestamp: string;
  text: string;
  type: 'info' | 'warning' | 'error' | 'success';
}
