import { Cog, Server, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GitLabConfig } from "@/components/settings/gitlab-config";
import { useScenarios } from "@/hooks/use-scenarios";
import { GlowCard } from "@/components/ui/glow-card";

export default function Settings() {
  const { reloadScenarios } = useScenarios();
  
  const handleReloadScenarios = () => {
    reloadScenarios.mutate();
  };
  
  return (
    <div className="max-w-3xl">
      <div className="mb-6 fade-in">
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Settings</h2>
        <p className="text-gray-400 text-sm max-w-2xl">
          Configure your GitLab integration and Demo<span className="text-[hsl(135,80%,45%)]">Codex</span> preferences
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="fade-in">
          <GitLabConfig />
          
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleReloadScenarios}
              disabled={reloadScenarios.isPending}
              className="h-8 text-xs bg-[hsl(135,80%,45%)] hover:bg-[hsl(135,80%,40%)] text-black font-medium border-0"
              size="sm"
            >
              {reloadScenarios.isPending ? "Reloading..." : "Reload Scenarios"}
            </Button>
          </div>
        </div>
        
        <GlowCard className="fade-in">
          <div className="border-b border-[#2a2a2a] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Cog className="h-4 w-4 text-[hsl(135,80%,45%)]" />
              <h3 className="text-base font-medium text-white">Application Preferences</h3>
            </div>
            <p className="text-xs text-gray-400 ml-6">
              Customize your experience with Demo<span className="text-[hsl(135,80%,45%)]">Codex</span>
            </p>
          </div>
          
          <div className="divide-y divide-[#2a2a2a]">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Server className="h-4 w-4 mt-0.5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-300">Scenario Execution</p>
                  <p className="text-xs text-gray-500 mt-0.5">Configure how scenarios are executed</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:text-[hsl(135,80%,45%)] hover:bg-[rgba(60,180,80,0.1)] hover:border-[hsl(135,80%,45%)]"
              >
                Configure
              </Button>
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Server className="h-4 w-4 mt-0.5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-300">Default Scenario Location</p>
                  <p className="text-xs text-gray-500 mt-0.5">Set the default location for scenario storage</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:text-[hsl(135,80%,45%)] hover:bg-[rgba(60,180,80,0.1)] hover:border-[hsl(135,80%,45%)]"
              >
                Configure
              </Button>
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Bell className="h-4 w-4 mt-0.5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-300">Notification Settings</p>
                  <p className="text-xs text-gray-500 mt-0.5">Configure notifications for scenario execution</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:text-[hsl(135,80%,45%)] hover:bg-[rgba(60,180,80,0.1)] hover:border-[hsl(135,80%,45%)]"
              >
                Configure
              </Button>
            </div>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
