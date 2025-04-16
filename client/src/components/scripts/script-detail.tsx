import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Script, ScriptExecution } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YamlEditor } from "./yaml-editor";
import { ScriptConfigForm } from "./script-config-form";
import { ConsoleOutput } from "./console-output";
import { apiRequest } from "@/lib/queryClient";
import { getCategoryIcon, getCategoryColor, cn } from "@/lib/utils";
import { ChevronLeft, Download, PlayCircle } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface ScriptDetailProps {
  id: string;
}

export function ScriptDetailView({ id }: ScriptDetailProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("configuration");
  const [yamlConfig, setYamlConfig] = useState<string>("");
  const [showConsole, setShowConsole] = useState(false);
  
  // Fetch script details
  const { data: script, isLoading: isLoadingScript } = useQuery<Script>({
    queryKey: [`/api/scripts/${id}`],
  });
  
  // Fetch executions
  const { data: executions, isLoading: isLoadingExecutions } = useQuery<ScriptExecution[]>({
    queryKey: [`/api/scripts/${id}/executions`],
    enabled: !!id,
  });
  
  // Fetch YAML config
  const { data: yamlData, isLoading: isLoadingYaml } = useQuery({
    queryKey: [`/api/gitlab/files?projectId=${script?.gitlabProjectId}&path=${script?.configPath}`],
    enabled: !!script?.gitlabProjectId && !!script?.configPath,
  });
  
  // Fetch README
  const { data: readmeData, isLoading: isLoadingReadme } = useQuery({
    queryKey: [`/api/gitlab/files?projectId=${script?.gitlabProjectId}&path=${script?.readmePath}`],
    enabled: !!script?.gitlabProjectId && !!script?.readmePath && activeTab === "readme",
  });
  
  // Fetch script code
  const { data: scriptCode, isLoading: isLoadingCode } = useQuery({
    queryKey: [`/api/gitlab/files?projectId=${script?.gitlabProjectId}&path=${script?.filePath}`],
    enabled: !!script?.gitlabProjectId && !!script?.filePath && activeTab === "code",
  });
  
  // Set YAML config when data is loaded
  useEffect(() => {
    if (yamlData?.content) {
      setYamlConfig(yamlData.content);
    }
  }, [yamlData]);
  
  // Execute script mutation
  const executeScript = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/scripts/${id}/execute`, { yamlConfig });
    },
    onSuccess: () => {
      toast({
        title: "Script execution started",
        description: "The script is now running...",
      });
      setShowConsole(true);
      // Refetch executions after a delay to show new execution
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [`/api/scripts/${id}/executions`] });
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Script execution failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Download script
  const downloadScript = async () => {
    try {
      window.open(`/api/scripts/download?projectId=${script?.gitlabProjectId}&filePath=${script?.filePath}`, '_blank');
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the script",
        variant: "destructive",
      });
    }
  };
  
  if (isLoadingScript) {
    return <div className="py-4 text-center">Loading script details...</div>;
  }
  
  if (!script) {
    return <div className="py-4 text-center">Script not found</div>;
  }
  
  const categoryColor = getCategoryColor(script.category);
  const categoryIcon = getCategoryIcon(script.category);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Breadcrumb navigation */}
      <div className="flex items-center mb-4 text-sm">
        <Link href="/">
          <div className="text-gray-500 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-light flex items-center cursor-pointer">
            <ChevronLeft className="h-4 w-4 mr-1" />
            All Scripts
          </div>
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-700 dark:text-gray-300">{script.name}</span>
      </div>
      
      {/* Script header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "w-10 h-10 rounded-md flex items-center justify-center",
              `bg-${categoryColor}-100 dark:bg-${categoryColor}-900`
            )}>
              <i className={cn(
                `ri-${categoryIcon}`,
                `text-xl text-${categoryColor}-600 dark:text-${categoryColor}-400`
              )}></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{script.name}</h2>
            <Badge 
              variant="outline" 
              className={cn(
                `bg-${categoryColor}-100 dark:bg-${categoryColor}-900`,
                `text-${categoryColor}-800 dark:text-${categoryColor}-200`,
                "border-0"
              )}
            >
              {script.category}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {script.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={downloadScript}
            className="flex items-center"
          >
            <Download className="mr-1.5 h-4 w-4" /> Download
          </Button>
          <Button 
            onClick={() => executeScript.mutate()}
            disabled={executeScript.isPending}
            className="flex items-center"
          >
            <PlayCircle className="mr-1.5 h-4 w-4" /> Run Script
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="border-b border-gray-200 dark:border-gray-700 mb-6 w-full justify-start">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="readme">README</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="history">Run History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configuration" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* YAML Editor */}
            <YamlEditor value={yamlConfig} onChange={setYamlConfig} isLoading={isLoadingYaml} />
            
            {/* Form Editor */}
            <ScriptConfigForm yamlConfig={yamlConfig} onChange={setYamlConfig} isLoading={isLoadingYaml} />
          </div>
        </TabsContent>
        
        <TabsContent value="readme" className="mt-0">
          {isLoadingReadme ? (
            <div className="py-4 text-center">Loading README...</div>
          ) : readmeData?.content ? (
            <div className="bg-white dark:bg-dark-lighter rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
              <div className="prose dark:prose-invert max-w-none">
                {/* This would use a markdown parser in a real app */}
                <pre>{readmeData.content}</pre>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">No README available for this script.</div>
          )}
        </TabsContent>
        
        <TabsContent value="code" className="mt-0">
          {isLoadingCode ? (
            <div className="py-4 text-center">Loading code...</div>
          ) : scriptCode?.content ? (
            <div className="bg-white dark:bg-dark-lighter rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <h3 className="font-medium text-gray-800 dark:text-white">Script Source</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={downloadScript}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <pre className="font-mono text-sm bg-gray-50 dark:bg-dark p-4 rounded-md overflow-auto max-h-[500px]">
                  {scriptCode.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">No source code available for this script.</div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          {isLoadingExecutions ? (
            <div className="py-4 text-center">Loading execution history...</div>
          ) : executions?.length ? (
            <div className="bg-white dark:bg-dark-lighter rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-800 dark:text-white">Execution History</h3>
              </div>
              <div className="p-0">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-lighter divide-y divide-gray-200 dark:divide-gray-700">
                    {executions.map(execution => (
                      <tr key={execution.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(execution.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={execution.status === 'completed' ? 'default' : 
                                    execution.status === 'running' ? 'outline' : 'destructive'}
                          >
                            {execution.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setShowConsole(true);
                              // In a real app, this would load the specific execution's output
                            }}
                          >
                            View Output
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">No execution history for this script.</div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Console Output */}
      {showConsole && (
        <ConsoleOutput onClose={() => setShowConsole(false)} />
      )}
    </motion.div>
  );
}
