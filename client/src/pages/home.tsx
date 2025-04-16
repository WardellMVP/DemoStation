import { useState } from "react";
import { useScripts } from "@/hooks/use-scripts";
import { ScriptCard } from "@/components/scripts/script-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
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
    <div className="space-y-8">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          <span className="text-blue-400 text-glow">Script</span>Hub
        </h1>
        <p className="text-gray-400 max-w-3xl">
          Modern script management platform for security operations. Configure, execute and monitor your scripts with ease.
        </p>
      </motion.div>
      
      {/* Search bar */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="relative max-w-md">
          <Input
            type="text"
            placeholder="Search scripts..."
            className="w-full bg-[#121720] border-[#1E2636] text-gray-200 px-4 py-3 pl-11 h-auto rounded-lg focus-visible:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="h-5 w-5 absolute left-4 top-3.5 text-gray-500" />
        </div>
      </motion.div>
      
      {/* Script grid */}
      {isLoadingScripts ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : filteredScripts.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {filteredScripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16 card-gradient rounded-lg border border-[#1E2636]">
          <div className="text-gray-300 mb-3 text-lg">No scripts found</div>
          <p className="text-gray-400 max-w-md mx-auto">
            {searchQuery 
              ? `No scripts match "${searchQuery}"`  
              : "Connect to GitLab to get started with your scripts"}
          </p>
          <Button className="mt-6 cybr-btn">
            Connect to GitLab
          </Button>
        </div>
      )}
    </div>
  );
}
