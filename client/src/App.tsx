import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ScriptDetail from "@/pages/script-detail";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import AuthPage from "@/pages/auth-page";
import { Layout } from "@/components/layout/layout";
import { ThemeProvider } from "@/context/theme-provider";
import { AuthProvider, useAuth } from "@/context/auth-provider";
import { Shield } from "lucide-react";

function MainRouter() {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;

  // If loading, show nothing yet
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Shield className="h-12 w-12 text-blue-400 animate-pulse" />
          <p className="text-gray-300">Loading Demo Codex...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, only show auth page
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route>
          <AuthPage />
        </Route>
      </Switch>
    );
  }

  // If authenticated, show main application
  return (
    <Switch>
      <Route path="/auth">
        <Home />
      </Route>
      
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/scenarios/:id">
              {(params) => <ScriptDetail id={parseInt(params.id, 10)} />}
            </Route>
            <Route path="/settings" component={Settings} />
            <Route path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MainRouter />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
