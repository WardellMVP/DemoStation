import React from 'react';
import { useAuth } from '@/context/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, LogOut, UserCircle } from 'lucide-react';

export function UserProfile() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md border border-gray-800">
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md border border-gray-800 bg-black/50">
        <CardHeader>
          <CardTitle className="text-blue-500">Authentication Required</CardTitle>
          <CardDescription>You need to sign in to access your profile.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Shield className="h-16 w-16 text-blue-500 mb-4" />
          <p className="text-center text-gray-400 mb-4">
            Sign in to view your profile and access secure features.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              login();
            }}
          >
            Sign In
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border border-gray-800 bg-black/50">
      <CardHeader>
        <CardTitle className="text-blue-500">User Profile</CardTitle>
        <CardDescription>Your personal account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 border-2 border-blue-500">
            <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
            <AvatarFallback className="bg-gray-900 text-blue-500">
              <UserCircle className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400">Last Login</span>
            <span className="text-white">{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</span>
          </div>
          
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400">Account Created</span>
            <span className="text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="destructive" 
          className="w-full" 
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
}