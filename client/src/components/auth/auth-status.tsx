import React from 'react';
import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  LogIn,
  LogOut,
  ShieldAlert,
  User as UserIcon,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'wouter';

interface AuthStatusData {
  configured: boolean;
  provider: string;
  message: string;
}

export function AuthStatus() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  
  // Get Okta configuration status
  const { data: authStatus, isLoading: isStatusLoading } = useQuery<AuthStatusData>({
    queryKey: ['/api/auth/status'],
    initialData: {
      configured: false,
      provider: 'unknown',
      message: 'Auth status not loaded'
    }
  });
  
  if (isLoading || isStatusLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-400 p-2 border border-gray-800 bg-black/30 rounded-[4px]">
        <Loader2 className="h-4 w-4 animate-spin text-green-500" />
        <span className="text-sm">Authenticating...</span>
      </div>
    );
  }
  
  // If authentication is not configured
  if (authStatus && !authStatus.configured) {
    return (
      <div className="flex flex-col space-y-2 p-3 border border-yellow-900/50 bg-yellow-950/20 rounded-[4px]">
        <div className="text-amber-500 flex items-center space-x-2">
          <ShieldAlert className="h-4 w-4" />
          <span className="text-sm font-medium">Okta SSO not configured</span>
        </div>
        <p className="text-xs text-gray-400">Authentication credentials need to be set in environment variables.</p>
      </div>
    );
  }
  
  if (isAuthenticated && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full px-3 py-2 flex justify-between items-center h-auto bg-gray-900/50 border border-gray-800 hover:bg-gray-800 rounded-[4px]">
            <div className="flex items-center space-x-2">
              <Avatar className="h-7 w-7 border border-green-700/50">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback className="bg-green-900 text-xs">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium text-white truncate max-w-[110px]">{user.name}</p>
                <p className="text-xs text-gray-400 truncate max-w-[110px]">{user.email}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-green-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-gray-900 border border-gray-800 text-gray-200">
          <DropdownMenuLabel className="text-green-500">Account</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-800" />
          <DropdownMenuGroup>
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                <UserIcon className="mr-2 h-4 w-4 text-green-500" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                <Settings className="mr-2 h-4 w-4 text-green-500" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-gray-800" />
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 text-red-400"
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <Button 
      variant="outline" 
      className="w-full bg-green-900/40 border border-green-700/50 hover:bg-green-800/60 rounded-[4px] text-sm flex items-center gap-2"
      onClick={(e) => {
        e.preventDefault();
        login();
      }}
    >
      <ShieldAlert className="h-4 w-4 text-green-400" />
      <span>Secure Sign In</span>
    </Button>
  );
}