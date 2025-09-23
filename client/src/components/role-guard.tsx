import { useEffect } from "react";
import { useLocation } from "wouter";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const user = authService.getUser();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setLocation("/");
      return;
    }

    if (!user || !allowedRoles.includes(user.role)) {
      // Redirect to correct portal based on user role
      const routeMap = {
        student: "/student",
        employer: "/dashboard",
        admin: "/admin"
      };

      const correctRoute = routeMap[user?.role as keyof typeof routeMap] || "/";
      
      toast({
        variant: "destructive",
        title: "Access denied",
        description: `Redirecting to your ${user?.role} portal`,
      });
      
      setLocation(correctRoute);
      return;
    }
  }, [user, allowedRoles, setLocation, toast]);

  // Don't render children if user doesn't have access
  if (!authService.isAuthenticated() || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}