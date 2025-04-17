import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Terminal, Search, User } from "lucide-react";

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function Header({ isSidebarOpen, toggleSidebar }: HeaderProps) {
  return (
    <header className="bg-[#0A0E12] border-b border-[#1A2328] h-14 fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center justify-between px-5 h-full">
        {/* Logo and title */}
        <div className="flex items-center space-x-3">
          <Button 
            onClick={toggleSidebar} 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 hover:text-emerald-400 mr-1 md:hidden"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-800 text-emerald-100 p-1.5 rounded">
              <Terminal className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-semibold text-white tracking-tight">
              Demo<span className="text-emerald-400">Codex</span>
            </h1>
          </div>
        </div>
        
        {/* Search and actions */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Search scripts..."
              className="w-56 bg-[#131820] border-[#1A2328] text-gray-300 rounded pl-8 h-8 text-xs focus:border-emerald-700 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-500" />
          </div>
          
          {/* User profile */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded bg-[#131820] hover:bg-[#1A2328] flex items-center justify-center text-gray-400">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
