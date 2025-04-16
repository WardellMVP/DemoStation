import { useState } from "react";
import { useGitLab } from "@/hooks/use-gitlab";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Save, GitMerge, Cog, Server, Bell, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const { toast } = useToast();
  const { projects, isLoadingProjects, updateToken } = useGitLab();
  const [gitlabToken, setGitlabToken] = useState("");
  
  const handleSaveToken = () => {
    if (!gitlabToken) {
      toast({
        title: "Token required",
        description: "Please enter a GitLab API token",
        variant: "destructive",
      });
      return;
    }
    
    updateToken.mutate(gitlabToken);
  };
  
  return (
    <div className="max-w-3xl">
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-white mb-2">Settings</h2>
        <p className="text-sm text-gray-400">
          Configure your GitLab integration and application preferences
        </p>
      </motion.div>
      
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="bg-[#0F1419] border border-[#1A2328] rounded">
            <div className="border-b border-[#1A2328] p-4">
              <div className="flex items-center gap-2 mb-1">
                <GitMerge className="h-4 w-4 text-gray-400" />
                <h3 className="text-base font-medium text-white">GitLab Integration</h3>
              </div>
              <p className="text-xs text-gray-400 ml-6">
                Connect to your GitLab account to access scripts and repositories
              </p>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <label htmlFor="gitlab-token" className="text-sm font-medium text-gray-300">
                  GitLab API Token
                </label>
                <Input
                  id="gitlab-token"
                  type="password"
                  placeholder="Enter your GitLab API token"
                  value={gitlabToken}
                  onChange={(e) => setGitlabToken(e.target.value)}
                  className="bg-[#131820] border-[#1A2328] text-gray-300 h-9 text-sm focus-visible:ring-emerald-700"
                />
                <p className="text-xs text-gray-500">
                  Create a personal access token with api, read_repository, and read_api scopes
                </p>
              </div>
              
              <Button 
                onClick={handleSaveToken} 
                disabled={!gitlabToken || updateToken.isPending}
                className="bg-[#1A2A20] text-emerald-400 hover:bg-[#1A2A20]/80 border-0 h-9 text-sm"
              >
                {updateToken.isPending ? (
                  <>
                    <GitMerge className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-3.5 w-3.5" />
                    Save Token
                  </>
                )}
              </Button>
              
              {!projects || projects.length === 0 ? (
                <div className="bg-[#1A1A1A] border border-[#331A1A] text-red-300 p-3 text-sm rounded flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-400" />
                  <div>
                    <p className="font-medium">GitLab Connection Error</p>
                    <p className="text-xs mt-0.5 text-gray-400">Unable to connect to GitLab. Please check your API token and try again.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1A2A20] border border-[#1A3A25] text-emerald-300 p-3 text-sm rounded flex items-start gap-2">
                  <GitMerge className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-400" />
                  <div>
                    <p className="font-medium">Connected to GitLab</p>
                    <p className="text-xs mt-0.5 text-gray-300">Successfully connected to {projects.length} GitLab {projects.length === 1 ? 'project' : 'projects'}</p>
                  </div>
                </div>
              )}
              
              {projects && projects.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-300">
                      Available Projects
                    </h4>
                    <span className="text-xs text-emerald-500">{projects.length} found</span>
                  </div>
                  
                  <div className="bg-[#131820] border border-[#1A2328] rounded overflow-hidden divide-y divide-[#1A2328]">
                    {projects.slice(0, 4).map((project) => (
                      <div key={project.id} className="p-3 text-sm flex justify-between items-center group">
                        <div>
                          <div className="font-medium text-gray-200">{project.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {project.description || 'No description'}
                          </div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                    {projects.length > 4 && (
                      <div className="p-2 text-center text-xs text-gray-500">
                        And {projects.length - 4} more projects
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="bg-[#0F1419] border border-[#1A2328] rounded">
            <div className="border-b border-[#1A2328] p-4">
              <div className="flex items-center gap-2 mb-1">
                <Cog className="h-4 w-4 text-gray-400" />
                <h3 className="text-base font-medium text-white">Application Preferences</h3>
              </div>
              <p className="text-xs text-gray-400 ml-6">
                Customize your experience with ScriptHub
              </p>
            </div>
            
            <div className="divide-y divide-[#1A2328]">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Server className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-300">Script Execution</p>
                    <p className="text-xs text-gray-500 mt-0.5">Configure how scripts are executed</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-xs bg-transparent border-[#1A2328] text-gray-400 hover:text-emerald-400 hover:bg-[#1A2A20]/20 hover:border-emerald-900"
                >
                  Configure
                </Button>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Server className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-300">Default Script Location</p>
                    <p className="text-xs text-gray-500 mt-0.5">Set the default location for script storage</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-xs bg-transparent border-[#1A2328] text-gray-400 hover:text-emerald-400 hover:bg-[#1A2A20]/20 hover:border-emerald-900"
                >
                  Configure
                </Button>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-300">Notification Settings</p>
                    <p className="text-xs text-gray-500 mt-0.5">Configure notifications for script execution</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-xs bg-transparent border-[#1A2328] text-gray-400 hover:text-emerald-400 hover:bg-[#1A2A20]/20 hover:border-emerald-900"
                >
                  Configure
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
