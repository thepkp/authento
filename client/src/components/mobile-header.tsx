import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showProfile?: boolean;
  onProfileClick?: () => void;
}

export function MobileHeader({ 
  title, 
  subtitle, 
  onBack, 
  showProfile = false,
  onProfileClick 
}: MobileHeaderProps) {
  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 rounded-full hover:bg-muted"
              onClick={onBack}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
          )}
          
          {!onBack && (
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-shield-alt text-primary-foreground"></i>
            </div>
          )}
          
          <div>
            <h1 className="font-bold text-lg" data-testid="text-header-title">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground" data-testid="text-header-subtitle">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {showProfile && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 rounded-full hover:bg-muted"
            onClick={onProfileClick}
            data-testid="button-profile"
          >
            <User className="w-5 h-5 text-muted-foreground" />
          </Button>
        )}
      </div>
    </header>
  );
}
