import { cn } from "@/lib/utils";
import { useLocation, Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  isOpen: boolean;
}

interface SidebarCategoryItem {
  name: string;
  path: string;
  icon: string;
  isActive: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    initialData: []
  });
  
  const { data: scripts = [] } = useQuery<any[]>({
    queryKey: ['/api/scripts'],
    initialData: []
  });
  
  // Get recent scripts - would be replaced with actual data in a real app
  const recentScripts = scripts.slice(0, 3);
  
  // Define sidebar menu categories
  const menuCategories: SidebarCategoryItem[] = [
    { 
      name: 'All Scripts', 
      path: '/', 
      icon: 'apps-line', 
      isActive: location === '/' 
    },
    { 
      name: 'Analytics', 
      path: '/category/analytics', 
      icon: 'bar-chart-line', 
      isActive: location === '/category/analytics' 
    },
    { 
      name: 'Security', 
      path: '/category/security', 
      icon: 'shield-check-line', 
      isActive: location === '/category/security' 
    },
    { 
      name: 'Data Processing', 
      path: '/category/data', 
      icon: 'database-2-line', 
      isActive: location === '/category/data' 
    },
    { 
      name: 'Automation', 
      path: '/category/automation', 
      icon: 'robot-line', 
      isActive: location === '/category/automation' 
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside 
          className={cn(
            "w-64 bg-white dark:bg-dark-lighter border-r border-gray-200 dark:border-gray-700",
            "transition-all duration-300 z-10 md:relative absolute inset-y-0 left-0 transform md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ minHeight: "calc(100vh - 56px)" }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-4">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Categories
              </h2>
              <nav>
                <ul className="space-y-1">
                  {menuCategories.map((item) => (
                    <li key={item.path}>
                      <Link href={item.path}>
                        <div className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                          item.isActive 
                            ? "bg-primary-light bg-opacity-10 text-primary-light" 
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}>
                          <i className={cn("ri-" + item.icon, "mr-3")}></i>
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Recently Used
              </h2>
              <nav>
                <ul className="space-y-1">
                  {recentScripts.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No recent scripts
                    </li>
                  ) : (
                    recentScripts.map((script: any) => (
                      <li key={script.id}>
                        <Link href={`/scripts/${script.id}`}>
                          <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                            <i className="ri-file-code-line mr-3 text-primary-light"></i>
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
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Settings
              </h2>
              <nav>
                <ul className="space-y-1">
                  <li>
                    <Link href="/settings">
                      <div className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                        location === '/settings'
                          ? "bg-primary-light bg-opacity-10 text-primary-light"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}>
                        <i className="ri-gitlab-fill mr-3 text-orange-500"></i>
                        <span>GitLab Integration</span>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link href="/preferences">
                      <div className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                        location === '/preferences'
                          ? "bg-primary-light bg-opacity-10 text-primary-light"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}>
                        <i className="ri-settings-4-line mr-3"></i>
                        <span>Preferences</span>
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
