import React from 'react';
import { useAuth } from '@/context/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { Redirect } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // While checking authentication status, show a loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          <Card className="border border-gray-800 bg-black/50">
            <CardHeader>
              <CardTitle className="text-green-500">Loading</CardTitle>
              <CardDescription>Verifying authentication status...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-800 rounded"></div>
                    <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If not authenticated, show access denied or redirect
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          <Card className="border border-gray-800 bg-black/50">
            <CardHeader>
              <CardTitle className="text-green-500">Access Denied</CardTitle>
              <CardDescription>Authentication required</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Shield className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center text-gray-400 mb-4">
                You need to sign in with your Okta account to access this page.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.location.href = redirectTo}>
                Go Back
              </Button>
              <Button onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
}