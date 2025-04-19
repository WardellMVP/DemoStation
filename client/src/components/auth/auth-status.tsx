import React from 'react';
import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn, LogOut, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AuthStatus() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  
  interface AuthStatusData {
    configured: boolean;
    provider: string;
    message: string;
  }
  
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
      <div className="flex items-center space-x-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Checking authentication...</span>
      </div>
    );
  }
  
  // If authentication is not configured
  if (authStatus && !authStatus.configured) {
    return (
      <div className="flex flex-col space-y-2 p-2">
        <div className="text-amber-500 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Okta SSO not configured</span>
        </div>
        <p className="text-sm text-gray-400">Authentication credentials need to be set in environment variables.</p>
      </div>
    );
  }
  
  if (isAuthenticated && user) {
    return (
      <Card className="bg-gray-900 border border-gray-800">
        <CardContent className="p-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : (
                <AvatarFallback className="bg-green-900">
                  {user.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm font-medium text-white truncate max-w-[100px]">{user.name}</p>
              <p className="text-xs text-gray-400 truncate max-w-[100px]">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-white" 
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Button variant="outline" className="bg-green-900 border-green-700 hover:bg-green-800" onClick={login}>
      <LogIn className="h-4 w-4 mr-1" />
      Sign In with Okta
    </Button>
  );
}