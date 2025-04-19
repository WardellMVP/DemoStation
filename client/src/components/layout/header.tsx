import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Menu, 
  Terminal, 
  Search, 
  User, 
  LogOut, 
  Shield, 
  ShieldAlert, 
  Settings, 
  BarChart,
  Activity,
  Lock,
  Bell
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-provider";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function Header({ isSidebarOpen, toggleSidebar }: HeaderProps) {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <header className="bg-[#0a0a0a] border-b border-[#1c1c1c] h-14 fixed top-0 left-0 right-0 z-40 shadow-md">
      <div className="flex items-center justify-between px-5 h-full">
        {/* Logo and title */}
        <div className="flex items-center space-x-3">
          <Button 
            onClick={toggleSidebar} 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 hover:text-green-500 mr-1 md:hidden"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="bg-green-900/40 text-green-500 p-1.5 rounded-[4px] border border-green-800/50">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-semibold text-white tracking-tight">
              <span className="text-green-500">Demo</span>Codex
              <Badge variant="outline" className="ml-2 text-[8px] bg-green-900/20 border-green-800/50 text-green-400 py-0 h-4 px-1.5 align-top">
                SECURE
              </Badge>
            </h1>
          </div>
        </div>
        
        {/* Search and actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          {isAuthenticated && (
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-green-500 hidden sm:flex">
              <Bell className="h-4 w-4" />
            </Button>
          )}
          
          {/* Search */}
          <div className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Search threat scenarios..."
              className="w-64 bg-[#111] border-[#1c1c1c] text-gray-300 rounded-[4px] pl-8 h-8 text-xs focus-visible:ring-1 focus-visible:ring-green-500/30 focus-visible:border-green-700/50 focus-visible:ring-offset-0"
            />
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-green-700" />
          </div>
          
          {/* User profile */}
          <div className="relative">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-[4px] bg-[#111] hover:bg-[#191919] border border-[#1c1c1c] hover:border-green-700/50 flex items-center space-x-2 px-2 h-8"
                  >
                    <Avatar className="h-6 w-6 border border-green-700/30">
                      {user?.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      ) : (
                        <AvatarFallback className="bg-green-900/70 text-green-400 text-xs">
                          {user?.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-xs text-gray-300 hidden sm:inline">{user?.name.split(' ')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 bg-[#0a0a0a] border-[#1c1c1c] text-gray-200 rounded-[4px] mr-2 mt-1 shadow-xl">
                  <div className="flex items-center justify-start p-3 border-b border-[#1c1c1c]">
                    <Avatar className="h-10 w-10 mr-3 border border-green-700/30">
                      {user?.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      ) : (
                        <AvatarFallback className="bg-green-900/70 text-green-400 font-medium">
                          {user?.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[180px]">{user?.email}</p>
                    </div>
                  </div>
                  
                  <DropdownMenuLabel className="text-green-500 text-xs font-medium">
                    ACCOUNT SETTINGS
                  </DropdownMenuLabel>
                  
                  <DropdownMenuGroup>
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer hover:bg-[#111] focus:bg-[#111] hover:text-green-500 focus:text-green-500">
                        <User className="mr-2 h-4 w-4 text-green-700" />
                        <span>Your Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/profile?tab=usage">
                      <DropdownMenuItem className="cursor-pointer hover:bg-[#111] focus:bg-[#111] hover:text-green-500 focus:text-green-500">
                        <Activity className="mr-2 h-4 w-4 text-green-700" />
                        <span>Scenario Usage</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings">
                      <DropdownMenuItem className="cursor-pointer hover:bg-[#111] focus:bg-[#111] hover:text-green-500 focus:text-green-500">
                        <Settings className="mr-2 h-4 w-4 text-green-700" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator className="bg-[#1c1c1c]" />
                  
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-[#111] focus:bg-[#111] hover:text-red-400 focus:text-red-400 text-gray-300"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                  >
                    <Lock className="mr-2 h-4 w-4 text-red-400" />
                    <span>Secure Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-[4px] bg-green-900/20 hover:bg-green-900/30 border border-green-700/50 hover:border-green-600/70 text-xs flex items-center px-3 h-8 text-green-400 hover:text-green-300"
                onClick={(e) => {
                  e.preventDefault();
                  login();
                }}
              >
                <ShieldAlert className="mr-2 h-3.5 w-3.5" />
                Secure Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
