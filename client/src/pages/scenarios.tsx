import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Shield } from "lucide-react";
import { ScenarioCard } from "@/components/scenarios/scenario-card";
import { GlowCard } from "@/components/ui/glow-card";
import { mockScenarios, getScenarioYamlTemplate } from "@/lib/mock-scenarios";
import { Badge } from "@/components/ui/badge";

export default function Scenarios() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter scenarios based on search query
  const filteredScenarios = mockScenarios.filter((scenario) => {
    return searchQuery
      ? scenario.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (scenario.description && scenario.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
  });
  
  return (
    <div className="space-y-6">
      <div className="mb-6 fade-in">
        <div className="flex items-center mb-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Threat<span className="text-[hsl(135,80%,45%)] text-glow">Scenarios</span>
          </h1>
          <Badge className="ml-2 bg-[rgba(60,180,80,0.1)] hover:bg-[rgba(60,180,80,0.2)] text-[hsl(135,80%,45%)] border border-[rgba(60,180,80,0.2)]">
            GitLab Connected
          </Badge>
        </div>
        <p className="text-gray-400 text-sm max-w-2xl">
          Browse, customize, and execute realistic threat scenarios to test your security posture.
        </p>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 fade-in">
        <div className="flex flex-wrap gap-3">
          <div className="relative w-full max-w-sm">
            <Input
              type="text"
              placeholder="Search scenarios..."
              className="w-full bg-[#191919] border-[#2a2a2a] text-gray-300 pl-9 h-9 rounded-[4px] focus-visible:ring-[hsl(135,80%,40%)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-500" />
          </div>
          
          <Button
            variant="outline"
            className="h-9 bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#191919] hover:text-white"
          >
            <Shield className="h-4 w-4 mr-2 text-[hsl(135,80%,45%)]" />
            By Severity
          </Button>
          
          <Button
            variant="outline"
            className="h-9 bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#191919] hover:text-white"
          >
            <AlertCircle className="h-4 w-4 mr-2 text-[hsl(135,80%,45%)]" />
            By Technique
          </Button>
        </div>
      </div>
      
      {/* Scenarios grid */}
      {filteredScenarios.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 fade-in">
          {filteredScenarios.map((scenario) => (
            <ScenarioCard 
              key={scenario.id} 
              scenario={scenario} 
              yamlConfig={getScenarioYamlTemplate(scenario.name)}
            />
          ))}
        </div>
      ) : (
        <GlowCard className="text-center py-12 fade-in" hover={false}>
          <div className="text-gray-300 mb-3 text-base">No scenarios found</div>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {searchQuery 
              ? `No scenarios match "${searchQuery}"`  
              : "Connect to GitLab to get started with your security scenarios"}
          </p>
        </GlowCard>
      )}
    </div>
  );
}