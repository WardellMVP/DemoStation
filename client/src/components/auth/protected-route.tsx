import React from 'react';
import { useAuth } from '@/context/auth-provider';
import { Redirect } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login } = useAuth();
  
  // If still loading auth state, show loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <Card className="w-full max-w-md bg-black/60 border border-gray-800">
          <CardContent className="pt-6 flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
            <p className="text-gray-400">Verifying authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If not authenticated, show message with login button
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <Card className="w-full max-w-md bg-black/60 border border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center text-red-500">
              <ShieldAlert className="h-5 w-5" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col items-center space-y-4">
            <p className="text-gray-400 text-center">
              You need to be logged in to access this page.
            </p>
            <Button 
              onClick={login} 
              className="bg-green-700 hover:bg-green-600 text-white"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If authenticated, render children
  return <>{children}</>;
}