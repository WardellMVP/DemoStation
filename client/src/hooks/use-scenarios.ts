import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ThreatScenario, ScenarioExecution, ConfigParameter } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function useScenarios() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all scenarios
  const { data: scenarios = [], isLoading: isLoadingScenarios } = useQuery<ThreatScenario[]>({
    queryKey: ['/api/scenarios'],
  });
  
  // Get a single scenario
  const getScenario = (id: number) => {
    return useQuery<ThreatScenario>({
      queryKey: [`/api/scenarios/${id}`],
      enabled: !!id,
    });
  };
  
  // Get configuration parameters for a scenario
  const getScenarioParameters = (id: number) => {
    return useQuery<ConfigParameter[]>({
      queryKey: [`/api/scenarios/${id}/parameters`],
      enabled: !!id,
    });
  };
  
  // Get execution history for a scenario
  const getScenarioExecutions = (id: number) => {
    return useQuery<ScenarioExecution[]>({
      queryKey: [`/api/scenarios/${id}/executions`],
      enabled: !!id,
    });
  };
  
  // Execute a scenario
  const executeScenario = useMutation({
    mutationFn: async ({ id, config }: { id: number, config: any }) => {
      const response = await apiRequest('POST', `/api/scenarios/${id}/execute`, { config });
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Scenario execution started",
        description: "The scenario is now running...",
      });
      // Refresh executions after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [`/api/scenarios/${variables.id}/executions`] });
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Scenario execution failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Get execution details
  const getExecutionDetails = (id: number) => {
    return useQuery<ScenarioExecution>({
      queryKey: [`/api/executions/${id}`],
      enabled: !!id,
    });
  };
  
  // Force reload scenarios from GitLab
  const reloadScenarios = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/reload-scenarios');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Scenarios reloaded",
        description: "Threat scenarios have been reloaded from GitLab.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to reload scenarios",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return {
    scenarios,
    isLoadingScenarios,
    getScenario,
    getScenarioParameters,
    getScenarioExecutions,
    executeScenario,
    getExecutionDetails,
    reloadScenarios
  };
}