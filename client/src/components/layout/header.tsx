import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Terminal, Search, User } from "lucide-react";

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function Header({ isSidebarOpen, toggleSidebar }: HeaderProps) {
  return (
    <header className="bg-[#0D1117] border-b border-[#1E2636] h-16 shadow-md">
      <div className="flex items-center justify-between px-6 h-full">
        {/* Logo and title */}
        <div className="flex items-center space-x-4">
          <Button 
            onClick={toggleSidebar} 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-blue-400 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-1.5 rounded">
              <Terminal className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              ScriptHub
            </h1>
          </div>
        </div>
        
        {/* Search and actions */}
        <div className="flex items-center space-x-5">
          <div className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Search scripts..."
              className="w-64 bg-[#1E2636] border-[#2D3748] text-gray-200 rounded-md pl-10 focus:border-blue-500 focus:ring-blue-500"
            />
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          {/* User profile */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full bg-[#1E2636] hover:bg-[#2D3748] flex items-center justify-center text-gray-300">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
