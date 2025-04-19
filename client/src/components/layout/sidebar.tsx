import React from "react";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, 
  ShieldAlert, 
  GitMerge, 
  History,
  User,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/auth-provider";
import { ThreatScenario } from "@/lib/types";
import { AuthStatus } from "@/components/auth/auth-status";

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
    "w-64 fixed top-0 left-0 h-full z-40 bg-[#0a0a0a] border-r border-[#1c1c1c] pt-14 transition-transform duration-300",
    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
  );

  const activeLinkClass = "bg-[rgba(60,180,80,0.1)] text-[hsl(135,80%,60%)] border border-[rgba(60,180,80,0.2)]";
  const inactiveLinkClass = "text-gray-400 hover:bg-[#141414] hover:text-[hsl(135,80%,60%)] border border-transparent";

  return (
    <aside 
      className={sidebarClasses}
      style={{ minHeight: "100vh" }}
    >
      <div className="p-5 fade-in">
        {/* Authentication Status - Top position for better visibility */}
        <div className="mb-7">
          <div className="mb-2">
            <AuthStatus />
          </div>
        </div>

        {/* Main Navigation */}
        <div className="mb-7">
          <h2 className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-3 flex items-center px-2">
            <span className="inline-block w-1 h-1 rounded-full bg-green-500 mr-2"></span>
            Main Navigation
          </h2>
          <nav>
            <ul className="space-y-1.5">
              <li>
                <Link href="/">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-[4px] cursor-pointer transition-colors duration-200",
                    location === '/' ? activeLinkClass : inactiveLinkClass
                  )}>
                    <Shield className="h-4 w-4 mr-3" />
                    <span>Threat Scenarios</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/history">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-[4px] cursor-pointer transition-colors duration-200",
                    location === '/history' ? activeLinkClass : inactiveLinkClass
                  )}>
                    <History className="h-4 w-4 mr-3" />
                    <span>Execution History</span>
                  </div>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Recent Scenarios */}
        <div className="mb-7">
          <h2 className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-3 flex items-center px-2">
            <span className="inline-block w-1 h-1 rounded-full bg-green-500 mr-2"></span>
            Recent Scenarios
          </h2>
          <nav>
            <ul className="space-y-1.5">
              {recentScenarios.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-600 italic">
                  No recent scenarios
                </li>
              ) : (
                recentScenarios.map((scenario) => (
                  <li key={scenario.id}>
                    <Link href={`/scenarios/${scenario.id}`}>
                      <div className="flex items-center justify-between px-3 py-2 text-sm rounded-[4px] text-gray-400 hover:bg-[#141414] hover:text-gray-300 cursor-pointer border border-transparent hover:border-gray-800 transition-colors duration-200">
                        <div className="flex items-center overflow-hidden">
                          <ShieldAlert className="h-4 w-4 min-w-[16px] mr-3 text-green-500" />
                          <span className="truncate">{scenario.name}</span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-green-700 ml-1" />
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </nav>
        </div>
        
        {/* User Settings - We keep this section even though we have dropdown */}
        <div className="mb-7">
          <h2 className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-3 flex items-center px-2">
            <span className="inline-block w-1 h-1 rounded-full bg-green-500 mr-2"></span>
            User Access
          </h2>
          <nav>
            <ul className="space-y-1.5">
              <li>
                <Link href="/profile">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-[4px] cursor-pointer transition-colors duration-200",
                    location === '/profile' ? activeLinkClass : inactiveLinkClass
                  )}>
                    <User className="h-4 w-4 mr-3" />
                    <span>User Profile</span>
                    {!isAuthenticated && <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">Secure Area</span>}
                  </div>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Configuration */}
        <div>
          <h2 className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-3 flex items-center px-2">
            <span className="inline-block w-1 h-1 rounded-full bg-green-500 mr-2"></span>
            Configuration
          </h2>
          <nav>
            <ul className="space-y-1.5">
              <li>
                <Link href="/settings">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-[4px] cursor-pointer transition-colors duration-200",
                    location === '/settings' ? activeLinkClass : inactiveLinkClass
                  )}>
                    <GitMerge className="h-4 w-4 mr-3" />
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
