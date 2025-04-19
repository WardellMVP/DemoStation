import { Switch, Route } from "wouter";
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
import { AuthProvider } from "@/context/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/scenarios/:id">
              {(params) => (
                <ProtectedRoute path={`/scenarios/${params.id}`}>
                  <ScriptDetail id={params.id} />
                </ProtectedRoute>
              )}
            </Route>
            <Route path="/settings">
              <ProtectedRoute path="/settings">
                <Settings />
              </ProtectedRoute>
            </Route>
            <Route path="/profile">
              <ProtectedRoute path="/profile">
                <Profile />
              </ProtectedRoute>
            </Route>
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
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
