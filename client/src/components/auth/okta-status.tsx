import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

// Define type for the auth status response
interface AuthStatusResponse {
  configured: boolean;
  provider: string;
  message: string;
}

export function OktaStatus() {
  // Query to check if Okta is configured on the server
  const { data, isLoading } = useQuery<AuthStatusResponse>({
    queryKey: ['/api/auth/status'],
    retry: false,
  });

  const isOktaConfigured = data?.configured === true;

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  if (isOktaConfigured) {
    return null; // Don't show anything if Okta is configured
  }

  return (
    <Alert className="border-amber-600 bg-amber-950/20 mb-4">
      <AlertCircle className="h-4 w-4 text-amber-400" />
      <AlertTitle className="text-amber-400">Authentication Not Configured</AlertTitle>
      <AlertDescription className="text-amber-200/70">
        <p>Okta SSO is not configured. Users can still access scenarios but profile features are limited.</p>
        <p className="text-xs mt-1 text-amber-200/50">
          For administrators: Set OKTA_ISSUER, OKTA_CLIENT_ID, and OKTA_CLIENT_SECRET environment variables
          to enable full authentication features.
        </p>
      </AlertDescription>
    </Alert>
  );
}