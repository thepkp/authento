import { Check, Clock, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  status: 'verified' | 'pending' | 'failed' | 'processing';
  className?: string;
}

const statusConfig = {
  verified: {
    icon: Check,
    text: 'Verified',
    className: 'bg-secondary/10 text-secondary border-secondary/20'
  },
  pending: {
    icon: Clock,
    text: 'Pending',
    className: 'bg-accent/10 text-accent border-accent/20'
  },
  failed: {
    icon: X,
    text: 'Failed',
    className: 'bg-destructive/10 text-destructive border-destructive/20'
  },
  processing: {
    icon: AlertCircle,
    text: 'Processing',
    className: 'bg-primary/10 text-primary border-primary/20'
  }
};

export function VerificationBadge({ status, className }: VerificationBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium",
        config.className,
        className
      )}
      data-testid={`badge-${status}`}
    >
      <Icon className="w-4 h-4" />
      {config.text}
    </div>
  );
}
