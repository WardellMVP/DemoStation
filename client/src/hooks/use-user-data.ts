import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/auth-provider';
import { toast } from '@/hooks/use-toast';

interface UserScenarioUsage {
  id: number;
  userId: number;
  scenarioId: number;
  usedAt: string;
  lastUsed: string;
  timesUsed: number;
  scenarioName?: string;
  configSnapshot?: Record<string, any> | null;
}

interface ScenarioExecution {
  id: number;
  userId: number;
  scenarioId: number;
  startedAt: string;
  completedAt: string | null;
  timestamp: string;
  status: string;
  results: string | null;
  output: string | null;
  parameters: Record<string, any> | null;
  configSnapshot?: Record<string, any> | null;
  scenarioName?: string;
}

export function useUserData() {
  const { user, isAuthenticated } = useAuth();
  
  const { data: scenarioUsage = [], isLoading: isUsageLoading } = useQuery<UserScenarioUsage[]>({
    queryKey: ['/api/user/scenario-usage'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const { data: executionHistory = [], isLoading: isHistoryLoading } = useQuery<ScenarioExecution[]>({
    queryKey: ['/api/user/executions'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Get the most recent executions
  const recentExecutions = [...executionHistory]
    .sort((a, b) => {
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
    })
    .slice(0, 5);
  
  // Get the most used scenarios
  const mostUsedScenarios = [...scenarioUsage]
    .sort((a, b) => {
      return b.timesUsed - a.timesUsed;
    })
    .slice(0, 5);
  
  return {
    user,
    scenarioUsage,
    executionHistory,
    recentExecutions,
    mostUsedScenarios,
    isLoading: isUsageLoading || isHistoryLoading
  };
}