import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

// Define our own User type to avoid issues with Date vs null vs undefined
interface User {
  id: number;
  name: string;
  email: string;
  oktaId: string;
  avatar: string | null;
  lastLogin?: string | null;
  createdAt?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (redirectTo?: string) => void;
  logout: (redirectTo?: string) => void;
  authStatusChecked: boolean;
  authConfigured: boolean;
  refetchUser: () => Promise<User | null>;
}

const defaultContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  authStatusChecked: false,
  authConfigured: false,
  refetchUser: async () => null
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authConfigured, setAuthConfigured] = useState<boolean>(false);
  const [authStatusChecked, setAuthStatusChecked] = useState<boolean>(false);
  const [location] = useLocation();

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        setAuthConfigured(data.configured);
      } catch (error) {
        console.error('Failed to check auth status:', error);
      } finally {
        setAuthStatusChecked(true);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Get the current user
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/me'],
    refetchOnWindowFocus: true,
    retry: false,
    enabled: authStatusChecked && authConfigured
  });

  // Refetch user data
  const refetchUser = async (): Promise<User | null> => {
    try {
      const result = await refetch();
      return result.data as User || null;
    } catch (error) {
      return null;
    }
  };

  // Update user state when data changes
  useEffect(() => {
    if (data && !error) {
      setUser(data as User);
    } else {
      setUser(null);
    }
  }, [data, error]);

  // Login with redirect
  const login = (redirectTo?: string) => {
    const currentPath = redirectTo || location;
    const loginUrl = `/login${currentPath ? `?redirect_to=${encodeURIComponent(currentPath)}` : ''}`;
    window.location.href = loginUrl;
  };

  // Logout with redirect
  const logout = (redirectTo?: string) => {
    const currentPath = redirectTo || '/';
    // Clear user data from query cache
    queryClient.setQueryData(['/api/me'], null);
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    
    // Redirect to logout endpoint
    window.location.href = `/logout${currentPath ? `?redirect_to=${encodeURIComponent(currentPath)}` : ''}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || !authStatusChecked,
        isAuthenticated: !!user,
        login,
        logout,
        authStatusChecked,
        authConfigured,
        refetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);