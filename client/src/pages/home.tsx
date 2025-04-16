import { useState } from "react";
import { useScripts } from "@/hooks/use-scripts";
import { ScriptCard } from "@/components/scripts/script-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Filter, SortDesc } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { scripts, isLoadingScripts } = useScripts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter scripts based on category and search query
  const filteredScripts = scripts.filter((script) => {
    const matchesCategory = selectedCategory ? script.category === selectedCategory : true;
    const matchesSearch = searchQuery
      ? script.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        script.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return matchesCategory && matchesSearch;
  });
  
  // Get unique categories from scripts
  const categories = Array.from(new Set(scripts.map((script) => script.category)));
  
  return (
    <div className="space-y-6">
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Available Scripts</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Run, configure and download scripts directly from your GitLab repositories
        </p>
      </motion.div>
      
      {/* Filters and actions */}
      <motion.div 
        className="flex flex-wrap items-center justify-between gap-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            className="px-3 py-1.5 text-sm font-medium"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="px-3 py-1.5 text-sm font-medium"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative md:hidden">
            <Input
              type="text"
              placeholder="Search scripts..."
              className="w-48 bg-gray-100 dark:bg-dark-lighter pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
          </div>
          
          <Button variant="ghost" size="sm" className="flex items-center text-gray-600 dark:text-gray-300">
            <Filter className="h-4 w-4 mr-1" />
            <span className="text-sm">Filter</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center text-gray-600 dark:text-gray-300">
            <SortDesc className="h-4 w-4 mr-1" />
            <span className="text-sm">Sort</span>
          </Button>
        </div>
      </motion.div>
      
      {/* Script grid */}
      {isLoadingScripts ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-light" />
        </div>
      ) : filteredScripts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredScripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-2">No scripts found</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {searchQuery 
              ? `No scripts match "${searchQuery}"` 
              : selectedCategory 
                ? `No scripts in the ${selectedCategory} category` 
                : "Add scripts from GitLab to get started"}
          </p>
        </div>
      )}
    </div>
  );
}
