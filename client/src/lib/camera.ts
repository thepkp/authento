export interface CameraPermissions {
  video: boolean;
  audio?: boolean;
}

export class CameraService {
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  async startCamera(videoElement: HTMLVideoElement): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      this.video = videoElement;
      videoElement.srcObject = this.stream;
      await videoElement.play();
      
      return true;
    } catch (error) {
      console.error('Failed to start camera:', error);
      return false;
    }
  }

  captureImage(): string | null {
    if (!this.video || !this.stream) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      return null;
    }

    // Set canvas dimensions to match video
    canvas.width = this.video.videoWidth;
    canvas.height = this.video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(this.video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64 image data
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }
  }

  switchCamera(): Promise<boolean> {
    // Stop current camera
    this.stopCamera();
    
    // Start with different facing mode
    // This is a simplified implementation
    return this.video ? this.startCamera(this.video) : Promise.resolve(false);
  }
}

export const cameraService = new CameraService();
