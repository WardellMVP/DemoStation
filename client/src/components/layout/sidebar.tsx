import { cn } from "@/lib/utils";
import { useLocation, Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { FileCode, GitMerge, Terminal } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  
  const { data: scripts = [] } = useQuery<any[]>({
    queryKey: ['/api/scripts'],
    initialData: []
  });
  
  // Get recent scripts - would be replaced with actual data in a real app
  const recentScripts = scripts.slice(0, 3);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside 
          className="w-64 fixed top-0 left-0 h-full z-40 bg-[#0F1419] border-r border-[#1A2328]"
          style={{ minHeight: "calc(100vh - 56px)" }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-5">
            <div className="mb-7">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Navigation
              </h2>
              <nav>
                <ul className="space-y-1">
                  <li>
                    <Link href="/">
                      <div className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded cursor-pointer",
                        location === '/'
                          ? "bg-emerald-900/30 text-emerald-400"
                          : "text-gray-300 hover:bg-[#131820] hover:text-emerald-300"
                      )}>
                        <Terminal className="h-4 w-4 mr-3" />
                        <span>All Scripts</span>
                      </div>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
            
            <div className="mb-7">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Recent Scripts
              </h2>
              <nav>
                <ul className="space-y-1">
                  {recentScripts.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-gray-600">
                      No recent scripts
                    </li>
                  ) : (
                    recentScripts.map((script: any) => (
                      <li key={script.id}>
                        <Link href={`/scripts/${script.id}`}>
                          <div className="flex items-center px-3 py-2 text-sm font-medium rounded text-gray-400 hover:bg-[#131820] hover:text-gray-200 cursor-pointer">
                            <FileCode className="h-4 w-4 mr-3 text-emerald-500" />
                            <span>{script.name}</span>
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
                Settings
              </h2>
              <nav>
                <ul className="space-y-1">
                  <li>
                    <Link href="/settings">
                      <div className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded cursor-pointer",
                        location === '/settings'
                          ? "bg-emerald-900/30 text-emerald-400"
                          : "text-gray-400 hover:bg-[#131820] hover:text-gray-200"
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
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
