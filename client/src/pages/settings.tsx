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
        <h2 className="text-xl font-semibold mb-2">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure your GitLab integration and application preferences
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
              variant="outline"
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
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <Cog className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <h3 className="text-base font-medium">Application Preferences</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                Customize your experience with ThreatScenario Hub
              </p>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Server className="h-4 w-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Scenario Execution</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure how scenarios are executed</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Server className="h-4 w-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Default Scenario Location</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Set the default location for scenario storage</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="h-4 w-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Notification Settings</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure notifications for scenario execution</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
