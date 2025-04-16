import { Script } from "@/lib/types";
import { formatRelativeTime, getCategoryColor, getCategoryIcon, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface ScriptCardProps {
  script: Script;
}

export function ScriptCard({ script }: ScriptCardProps) {
  const categoryColor = getCategoryColor(script.category);
  const categoryIcon = getCategoryIcon(script.category);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/scripts/${script.id}`}>
        <Card className="cursor-pointer bg-white dark:bg-dark-lighter rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center",
                  `bg-${categoryColor}-100 dark:bg-${categoryColor}-900`
                )}>
                  <i className={cn(
                    `ri-${categoryIcon}`,
                    `text-${categoryColor}-600 dark:text-${categoryColor}-400`
                  )}></i>
                </div>
                <h3 className="font-medium text-gray-800 dark:text-white">{script.name}</h3>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  `bg-${categoryColor}-100 dark:bg-${categoryColor}-900`,
                  `text-${categoryColor}-800 dark:text-${categoryColor}-200`,
                  "border-0"
                )}
              >
                {script.category}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
              {script.description}
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <i className="ri-history-line mr-1"></i>
                <span>Updated {formatRelativeTime(script.lastUpdated)}</span>
              </div>
              <button className="text-primary-light hover:text-primary-dark dark:hover:text-primary-light">
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
