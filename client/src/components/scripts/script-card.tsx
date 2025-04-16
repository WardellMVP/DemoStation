import { Script } from "@/lib/types";
import { formatRelativeTime, cn } from "@/lib/utils";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { FileCode, ArrowRight, Clock } from "lucide-react";

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
        <div className="bg-[#0F1419] cursor-pointer rounded border border-[#1A2328] overflow-hidden transition-all duration-200 h-full hover:border-emerald-800 hover:shadow">
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center bg-[#1A2A20] text-emerald-500">
                  <FileCode className="h-4 w-4" />
                </div>
                <h3 className="font-medium text-white text-base">{script.name}</h3>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-5 line-clamp-3 min-h-[4.5rem]">
              {script.description}
            </p>
            <div className="flex justify-between items-center border-t border-[#1A2328] pt-3 mt-1">
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1.5" />
                <span>Updated {formatRelativeTime(script.lastUpdated)}</span>
              </div>
              <div className="text-emerald-500 hover:text-emerald-400 transition-colors">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
