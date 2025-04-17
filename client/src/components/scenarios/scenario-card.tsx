import { useState } from "react";
import { ThreatScenario } from "@/lib/types";
import { formatRelativeTime, cn, tryParseYaml } from "@/lib/utils";
import { FileCode, ArrowRight, Clock, PlayCircle, Download, Info } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { YamlEditor } from "@/components/scripts/yaml-editor";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ScenarioCardProps {
  scenario: ThreatScenario;
  yamlConfig?: string;
}

export function ScenarioCard({ scenario, yamlConfig = "name: example\ntype: security\nparams:\n  target: example.com" }: ScenarioCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedYaml, setEditedYaml] = useState(yamlConfig);
  const { toast } = useToast();

  const handleRunScenario = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Here we would normally send the edited YAML to the backend
    toast({
      title: "Scenario execution started",
      description: `Running ${scenario.name}...`,
      variant: "default",
    });
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create a blob and download the YAML file
    const blob = new Blob([editedYaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scenario.name.toLowerCase().replace(/\s+/g, "-")}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "YAML Downloaded",
      description: `${scenario.name} configuration saved to your device`,
      variant: "default",
    });
  };

  const openDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  return (
    <>
      <GlowCard className="cursor-pointer h-full group fade-in">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[4px] flex items-center justify-center bg-[rgba(60,180,80,0.1)] text-[hsl(135,80%,45%)] border border-[rgba(60,180,80,0.2)]">
                <FileCode className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-white text-base">{scenario.name}</h3>
              
              {scenario.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <Info className="h-4 w-4 text-gray-500 hover:text-[hsl(135,80%,45%)] transition-colors" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-[#111] border border-[#2a2a2a] text-gray-300 max-w-xs">
                      {scenario.description}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          
          <div className="bg-[#0c0c0c] rounded-[4px] border border-[#2a2a2a] p-3 mb-4 overflow-auto text-xs font-mono text-gray-400 h-24">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {yamlConfig.split("\n").slice(0, 6).join("\n")}
              {yamlConfig.split("\n").length > 6 && "..."}
            </pre>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1.5" />
              <span>Updated {formatRelativeTime(scenario.lastUpdated)}</span>
            </div>
            
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-transparent text-[hsl(135,80%,45%)] border-[#2a2a2a] hover:bg-[rgba(60,180,80,0.1)] hover:text-[hsl(135,80%,60%)]"
                onClick={openDialog}
              >
                <FileCode className="h-3.5 w-3.5 mr-1.5" />
                Edit YAML
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-transparent text-[hsl(135,80%,45%)] border-[#2a2a2a] hover:bg-[rgba(60,180,80,0.1)] hover:text-[hsl(135,80%,60%)]"
                onClick={handleDownload}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download
              </Button>
              
              <Button 
                size="sm" 
                className="h-8 bg-[hsl(135,80%,45%)] hover:bg-[hsl(135,80%,40%)] text-black font-medium border-0 transition-shadow hover:shadow-[0_0_8px_hsla(135,80%,40%,0.65)]"
                onClick={handleRunScenario}
              >
                <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
                Run
              </Button>
            </div>
          </div>
        </div>
      </GlowCard>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#111] border border-[#2a2a2a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">
              Edit {scenario.name} Configuration
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 h-80">
            <YamlEditor 
              value={editedYaml} 
              onChange={setEditedYaml} 
            />
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#191919]"
            >
              Cancel
            </Button>
            
            <Button 
              onClick={() => {
                // Validate YAML before saving (basic validation)
                if (tryParseYaml(editedYaml)) {
                  setIsDialogOpen(false);
                  toast({
                    title: "Configuration updated",
                    description: "YAML configuration has been updated successfully",
                    variant: "default",
                  });
                } else {
                  toast({
                    title: "Invalid YAML",
                    description: "Please check your YAML syntax and try again",
                    variant: "destructive",
                  });
                }
              }}
              className="bg-[hsl(135,80%,45%)] hover:bg-[hsl(135,80%,40%)] text-black font-medium"
            >
              Save Changes
            </Button>
            
            <Button 
              onClick={() => {
                handleRunScenario({ preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent);
                setIsDialogOpen(false);
              }}
              className="bg-[hsl(135,80%,45%)] hover:bg-[hsl(135,80%,40%)] text-black font-medium"
            >
              Run Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}