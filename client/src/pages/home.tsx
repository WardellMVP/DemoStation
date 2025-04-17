import { useState } from "react";
import { useScripts } from "@/hooks/use-scripts";
import { ScriptCard } from "@/components/scripts/script-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, GitMerge } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";

export default function Home() {
  const { scripts, isLoadingScripts } = useScripts();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter scripts based on search query only
  const filteredScripts = scripts.filter((script) => {
    return searchQuery
      ? script.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (script.description && script.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
  });
  
  return (
    <div className="space-y-6">
      <div className="mb-6 fade-in">
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Demo<span className="text-[hsl(135,80%,45%)] text-glow">Codex</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          Security scenario management platform. Configure, execute and monitor your threat scenarios with ease.
        </p>
      </div>
      
      {/* Search bar */}
      <div className="mb-6 fade-in">
        <div className="relative max-w-sm">
          <Input
            type="text"
            placeholder="Search scenarios..."
            className="w-full bg-[#191919] border-[#2a2a2a] text-gray-300 pl-9 h-9 rounded-[4px] focus-visible:ring-[hsl(135,80%,40%)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-500" />
        </div>
      </div>
      
      {/* Script grid */}
      {isLoadingScripts ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(135,80%,45%)]" />
        </div>
      ) : filteredScripts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 fade-in">
          {filteredScripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
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
          <Button className="mt-5 bg-[hsl(135,80%,45%)] hover:bg-[hsl(135,80%,40%)] text-black font-medium border-0 transition-shadow hover:shadow-[0_0_8px_hsla(135,80%,40%,0.65)]">
            <GitMerge className="h-4 w-4 mr-2" />
            Connect to GitLab
          </Button>
        </GlowCard>
      )}
    </div>
  );
}
