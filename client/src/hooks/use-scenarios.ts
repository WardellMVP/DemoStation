import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ThreatScenario, ScenarioExecution } from '@/lib/types';
import { useToast } from './use-toast';

export function useScenarios() {
  const { toast } = useToast();
  
  // Get all scenarios
  const getAllScenarios = () => {
    return useQuery({
      queryKey: ['/api/scenarios'],
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
  
  // Get a single scenario by ID
  const getScenario = (id: number) => {
    return useQuery({
      queryKey: ['/api/scenarios', id],
      enabled: !!id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
  
  // Get scenario parameters
  const getScenarioParameters = (id: number) => {
    return useQuery({
      queryKey: ['/api/scenarios', id, 'parameters'],
      enabled: !!id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
  
  // Get scenario executions
  const getScenarioExecutions = (id: number) => {
    return useQuery<ScenarioExecution[]>({
      queryKey: ['/api/scenarios', id, 'executions'],
      enabled: !!id,
      staleTime: 1000 * 30, // 30 seconds
    });
  };
  
  // Get execution details
  const getExecutionDetails = (id: number) => {
    return useQuery<ScenarioExecution>({
      queryKey: ['/api/executions', id],
      enabled: !!id && id > 0,
      staleTime: 1000 * 30, // 30 seconds
    });
  };
  
  // Execute a scenario
  const executeScenario = useMutation({
    mutationFn: async ({ id, config }: { id: number; config: any }) => {
      return apiRequest(`/api/scenarios/${id}/execute`, {
        method: 'POST',
        body: JSON.stringify({ config }),
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Success',
        description: 'Scenario execution has started',
      });
      // Invalidate the executions query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios', variables.id, 'executions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to execute scenario',
        variant: 'destructive',
      });
    },
  });
  
  // Reload scenarios from GitLab
  const reloadScenarios = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/reload-scenarios', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Scenarios have been reloaded from GitLab',
      });
      // Invalidate the scenarios query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reload scenarios',
        variant: 'destructive',
      });
    },
  });
  
  return {
    getAllScenarios,
    getScenario,
    getScenarioParameters,
    getScenarioExecutions,
    getExecutionDetails,
    executeScenario,
    reloadScenarios,
  };
}