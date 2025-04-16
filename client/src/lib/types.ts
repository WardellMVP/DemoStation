export interface Script {
  id: number;
  name: string;
  description: string;
  category: string;
  gitlabProjectId: string;
  filePath: string;
  configPath: string;
  readmePath: string;
  lastUpdated: string;
  userId: number;
}

export interface ScriptCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface ScriptExecution {
  id: number;
  scriptId: number;
  userId: number;
  timestamp: string;
  status: 'running' | 'completed' | 'failed';
  output?: string;
  configSnapshot?: any;
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

export enum FormEditorField {
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
  type: FormEditorField;
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
