import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu } from "lucide-react";

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function Header({ isSidebarOpen, toggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-dark-lighter border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and title */}
        <div className="flex items-center space-x-3">
          <Button 
            onClick={toggleSidebar} 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-light md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-white p-1 rounded">
              <i className="ri-code-s-slash-line text-xl"></i>
            </div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              DemoStation
            </h1>
          </div>
        </div>
        
        {/* Search and actions */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Search scripts..."
              className="w-64 bg-gray-100 dark:bg-dark text-gray-800 dark:text-gray-200 rounded-lg pl-10"
            />
            <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
          </div>
          
          <ThemeToggle />
          
          {/* User profile */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <i className="ri-user-line"></i>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
