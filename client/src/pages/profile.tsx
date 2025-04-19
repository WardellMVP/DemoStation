import React from 'react';
import { Layout } from '@/components/layout/layout';
import { UserProfile } from '@/components/profile/user-profile';
import { useAuth } from '@/context/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserData } from '@/hooks/use-user-data';
import { UserScenarioUsage, ScenarioExecution, ThreatScenario } from '@/lib/types';
import { useScenarios } from '@/hooks/use-scenarios';

export default function Profile() {
  const { isAuthenticated } = useAuth();
  
  // Get the current location to check for tab query param
  const urlParams = new URLSearchParams(window.location.search);
  const tabFromUrl = urlParams.get('tab');
  const defaultTab = tabFromUrl === 'usage' || tabFromUrl === 'executions' || tabFromUrl === 'settings' 
    ? tabFromUrl 
    : 'usage';
  
  // Get user data with our new hook
  const { 
    scenarioUsage, 
    isLoadingUsage, 
    executionHistory, 
    isLoadingExecutions 
  } = useUserData();
  
  // Get all scenarios to map IDs to names
  const { getAllScenarios } = useScenarios();
  const { data: scenarios = [] } = getAllScenarios() as { data: ThreatScenario[] };
  
  return (
    <Layout>
      <div className="container mx-auto p-4 lg:p-8">
        <h1 className="text-3xl font-bold text-green-500 mb-6">User Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <UserProfile />
          </div>
          
          <div className="md:col-span-2">
            {isAuthenticated ? (
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="bg-gray-900 border border-gray-800">
                  <TabsTrigger value="usage">Scenario Usage</TabsTrigger>
                  <TabsTrigger value="executions">Execution History</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="usage">
                  <Card className="border border-gray-800 bg-black/50">
                    <CardHeader>
                      <CardTitle className="text-green-500">Scenario Usage</CardTitle>
                      <CardDescription>Your recently used scenarios</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingUsage ? (
                        <div className="space-y-4">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : scenarioUsage && scenarioUsage.length > 0 ? (
                        <ul className="space-y-4">
                          {scenarioUsage.map((usage: UserScenarioUsage) => {
                            // Find the scenario name from the ID
                            const scenario = scenarios.find(s => s.id === usage.scenarioId);
                            return (
                              <li key={usage.id} className="flex justify-between p-3 border border-gray-800 rounded-md bg-gray-900/50">
                                <div>
                                  <p className="font-medium text-white">
                                    {scenario?.name || `Scenario ID ${usage.scenarioId}`}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    Last used {formatRelativeTime(usage.usedAt)}
                                  </p>
                                </div>
                                <div className="self-center">
                                  <Badge variant="outline" className="bg-green-700 border-green-600">
                                    {new Date(usage.usedAt).toLocaleDateString()}
                                  </Badge>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <p>You haven't used any scenarios yet.</p>
                          <p className="mt-2">Start by exploring the available scenarios on the home page.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="executions">
                  <Card className="border border-gray-800 bg-black/50">
                    <CardHeader>
                      <CardTitle className="text-green-500">Execution History</CardTitle>
                      <CardDescription>Your recent scenario executions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingExecutions ? (
                        <div className="space-y-4">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : executionHistory && executionHistory.length > 0 ? (
                        <ul className="space-y-4">
                          {executionHistory.map((execution: ScenarioExecution) => {
                            // Find the scenario name from the ID
                            const scenario = scenarios.find(s => s.id === execution.scenarioId);
                            return (
                              <li key={execution.id} className="p-3 border border-gray-800 rounded-md bg-gray-900/50">
                                <div className="flex justify-between mb-2">
                                  <p className="font-medium text-white">
                                    {scenario?.name || `Scenario ID ${execution.scenarioId}`}
                                  </p>
                                  <Badge className={
                                    execution.status === 'completed' ? 'bg-green-700' :
                                    execution.status === 'failed' ? 'bg-red-700' : 
                                    'bg-yellow-700'
                                  }>
                                    {execution.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-400">
                                  Executed {formatRelativeTime(execution.timestamp)}
                                </p>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <p>You haven't executed any scenarios yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings">
                  <Card className="border border-gray-800 bg-black/50">
                    <CardHeader>
                      <CardTitle className="text-green-500">Account Settings</CardTitle>
                      <CardDescription>Manage your account preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 italic">
                        Account settings are managed through your Okta account.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="border border-gray-800 bg-black/50 h-full flex items-center justify-center py-12">
                <CardContent className="text-center">
                  <p className="text-lg text-gray-400 mb-4">
                    Sign in to view your scenario usage history and account details.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}