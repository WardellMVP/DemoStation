import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

// Define our own User type to avoid issues with Date vs null vs undefined
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  oktaId?: string | null;
  lastLogin?: string | null;
  createdAt?: string | null;
}

// Auth request and response types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  authStatusChecked: boolean;
  authConfigured: boolean;
  refetchUser: () => Promise<User | null>;
  loginError: string | null;
  registerError: string | null;
  isLoginPending: boolean;
  isRegisterPending: boolean;
}

const defaultContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  logout: async () => false,
  register: async () => false,
  authStatusChecked: false,
  authConfigured: false,
  refetchUser: async () => null,
  loginError: null,
  registerError: null,
  isLoginPending: false,
  isRegisterPending: false
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authConfigured, setAuthConfigured] = useState<boolean>(false);
  const [authStatusChecked, setAuthStatusChecked] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

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

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest('POST', '/api/login', credentials);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      return response.json();
    },
    onSuccess: (userData: User) => {
      setUser(userData);
      setLoginError(null);
      queryClient.setQueryData(['/api/me'], userData);
      
      // Show success toast
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData.name}!`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      setLoginError(error.message);
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await apiRequest('POST', '/api/register', credentials);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      return response.json();
    },
    onSuccess: (userData: User) => {
      setUser(userData);
      setRegisterError(null);
      queryClient.setQueryData(['/api/me'], userData);
      
      // Show success toast
      toast({
        title: 'Registration successful',
        description: `Welcome, ${userData.name}!`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      setRegisterError(error.message);
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/logout');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Logout failed');
      }
      return response.json();
    },
    onSuccess: () => {
      // Clear user data and invalidate queries
      setUser(null);
      queryClient.setQueryData(['/api/me'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      
      // Redirect to home
      setLocation('/');
      
      // Show success toast
      toast({
        title: 'Logout successful',
        description: 'You have been logged out',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
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

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch {
      return false;
    }
  };

  // Register function
  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      await registerMutation.mutateAsync(credentials);
      return true;
    } catch {
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<boolean> => {
    try {
      await logoutMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || !authStatusChecked,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        authStatusChecked,
        authConfigured,
        refetchUser,
        loginError,
        registerError,
        isLoginPending: loginMutation.isPending,
        isRegisterPending: registerMutation.isPending
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);