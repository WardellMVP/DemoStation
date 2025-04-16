import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Script } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function useScripts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all scripts
  const { data: scripts = [], isLoading: isLoadingScripts } = useQuery<Script[]>({
    queryKey: ['/api/scripts'],
  });
  
  // Get scripts by category
  const getScriptsByCategory = (category: string) => {
    return useQuery<Script[]>({
      queryKey: [`/api/scripts?category=${category}`],
    });
  };
  
  // Get a single script
  const getScript = (id: number) => {
    return useQuery<Script>({
      queryKey: [`/api/scripts/${id}`],
      enabled: !!id,
    });
  };
  
  // Create a script
  const createScript = useMutation({
    mutationFn: async (newScript: Omit<Script, 'id'>) => {
      const response = await apiRequest('POST', '/api/scripts', newScript);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Script created",
        description: "Your script has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scripts'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create script",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update a script
  const updateScript = useMutation({
    mutationFn: async ({ id, ...scriptData }: Partial<Script> & { id: number }) => {
      const response = await apiRequest('PUT', `/api/scripts/${id}`, scriptData);
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Script updated",
        description: "Your script has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scripts'] });
      queryClient.invalidateQueries({ queryKey: [`/api/scripts/${variables.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update script",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete a script
  const deleteScript = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/scripts/${id}`);
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "Script deleted",
        description: "Your script has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scripts'] });
      queryClient.invalidateQueries({ queryKey: [`/api/scripts/${id}`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete script",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Execute a script
  const executeScript = useMutation({
    mutationFn: async ({ id, yamlConfig }: { id: number, yamlConfig: string }) => {
      const response = await apiRequest('POST', `/api/scripts/${id}/execute`, { yamlConfig });
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Script execution started",
        description: "The script is now running...",
      });
      // Refresh executions after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [`/api/scripts/${variables.id}/executions`] });
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
  
  return {
    scripts,
    isLoadingScripts,
    getScriptsByCategory,
    getScript,
    createScript,
    updateScript,
    deleteScript,
    executeScript,
  };
}
