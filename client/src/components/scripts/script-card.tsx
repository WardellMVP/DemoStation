import { Script } from "@/lib/types";
import { formatRelativeTime, cn } from "@/lib/utils";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Terminal, ArrowRight, Clock } from "lucide-react";

interface ScriptCardProps {
  script: Script;
}

export function ScriptCard({ script }: ScriptCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/scripts/${script.id}`}>
        <div className="card-gradient cursor-pointer rounded-lg border border-[#1E2636] overflow-hidden hover:shadow-lg hover:border-blue-600/40 transition-all duration-200 h-full">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-md flex items-center justify-center bg-blue-600/20 text-blue-400">
                  <Terminal className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-white text-lg">{script.name}</h3>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6 line-clamp-3 min-h-[4.5rem]">
              {script.description}
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                <span>Updated {formatRelativeTime(script.lastUpdated)}</span>
              </div>
              <div className="text-blue-400 hover:text-blue-300 transition-colors">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
