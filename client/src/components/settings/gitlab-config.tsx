import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useGitLab } from "@/hooks/use-gitlab";
import { GitlabConfig } from "@/lib/types";

export function GitLabConfig() {
  const { config, isLoadingConfig, projectInfo, updateGitlabConfig } = useGitLab();
  
  const [formValues, setFormValues] = useState<{
    apiKey: string;
    projectId: string;
    scenariosPath: string;
    baseUrl: string;
  }>({
    apiKey: '',
    projectId: '',
    scenariosPath: 'threat-scenarios',
    baseUrl: 'https://gitlab.com'
  });
  
  // Update form values when config loads
  useEffect(() => {
    if (config) {
      setFormValues({
        apiKey: config.apiKey || '',
        projectId: config.projectId || '',
        scenariosPath: config.scenariosPath || 'threat-scenarios',
        baseUrl: config.baseUrl || 'https://gitlab.com'
      });
    }
  }, [config]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGitlabConfig.mutate(formValues);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>GitLab Integration</CardTitle>
        <CardDescription>
          Connect to GitLab to load threat scenarios from a repository
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingConfig ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">GitLab API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                value={formValues.apiKey}
                onChange={handleChange}
                placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                required
              />
              <p className="text-sm text-gray-500">
                Create a personal access token with api scope in GitLab
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="baseUrl">GitLab URL</Label>
              <Input
                id="baseUrl"
                name="baseUrl"
                value={formValues.baseUrl}
                onChange={handleChange}
                placeholder="https://gitlab.com"
              />
              <p className="text-sm text-gray-500">
                Leave as default for gitlab.com or specify your self-hosted instance
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID</Label>
              <Input
                id="projectId"
                name="projectId"
                value={formValues.projectId}
                onChange={handleChange}
                placeholder="12345678"
                required
              />
              <p className="text-sm text-gray-500">
                The numeric ID of your GitLab project
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scenariosPath">Scenarios Path</Label>
              <Input
                id="scenariosPath"
                name="scenariosPath"
                value={formValues.scenariosPath}
                onChange={handleChange}
                placeholder="threat-scenarios"
              />
              <p className="text-sm text-gray-500">
                Directory in the repository where scenarios are stored
              </p>
            </div>
            
            {projectInfo && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-700 dark:text-green-400">Connected to GitLab</h4>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  {projectInfo.name} - Last activity {new Date(projectInfo.last_activity_at).toLocaleDateString()}
                </p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={updateGitlabConfig.isPending}
            >
              {updateGitlabConfig.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Configuration'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}