import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const defaultContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => window.location.href = '/login',
  logout: () => window.location.href = '/logout'
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/me'],
    refetchOnWindowFocus: true,
    retry: false,
  });

  useEffect(() => {
    if (data && !error) {
      setUser(data);
    } else {
      setUser(null);
    }
  }, [data, error]);

  const login = () => {
    window.location.href = '/login';
  };

  const logout = () => {
    window.location.href = '/logout';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);