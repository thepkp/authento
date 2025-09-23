import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { Shield, GraduationCap, Building2, ShieldCheck } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "employer" | "admin">("employer");
  const [formData, setFormData] = useState({
    email: "demo@example.com",
    password: "demo123",
  });

  const portals = [
    {
      role: "student" as const,
      title: "Student Portal",
      description: "Access your certificates and verification history",
      icon: GraduationCap,
      color: "bg-blue-50 border-blue-200 text-blue-700",
      selectedColor: "bg-blue-100 border-blue-400 ring-2 ring-blue-200"
    },
    {
      role: "employer" as const,
      title: "Employer Portal", 
      description: "Verify employee certificates and credentials",
      icon: Building2,
      color: "bg-green-50 border-green-200 text-green-700",
      selectedColor: "bg-green-100 border-green-400 ring-2 ring-green-200"
    },
    {
      role: "admin" as const,
      title: "Admin Portal",
      description: "Manage certificates, users, and system settings",
      icon: ShieldCheck,
      color: "bg-purple-50 border-purple-200 text-purple-700", 
      selectedColor: "bg-purple-100 border-purple-400 ring-2 ring-purple-200"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const authResponse = await authService.login(formData.email, formData.password);
      const userRole = authResponse.user.role;
      
      // Route based on actual user role from server, not selected role
      const routeMap = {
        student: "/student",
        employer: "/dashboard", 
        admin: "/admin"
      };
      
      // Show message if selected portal doesn't match user role
      if (selectedRole !== userRole) {
        toast({
          title: "Portal redirect",
          description: `Redirecting to ${userRole} portal based on your account type`,
        });
      } else {
        toast({
          title: "Login successful",
          description: `Welcome to AUTHENTO ${userRole} portal`,
        });
      }
      
      setLocation(routeMap[userRole as keyof typeof routeMap] || "/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed", 
        description: "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-background">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="text-primary-foreground text-2xl" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-app-title">
          AUTHENTO
        </h1>
        <p className="text-muted-foreground" data-testid="text-app-subtitle">
          Secure Certificate Verification
        </p>
      </div>

      {/* Portal Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 text-center" data-testid="text-portal-selection">Choose Your Portal</h2>
        <div className="grid grid-cols-1 gap-3">
          {portals.map((portal) => {
            const Icon = portal.icon;
            const isSelected = selectedRole === portal.role;
            return (
              <Card 
                key={portal.role}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected ? portal.selectedColor : portal.color
                }`}
                onClick={() => setSelectedRole(portal.role)}
                data-testid={`card-portal-${portal.role}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6" />
                    <div className="flex-1">
                      <h3 className="font-medium">{portal.title}</h3>
                      <p className="text-sm opacity-80">{portal.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-3 h-3 rounded-full bg-current" data-testid={`indicator-selected-${portal.role}`} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="shadow-sm border border-border mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4" data-testid="text-signin-title">
            Sign In to {portals.find(p => p.role === selectedRole)?.title}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={`Enter your ${selectedRole} email`}
                value={formData.email}
                onChange={handleInputChange}
                required
                data-testid="input-email"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                data-testid="input-password"
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-primary text-primary-foreground font-medium"
              disabled={isLoading}
              data-testid="button-signin"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <a href="#" className="text-primary text-sm hover:underline" data-testid="link-forgot-password">
              Forgot password?
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <a href="#" className="text-primary hover:underline" data-testid="link-signup">
          Sign up
        </a>
      </div>

      <div className="mt-6 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          Demo credentials: demo@example.com / demo123
        </p>
      </div>
    </div>
  );
}
