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
          className="w-72 fixed top-0 left-0 h-full z-40 bg-[#121720] border-r border-[#1E2636]"
          style={{ minHeight: "calc(100vh - 56px)" }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Navigation
              </h2>
              <nav>
                <ul className="space-y-2">
                  <li>
                    <Link href="/">
                      <div className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-md cursor-pointer",
                        location === '/'
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-gray-300 hover:bg-[#1E2636] hover:text-gray-100"
                      )}>
                        <Terminal className="h-5 w-5 mr-3" />
                        <span>All Scripts</span>
                      </div>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Recent Scripts
              </h2>
              <nav>
                <ul className="space-y-2">
                  {recentScripts.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-gray-500">
                      No recent scripts
                    </li>
                  ) : (
                    recentScripts.map((script: any) => (
                      <li key={script.id}>
                        <Link href={`/scripts/${script.id}`}>
                          <div className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-[#1E2636] hover:text-gray-100 cursor-pointer">
                            <FileCode className="h-5 w-5 mr-3 text-blue-400" />
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
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Settings
              </h2>
              <nav>
                <ul className="space-y-2">
                  <li>
                    <Link href="/settings">
                      <div className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-md cursor-pointer",
                        location === '/settings'
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-gray-300 hover:bg-[#1E2636] hover:text-gray-100"
                      )}>
                        <GitMerge className="h-5 w-5 mr-3 text-orange-400" />
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
