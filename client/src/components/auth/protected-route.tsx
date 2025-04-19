import React from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '@/context/auth-provider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  path: string;
  children: React.ReactNode;
}

export function ProtectedRoute({ path, children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen bg-background">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : isAuthenticated ? (
        children
      ) : (
        <Redirect to="/auth" />
      )}
    </Route>
  );
}