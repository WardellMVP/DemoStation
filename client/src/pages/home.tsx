import { useState } from "react";
import { useScripts } from "@/hooks/use-scripts";
import { ScriptCard } from "@/components/scripts/script-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, GitMerge } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { scripts, isLoadingScripts } = useScripts();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter scripts based on search query only
  const filteredScripts = scripts.filter((script) => {
    return searchQuery
      ? script.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        script.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
  });
  
  return (
    <div className="space-y-6">
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Demo<span className="text-emerald-400">Codex</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          Security scenario management platform. Configure, execute and monitor your threat scenarios with ease.
        </p>
      </motion.div>
      
      {/* Search bar */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="relative max-w-sm">
          <Input
            type="text"
            placeholder="Search scenarios..."
            className="w-full bg-[#0F1419] border-[#1A2328] text-gray-300 pl-9 h-9 rounded focus-visible:ring-emerald-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-500" />
        </div>
      </motion.div>
      
      {/* Script grid */}
      {isLoadingScripts ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : filteredScripts.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {filteredScripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12 bg-[#0F1419] rounded border border-[#1A2328]">
          <div className="text-gray-300 mb-3 text-base">No scenarios found</div>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {searchQuery 
              ? `No scenarios match "${searchQuery}"`  
              : "Connect to GitLab to get started with your security scenarios"}
          </p>
          <Button className="mt-5 bg-[#1A2A20] text-emerald-400 hover:bg-[#1A2A20]/80 border-0">
            <GitMerge className="h-4 w-4 mr-2" />
            Connect to GitLab
          </Button>
        </div>
      )}
    </div>
  );
}
