import { useState } from "react";
import { useGitLab } from "@/hooks/use-gitlab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Save, Gitlab } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const { toast } = useToast();
  const { projects, isLoadingProjects, updateToken } = useGitLab();
  const [gitlabToken, setGitlabToken] = useState("");
  
  const handleSaveToken = () => {
    if (!gitlabToken) {
      toast({
        title: "Token required",
        description: "Please enter a Gitlab API token",
        variant: "destructive",
      });
      return;
    }
    
    updateToken.mutate(gitlabToken);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Settings</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure your Gitlab integration and application preferences
        </p>
      </motion.div>
      
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gitlab className="h-5 w-5 mr-2 text-orange-500" />
                Gitlab Integration
              </CardTitle>
              <CardDescription>
                Connect DemoStation to your Gitlab account to access your scripts and repositories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="gitlab-token" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gitlab API Token
                </label>
                <Input
                  id="gitlab-token"
                  type="password"
                  placeholder="Enter your Gitlab API token"
                  value={gitlabToken}
                  onChange={(e) => setGitlabToken(e.target.value)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Create a personal access token with api, read_repository, and read_api scopes.
                </p>
              </div>
              
              <Button 
                onClick={handleSaveToken} 
                disabled={!gitlabToken || updateToken.isPending}
                className="flex items-center"
              >
                {updateToken.isPending ? (
                  <>
                    <Gitlab className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Token
                  </>
                )}
              </Button>
              
              {!projects || projects.length === 0 ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Gitlab Connection Error</AlertTitle>
                  <AlertDescription>
                    Unable to connect to Gitlab. Please check your API token and try again.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertTitle>Connected to Gitlab</AlertTitle>
                  <AlertDescription>
                    Successfully connected to {projects.length} Gitlab {projects.length === 1 ? 'project' : 'projects'}.
                  </AlertDescription>
                </Alert>
              )}
              
              {projects && projects.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Available Projects
                  </h3>
                  <div className="border rounded-md divide-y divide-gray-200 dark:divide-gray-700">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="p-3 text-sm">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {project.description || 'No description'}
                        </div>
                      </div>
                    ))}
                    {projects.length > 5 && (
                      <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                        And {projects.length - 5} more projects...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>
                Customize your experience with DemoStation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Script Execution
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Configure how scripts are executed
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Default Script Location
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Set the default location for script storage
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notification Settings
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Configure notifications for script execution
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
