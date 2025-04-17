import { Cog, Server, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GitLabConfig } from "@/components/settings/gitlab-config";
import { useScenarios } from "@/hooks/use-scenarios";

export default function Settings() {
  const { reloadScenarios } = useScenarios();
  
  const handleReloadScenarios = () => {
    reloadScenarios.mutate();
  };
  
  return (
    <div className="max-w-3xl">
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Settings</h2>
        <p className="text-gray-400 text-sm max-w-2xl">
          Configure your GitLab integration and Demo<span className="text-emerald-400">Codex</span> preferences
        </p>
      </motion.div>
      
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <GitLabConfig />
          
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleReloadScenarios}
              disabled={reloadScenarios.isPending}
              className="h-8 text-xs bg-[#1A2A20] text-emerald-400 hover:bg-[#1A2A20]/80 border-0"
              size="sm"
            >
              {reloadScenarios.isPending ? "Reloading..." : "Reload Scenarios"}
            </Button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="rounded-lg overflow-hidden border border-[#1A2328] bg-[#0F1419]">
            <div className="border-b border-[#1A2328] p-4">
              <div className="flex items-center gap-2 mb-1">
                <Cog className="h-4 w-4 text-gray-400" />
                <h3 className="text-base font-medium text-white">Application Preferences</h3>
              </div>
              <p className="text-xs text-gray-400 ml-6">
                Customize your experience with Demo<span className="text-emerald-400">Codex</span>
              </p>
            </div>
            
            <div className="divide-y divide-[#1A2328]">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Server className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-300">Scenario Execution</p>
                    <p className="text-xs text-gray-500 mt-0.5">Configure how scenarios are executed</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-xs bg-transparent border-[#1A2328] text-gray-400 hover:text-emerald-400 hover:bg-[#1A2A20]/20 hover:border-emerald-900"
                >
                  Configure
                </Button>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Server className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-300">Default Scenario Location</p>
                    <p className="text-xs text-gray-500 mt-0.5">Set the default location for scenario storage</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-xs bg-transparent border-[#1A2328] text-gray-400 hover:text-emerald-400 hover:bg-[#1A2A20]/20 hover:border-emerald-900"
                >
                  Configure
                </Button>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-300">Notification Settings</p>
                    <p className="text-xs text-gray-500 mt-0.5">Configure notifications for scenario execution</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-xs bg-transparent border-[#1A2328] text-gray-400 hover:text-emerald-400 hover:bg-[#1A2A20]/20 hover:border-emerald-900"
                >
                  Configure
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
