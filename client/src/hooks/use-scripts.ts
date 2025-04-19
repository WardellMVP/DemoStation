import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ThreatScenario } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function useScripts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all scenarios
  const { data: scripts = [], isLoading: isLoadingScripts } = useQuery<ThreatScenario[]>({
    queryKey: ['/api/scenarios'],
  });
  
  // Get a single scenario
  const getScript = (id: number) => {
    return useQuery<ThreatScenario>({
      queryKey: ['/api/scenarios', id],
      enabled: !!id,
    });
  };
  
  // Create a scenario
  const createScript = useMutation({
    mutationFn: async (newScenario: Omit<ThreatScenario, 'id'>) => {
      const response = await apiRequest('POST', '/api/scenarios', newScenario);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Scenario created",
        description: "Your threat scenario has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create scenario",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update a scenario
  const updateScript = useMutation({
    mutationFn: async ({ id, ...scenarioData }: Partial<ThreatScenario> & { id: number }) => {
      const response = await apiRequest('PUT', `/api/scenarios/${id}`, scenarioData);
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Scenario updated",
        description: "Your threat scenario has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios', variables.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update scenario",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete a scenario
  const deleteScript = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/scenarios/${id}`, null);
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "Scenario deleted",
        description: "Your threat scenario has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios', id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete scenario",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Execute a scenario
  const executeScript = useMutation({
    mutationFn: async ({ id, configParams }: { id: number, configParams: Record<string, any> }) => {
      const response = await apiRequest('POST', `/api/scenarios/${id}/execute`, configParams);
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Scenario execution started",
        description: "The threat scenario is now running...",
      });
      // Refresh executions after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/scenarios', variables.id, 'executions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/executions'] });
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Scenario execution failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return {
    scripts,
    isLoadingScripts,
    getScript,
    createScript,
    updateScript,
    deleteScript,
    executeScript,
  };
}
