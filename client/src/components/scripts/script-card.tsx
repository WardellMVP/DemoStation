import { ThreatScenario } from "@/lib/types";
import { formatRelativeTime, cn } from "@/lib/utils";
import { Link } from "wouter";
import { FileCode, ArrowRight, Clock } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";

interface ScriptCardProps {
  script: ThreatScenario;
}

export function ScriptCard({ script }: ScriptCardProps) {
  return (
    <Link href={`/scenarios/${script.id}`}>
      <GlowCard className="cursor-pointer h-full">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[4px] flex items-center justify-center bg-[rgba(60,180,80,0.1)] text-[hsl(135,80%,45%)] border border-[rgba(60,180,80,0.2)]">
                <FileCode className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-white text-base">{script.name}</h3>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-5 line-clamp-3 min-h-[4.5rem]">
            {script.description}
          </p>
          <div className="flex justify-between items-center border-t border-[#2a2a2a] pt-3 mt-1">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1.5" />
              <span>Updated {formatRelativeTime(script.lastUpdated)}</span>
            </div>
            <div className="text-[hsl(135,80%,45%)] hover:text-[hsl(135,80%,60%)] transition-colors">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </GlowCard>
    </Link>
  );
}
