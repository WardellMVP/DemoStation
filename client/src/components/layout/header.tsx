import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Terminal, Search, User } from "lucide-react";

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function Header({ isSidebarOpen, toggleSidebar }: HeaderProps) {
  return (
    <header className="bg-[#0d0d0d] border-b border-[#2a2a2a] h-14 fixed top-0 left-0 right-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-5 h-full">
        {/* Logo and title */}
        <div className="flex items-center space-x-3">
          <Button 
            onClick={toggleSidebar} 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 hover:text-[hsl(135,80%,45%)] mr-1 md:hidden"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="bg-[rgba(60,180,80,0.2)] text-[hsl(135,80%,45%)] p-1.5 rounded-[4px] border border-[rgba(60,180,80,0.3)]">
              <Terminal className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-semibold text-white tracking-tight">
              Demo<span className="text-[hsl(135,80%,45%)] text-glow">Codex</span>
            </h1>
          </div>
        </div>
        
        {/* Search and actions */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Search scenarios..."
              className="w-56 bg-[#191919] border-[#2a2a2a] text-gray-300 rounded-[4px] pl-8 h-8 text-xs focus:border-[hsl(135,80%,45%)] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-500" />
          </div>
          
          {/* User profile */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-[4px] bg-[#191919] hover:bg-[#222] border border-[#2a2a2a] hover:border-[hsl(135,80%,45%)] flex items-center justify-center text-gray-400">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
