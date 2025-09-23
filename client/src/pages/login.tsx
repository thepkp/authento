import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { Shield } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "demo@example.com",
    password: "demo123",
  });

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
      await authService.login(formData.email, formData.password);
      toast({
        title: "Login successful",
        description: "Welcome to AUTHENTO",
      });
      setLocation("/dashboard");
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

      <Card className="shadow-sm border border-border mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4" data-testid="text-signin-title">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
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
