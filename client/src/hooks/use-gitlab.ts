import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GitLabProject } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function useGitLab() {
  const { toast } = useToast();
  
  // Get GitLab projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<GitLabProject[]>({
    queryKey: ['/api/gitlab/projects'],
    retry: 1,
    onError: (error) => {
      toast({
        title: "Failed to fetch GitLab projects",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Get file content
  const getFileContent = (projectId: string, filePath: string, ref: string = 'main') => {
    return useQuery<{ content: string }>({
      queryKey: [`/api/gitlab/files?projectId=${projectId}&path=${filePath}&ref=${ref}`],
      enabled: !!projectId && !!filePath,
      retry: 1,
      onError: (error) => {
        toast({
          title: "Failed to fetch file content",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };
  
  // Download file
  const downloadFile = (projectId: string, filePath: string, ref: string = 'main') => {
    window.open(`/api/scripts/download?projectId=${projectId}&filePath=${filePath}&ref=${ref}`, '_blank');
  };
  
  // Update API token
  const updateToken = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/settings/gitlab-token', { token });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "GitLab token updated",
        description: "Your GitLab API token has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update GitLab token",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return {
    projects,
    isLoadingProjects,
    getFileContent,
    downloadFile,
    updateToken,
  };
}
