import React from 'react';
import { useAuth } from '@/context/auth-provider';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ShieldAlert, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login, authConfigured, authStatusChecked } = useAuth();
  const [location] = useLocation();
  
  // If auth status hasn't been checked yet, show initial loading
  if (!authStatusChecked) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <Card className="w-full max-w-md bg-black/60 border border-gray-800">
          <CardContent className="pt-6 flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
            <p className="text-gray-400">Initializing authentication system...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If auth is not configured, show warning message
  if (!authConfigured) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <Card className="w-full max-w-md bg-black/60 border border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center text-yellow-500">
              <AlertCircle className="h-5 w-5" />
              Authentication Not Configured
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col items-center space-y-4">
            <p className="text-gray-400 text-center">
              The Okta SSO authentication system is not properly configured. Please contact the administrator.
            </p>
            <Badge variant="outline" className="bg-yellow-900/20 text-yellow-500 border-yellow-600/50">
              Missing Okta credentials
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }
  
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
        <Card className="w-full max-w-md bg-black/60 border border-gray-800 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="mb-2 bg-green-900/20 text-green-500 border-green-700/40">
                SECURE AREA
              </Badge>
            </div>
            <CardTitle className="flex items-center gap-2 text-center justify-center text-red-500">
              <ShieldAlert className="h-5 w-5" />
              Authentication Required
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              This area requires authentication to proceed
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center space-y-6">
            <div className="p-3 bg-gray-900/60 border border-gray-800 rounded-lg w-full">
              <p className="text-gray-300 text-center text-sm mb-2">
                <Lock className="h-4 w-4 inline-block mr-1 text-green-500" />
                Sign in with your Okta account to access:
              </p>
              <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                <li>Your personal user profile</li>
                <li>Scenario execution history</li>
                <li>Custom scenario configurations</li>
                <li>Usage analytics and reporting</li>
              </ul>
            </div>
            <Button 
              onClick={() => login(location)}
              className="bg-green-700 hover:bg-green-600 text-white w-full"
            >
              <Lock className="mr-2 h-4 w-4" />
              Secure Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If authenticated, render children
  return <>{children}</>;
}