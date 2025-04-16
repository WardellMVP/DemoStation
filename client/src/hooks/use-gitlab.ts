import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { GitlabConfig, GitLabProject } from '@/lib/types';
import { useToast } from './use-toast';

export function useGitLab() {
  const { toast } = useToast();
  
  // Get GitLab configuration
  const {
    data: config,
    isLoading: isLoadingConfig,
    error: configError
  } = useQuery<GitlabConfig>({
    queryKey: ['/api/gitlab/config'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Get project info if we have a config
  const {
    data: projectInfo,
    isLoading: isLoadingProjectInfo
  } = useQuery<GitLabProject>({
    queryKey: ['/api/gitlab/project-info'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!config && !!config.apiKey && !!config.projectId,
  });
  
  // Update GitLab configuration
  const updateGitlabConfig = useMutation({
    mutationFn: async (data: Partial<GitlabConfig>) => {
      return apiRequest('/api/gitlab/config', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'GitLab configuration has been updated',
      });
      // Invalidate the GitLab config query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/gitlab/config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gitlab/project-info'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update GitLab configuration',
        variant: 'destructive',
      });
    },
  });
  
  // Download project files
  const downloadProject = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/gitlab/download-project', {
        method: 'GET',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Project files have been downloaded',
      });
      // Invalidate the scenarios query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to download project files',
        variant: 'destructive',
      });
    },
  });
  
  return {
    config,
    isLoadingConfig,
    configError,
    projectInfo,
    isLoadingProjectInfo,
    updateGitlabConfig,
    downloadProject,
  };
}