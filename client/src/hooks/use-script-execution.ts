import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ScriptExecution } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function useScriptExecution(scriptId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get execution history
  const { data: executions = [], isLoading: isLoadingExecutions } = useQuery<ScriptExecution[]>({
    queryKey: [`/api/scripts/${scriptId}/executions`],
    enabled: !!scriptId,
  });
  
  // Execute script
  const executeScript = useMutation({
    mutationFn: async (yamlConfig: string) => {
      const response = await apiRequest('POST', `/api/scripts/${scriptId}/execute`, { yamlConfig });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Script execution started",
        description: "The script is now running...",
      });
      // Refresh executions after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [`/api/scripts/${scriptId}/executions`] });
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Script execution failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Get execution output (would be a real-time connection in a real app)
  const getExecutionOutput = (executionId: number) => {
    return useQuery<string>({
      queryKey: [`/api/scripts/${scriptId}/executions/${executionId}/output`],
      enabled: !!executionId,
      refetchInterval: 2000, // Poll for updates every 2 seconds
    });
  };
  
  return {
    executions,
    isLoadingExecutions,
    executeScript,
    getExecutionOutput,
  };
}
