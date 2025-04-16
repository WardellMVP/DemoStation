import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GitLabProject, GitlabConfig } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function useGitLab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get GitLab configuration
  const { data: config, isLoading: isLoadingConfig } = useQuery<GitlabConfig>({
    queryKey: ['/api/gitlab/config'],
    retry: 1,
    gcTime: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    throwOnError: false,
  });
  
  // Get GitLab project info
  const { data: projectInfo, isLoading: isLoadingProjectInfo } = useQuery<GitLabProject>({
    queryKey: ['/api/gitlab/project-info'],
    retry: 1,
    enabled: !!config?.projectId,
    gcTime: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    throwOnError: false,
  });
  
  // Get file content
  const getFileContent = (filePath: string, ref: string = 'main') => {
    return useQuery<{ content: string }>({
      queryKey: [`/api/gitlab/file?path=${encodeURIComponent(filePath)}&ref=${ref}`],
      enabled: !!filePath && !!(config && config.projectId),
      retry: 1,
      gcTime: 0,
      throwOnError: false,
    });
  };
  
  // Download project archive
  const downloadProject = (ref: string = 'main') => {
    if (!(config && config.projectId)) {
      toast({
        title: "GitLab not configured",
        description: "Configure GitLab integration first",
        variant: "destructive"
      });
      return;
    }
    window.open(`/api/gitlab/download-project?ref=${ref}`, '_blank');
  };
  
  // Update GitLab configuration
  const updateGitlabConfig = useMutation({
    mutationFn: async (gitlabConfig: {
      apiKey: string;
      projectId: string;
      scenariosPath?: string;
      baseUrl?: string;
    }) => {
      const response = await apiRequest('POST', '/api/gitlab/config', gitlabConfig);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "GitLab configuration updated",
        description: "GitLab integration has been configured successfully. Scenarios will be loaded in the background.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gitlab/config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update GitLab configuration",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return {
    config,
    isLoadingConfig,
    projectInfo,
    isLoadingProjectInfo,
    getFileContent,
    downloadProject,
    updateGitlabConfig,
    isConfigured: !!(config && config.apiKey && config.projectId)
  };
}
