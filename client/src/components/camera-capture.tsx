import { useRef, useState, useEffect } from "react";
import { Camera, RotateCcw, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cameraService } from "@/lib/camera";
import { cn } from "@/lib/utils";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function CameraCapture({ onCapture, onCancel, className }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    
    return () => {
      cameraService.stopCamera();
    };
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;

    try {
      setError(null);
      const success = await cameraService.startCamera(videoRef.current);
      if (success) {
        setIsActive(true);
      } else {
        setError("Failed to access camera");
      }
    } catch (err) {
      setError("Camera access denied");
    }
  };

  const handleCapture = () => {
    const imageData = cameraService.captureImage();
    if (imageData) {
      onCapture(imageData);
      cameraService.stopCamera();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        onCapture(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    cameraService.stopCamera();
    onCancel?.();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Camera Container */}
      <div className="relative w-full h-80 bg-black rounded-lg overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
            <div>
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{error}</p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-2"
                onClick={startCamera}
                data-testid="button-retry-camera"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
              data-testid="video-camera-feed"
            />
            
            {/* Scan Overlay */}
            <div className="absolute inset-4 border-2 border-dashed border-primary rounded-lg bg-primary/10 flex items-center justify-center">
              <div className="text-center text-primary-foreground">
                <Camera className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Position certificate within frame</p>
                <div className="w-8 h-1 bg-primary mx-auto mt-4 animate-pulse"></div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={handleCapture}
          disabled={!isActive}
          className="flex-1 bg-primary text-primary-foreground font-medium"
          data-testid="button-capture"
        >
          <Camera className="w-4 h-4 mr-2" />
          Capture
        </Button>
        
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
          data-testid="button-gallery"
        >
          <Image className="w-4 h-4 mr-2" />
          Gallery
        </Button>
        
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="px-3"
            data-testid="button-cancel"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        data-testid="input-file"
      />
    </div>
  );
}
