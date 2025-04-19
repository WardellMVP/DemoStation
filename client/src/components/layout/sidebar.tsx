import { cn } from "@/lib/utils";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, 
  ShieldAlert, 
  GitMerge, 
  History,
  User
} from "lucide-react";
import { useAuth } from "@/context/auth-provider";
import { ThreatScenario } from "@/lib/types";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  
  const { data: scenarios = [] } = useQuery<ThreatScenario[]>({
    queryKey: ['/api/scenarios'],
    initialData: []
  });
  
  // Get recent scenarios
  const recentScenarios = scenarios.slice(0, 3);

  const sidebarClasses = cn(
    "w-64 fixed top-0 left-0 h-full z-40 bg-[#111] border-r border-[#2a2a2a] pt-14 transition-transform duration-300",
    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
  );

  return (
    <aside 
      className={sidebarClasses}
      style={{ minHeight: "100vh" }}
    >
      <div className="p-5 fade-in">
        <div className="mb-7">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Navigation
          </h2>
          <nav>
            <ul className="space-y-1">
              <li>
                <Link href="/">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-[4px] cursor-pointer",
                    location === '/'
                      ? "bg-[rgba(60,180,80,0.15)] text-[hsl(135,80%,45%)] border border-[rgba(60,180,80,0.3)]"
                      : "text-gray-300 hover:bg-[#191919] hover:text-[hsl(135,80%,45%)]"
                  )}>
                    <Shield className="h-4 w-4 mr-3" />
                    <span>Scenarios</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/history">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-[4px] cursor-pointer",
                    location === '/history'
                      ? "bg-[rgba(60,180,80,0.15)] text-[hsl(135,80%,45%)] border border-[rgba(60,180,80,0.3)]"
                      : "text-gray-300 hover:bg-[#191919] hover:text-[hsl(135,80%,45%)]"
                  )}>
                    <History className="h-4 w-4 mr-3" />
                    <span>Execution History</span>
                  </div>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="mb-7">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Recent Scenarios
          </h2>
          <nav>
            <ul className="space-y-1">
              {recentScenarios.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-600">
                  No recent scenarios
                </li>
              ) : (
                recentScenarios.map((scenario) => (
                  <li key={scenario.id}>
                    <Link href={`/scenarios/${scenario.id}`}>
                      <div className="flex items-center px-3 py-2 text-sm font-medium rounded-[4px] text-gray-400 hover:bg-[#191919] hover:text-gray-200 cursor-pointer">
                        <ShieldAlert className="h-4 w-4 mr-3 text-[hsl(135,80%,45%)]" />
                        <span>{scenario.name}</span>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </nav>
        </div>
        
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Configuration
          </h2>
          <nav>
            <ul className="space-y-1">
              <li>
                <Link href="/settings">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-[4px] cursor-pointer",
                    location === '/settings'
                      ? "bg-[rgba(60,180,80,0.15)] text-[hsl(135,80%,45%)] border border-[rgba(60,180,80,0.3)]"
                      : "text-gray-400 hover:bg-[#191919] hover:text-gray-200"
                  )}>
                    <GitMerge className="h-4 w-4 mr-3 text-gray-500" />
                    <span>GitLab Integration</span>
                  </div>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </aside>
  );
}
