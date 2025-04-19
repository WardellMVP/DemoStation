import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-provider';
import { UserScenarioUsage, ScenarioExecution } from '@/lib/types';

export function useUserData() {
  const { isAuthenticated } = useAuth();
  
  // Get user's scenario usage history
  const { 
    data: scenarioUsage = [], 
    isLoading: isLoadingUsage,
    error: usageError 
  } = useQuery<UserScenarioUsage[]>({
    queryKey: ['/api/user/scenario-usage'],
    enabled: isAuthenticated,
  });
  
  // Get user's execution history
  const {
    data: executionHistory = [],
    isLoading: isLoadingExecutions,
    error: executionsError
  } = useQuery<ScenarioExecution[]>({
    queryKey: ['/api/user/executions'],
    enabled: isAuthenticated,
  });
  
  return {
    scenarioUsage,
    isLoadingUsage,
    usageError,
    executionHistory,
    isLoadingExecutions,
    executionsError,
    isLoading: isLoadingUsage || isLoadingExecutions,
    hasErrors: !!usageError || !!executionsError
  };
}