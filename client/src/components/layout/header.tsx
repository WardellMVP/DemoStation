import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Terminal, Search, User, LogOut, Shield, UserCircle, Settings, BarChart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-provider";
import { Link } from "wouter";

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function Header({ isSidebarOpen, toggleSidebar }: HeaderProps) {
  const { user, isAuthenticated, login, logout } = useAuth();
  
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
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-[4px] bg-[#191919] hover:bg-[#222] border border-[#2a2a2a] hover:border-[hsl(135,80%,45%)] flex items-center justify-center">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                      <AvatarFallback className="bg-[#222] text-green-500 text-xs">
                        <UserCircle className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#0d0d0d] border-[#2a2a2a] text-gray-300 rounded-[4px] mr-2 mt-1">
                  <div className="flex items-center justify-start p-2 border-b border-[#222]">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                      <AvatarFallback className="bg-[#222] text-green-500">
                        <UserCircle className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[180px]">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuGroup>
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer hover:bg-[#191919] hover:text-[hsl(135,80%,45%)]">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/profile?tab=usage">
                      <DropdownMenuItem className="cursor-pointer hover:bg-[#191919] hover:text-[hsl(135,80%,45%)]">
                        <BarChart className="mr-2 h-4 w-4" />
                        <span>Activity</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/profile?tab=settings">
                      <DropdownMenuItem className="cursor-pointer hover:bg-[#191919] hover:text-[hsl(135,80%,45%)]">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-[#222]" />
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-[#191919] hover:text-red-400"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-[4px] bg-[#191919] hover:bg-[#222] border border-[#2a2a2a] hover:border-[hsl(135,80%,45%)] text-xs flex items-center"
                onClick={login}
              >
                <Shield className="mr-2 h-3.5 w-3.5 text-[hsl(135,80%,45%)]" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
