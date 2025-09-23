import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MobileHeader } from "@/components/mobile-header";
import { CameraCapture } from "@/components/camera-capture";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth";
import { Check, Clock, History, BarChart3, Upload } from "lucide-react";

interface Stats {
  verified: number;
  pending: number;
  failed: number;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [showCamera, setShowCamera] = useState(false);

  const user = authService.getUser();

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['/api/verification/stats'],
    enabled: !!authService.getToken(),
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setLocation("/");
    }
  }, [setLocation]);

  const handleLogout = () => {
    authService.logout();
    setLocation("/");
  };

  const handleCameraCapture = (imageData: string) => {
    setShowCamera(false);
    // Navigate to verification page with image data
    setLocation(`/verification?image=${encodeURIComponent(imageData)}`);
  };

  const handleShowHistory = () => {
    setLocation("/history");
  };

  if (!user) {
    return null;
  }

  if (showCamera) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader 
          title="Scan Certificate"
          subtitle="Position certificate within frame"
          onBack={() => setShowCamera(false)}
        />
        <div className="p-4">
          <CameraCapture 
            onCapture={handleCameraCapture}
            onCancel={() => setShowCamera(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader 
        title="AUTHENTO"
        subtitle={`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard`}
        showProfile
        onProfileClick={handleLogout}
      />

      <div className="p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Verified</span>
              </div>
              <div className="text-2xl font-bold" data-testid="text-verified-count">
                {statsLoading ? "..." : stats?.verified || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                +12% this month
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <div className="text-2xl font-bold" data-testid="text-pending-count">
                {statsLoading ? "..." : stats?.pending || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Processing
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Camera Scanner Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Scan Certificate</h2>
            
            <div className="w-full h-48 bg-black rounded-lg overflow-hidden relative mb-4">
              <div className="absolute inset-4 border-2 border-dashed border-primary rounded-lg bg-primary/10 flex items-center justify-center">
                <div className="text-center text-primary-foreground">
                  <i className="fas fa-camera text-3xl mb-2"></i>
                  <p className="text-sm">Position certificate within frame</p>
                  <div className="w-8 h-1 bg-primary mx-auto mt-4 animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCamera(true)}
                className="flex-1 bg-primary text-primary-foreground font-medium"
                data-testid="button-start-scan"
              >
                <i className="fas fa-camera mr-2"></i>
                Start Scan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <Button
                variant="ghost"
                onClick={handleShowHistory}
                className="w-full justify-start p-3 h-auto"
                data-testid="button-history"
              >
                <History className="w-5 h-5 mr-3 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">Verification History</div>
                  <div className="text-sm text-muted-foreground">View past verifications</div>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto"
                data-testid="button-analytics"
              >
                <BarChart3 className="w-5 h-5 mr-3 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">Analytics</div>
                  <div className="text-sm text-muted-foreground">View detailed reports</div>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto"
                data-testid="button-bulk-upload"
              >
                <Upload className="w-5 h-5 mr-3 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">Bulk Upload</div>
                  <div className="text-sm text-muted-foreground">Upload multiple certificates</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
