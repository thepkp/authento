import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Verification from "@/pages/verification";
import History from "@/pages/history";
import NotFound from "@/pages/not-found";
import { RoleGuard } from "@/components/role-guard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/student">
        <RoleGuard allowedRoles={["student"]}>
          <Dashboard />
        </RoleGuard>
      </Route>
      <Route path="/dashboard">
        <RoleGuard allowedRoles={["employer"]}>
          <Dashboard />
        </RoleGuard>
      </Route>
      <Route path="/admin">
        <RoleGuard allowedRoles={["admin"]}>
          <Dashboard />
        </RoleGuard>
      </Route>
      <Route path="/verification" component={Verification} />
      <Route path="/history" component={History} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="app-container max-w-md mx-auto min-h-screen bg-background">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
