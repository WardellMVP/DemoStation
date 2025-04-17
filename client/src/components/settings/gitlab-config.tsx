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
    <div className="rounded-lg overflow-hidden border border-[#1A2328] bg-[#0F1419]">
      <div className="border-b border-[#1A2328] p-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-medium text-white">GitLab Integration</h3>
        </div>
        <p className="text-xs text-gray-400">
          Connect to GitLab to load scenarios from a repository
        </p>
      </div>
      
      <div className="p-5">
        {isLoadingConfig ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium text-gray-300">
                GitLab API Key
              </Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                value={formValues.apiKey}
                onChange={handleChange}
                placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                className="bg-[#131820] border-[#1A2328] text-gray-300 h-9 text-sm focus-visible:ring-emerald-700"
                required
              />
              <p className="text-xs text-gray-500">
                Create a personal access token with api scope in GitLab
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="baseUrl" className="text-sm font-medium text-gray-300">
                GitLab URL
              </Label>
              <Input
                id="baseUrl"
                name="baseUrl"
                value={formValues.baseUrl}
                onChange={handleChange}
                placeholder="https://gitlab.com"
                className="bg-[#131820] border-[#1A2328] text-gray-300 h-9 text-sm focus-visible:ring-emerald-700"
              />
              <p className="text-xs text-gray-500">
                Leave as default for gitlab.com or specify your self-hosted instance
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectId" className="text-sm font-medium text-gray-300">
                Project ID
              </Label>
              <Input
                id="projectId"
                name="projectId"
                value={formValues.projectId}
                onChange={handleChange}
                placeholder="12345678"
                className="bg-[#131820] border-[#1A2328] text-gray-300 h-9 text-sm focus-visible:ring-emerald-700"
                required
              />
              <p className="text-xs text-gray-500">
                The numeric ID of your GitLab project
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scenariosPath" className="text-sm font-medium text-gray-300">
                Scenarios Path
              </Label>
              <Input
                id="scenariosPath"
                name="scenariosPath"
                value={formValues.scenariosPath}
                onChange={handleChange}
                placeholder="threat-scenarios"
                className="bg-[#131820] border-[#1A2328] text-gray-300 h-9 text-sm focus-visible:ring-emerald-700"
              />
              <p className="text-xs text-gray-500">
                Directory in the repository where scenarios are stored
              </p>
            </div>
            
            {projectInfo && (
              <div className="mt-4 p-4 bg-[#1A2A20] border border-[#1A3A25] text-emerald-300 rounded">
                <h4 className="font-medium text-emerald-400">Connected to GitLab</h4>
                <p className="text-xs mt-1 text-gray-300">
                  {projectInfo.name} - Last activity {new Date(projectInfo.last_activity_at).toLocaleDateString()}
                </p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-[#1A2A20] text-emerald-400 hover:bg-[#1A2A20]/80 border-0 h-9 text-sm"
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
      </div>
    </div>
  );
}