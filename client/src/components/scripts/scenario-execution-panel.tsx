import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, PlayCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { formatRelativeTime } from "@/lib/utils";
import { ScenarioExecution } from "@/lib/types";
import { useScenarios } from "@/hooks/use-scenarios";

interface ScenarioExecutionPanelProps {
  scenarioId: number;
  yamlConfig: string;
}

export function ScenarioExecutionPanel({ scenarioId, yamlConfig }: ScenarioExecutionPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeExecution, setActiveExecution] = useState<number | null>(null);
  
  const { executeScenario } = useScenarios();
  const { data: executions = [], isLoading } = useScenarios().getScenarioExecutions(scenarioId);
  const { data: executionDetails, isLoading: isLoadingDetails } = useScenarios().getExecutionDetails(activeExecution || 0);
  
  const handleExecute = async () => {
    try {
      // Parse YAML string to object
      const config = yamlConfig; // In a real app we might want to parse this
      
      // Execute the scenario
      const response = await executeScenario.mutateAsync({ 
        id: scenarioId, 
        config 
      });
      
      // Set the active execution to the newly created one
      if (response && response.id) {
        setActiveExecution(response.id);
        setExpanded(true);
      }
    } catch (error) {
      console.error("Failed to execute scenario:", error);
    }
  };
  
  const renderExecutionStatus = (execution: ScenarioExecution) => {
    switch (execution.status) {
      case 'running':
        return (
          <div className="flex items-center space-x-2 text-amber-500 dark:text-amber-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Running</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center space-x-2 text-green-500 dark:text-green-400">
            <PlayCircle className="h-4 w-4" />
            <span>Completed</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center space-x-2 text-red-500 dark:text-red-400">
            <XCircle className="h-4 w-4" />
            <span>Failed</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  const renderExecutionOutput = (output: string | null) => {
    if (!output) return <p className="text-gray-500 dark:text-gray-400">No output available</p>;
    
    return (
      <ScrollArea className="h-full max-h-96 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
        <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{output}</pre>
      </ScrollArea>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Execution History</CardTitle>
          <Button 
            onClick={handleExecute} 
            disabled={executeScenario.isPending}
            size="sm"
            variant="default"
          >
            {executeScenario.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Execute
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-6 w-6 animate-spin text-primary-light" />
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No execution history yet</p>
              <p className="text-sm mt-2">Click the Execute button to run this scenario</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {executions.slice(0, expanded ? undefined : 3).map((execution) => (
                <div 
                  key={execution.id} 
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${activeExecution === execution.id ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                  onClick={() => setActiveExecution(execution.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {renderExecutionStatus(execution)}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(execution.timestamp)}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                  
                  {activeExecution === execution.id && (
                    <div className="mt-4">
                      {isLoadingDetails ? (
                        <div className="flex items-center justify-center h-24">
                          <Loader2 className="h-5 w-5 animate-spin text-primary-light" />
                        </div>
                      ) : executionDetails ? (
                        renderExecutionOutput(executionDetails.output)
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No details available</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {executions.length > 3 && (
          <CardFooter className="p-2 flex justify-center">
            <Button 
              variant="link" 
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show less' : `Show ${executions.length - 3} more executions`}
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}