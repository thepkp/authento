import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { MobileHeader } from "@/components/mobile-header";
import { VerificationBadge } from "@/components/verification-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { ocrService } from "@/lib/ocr";
import { apiRequest } from "@/lib/queryClient";
import { RotateCcw, Check, Save, Share2 } from "lucide-react";

interface OCRData {
  studentName: string;
  institution: string;
  degree: string;
  year: string;
  certificateId: string;
  confidence: number;
}

interface VerificationResult {
  id: string;
  status: 'verified' | 'failed' | 'pending';
  certificate: any;
  verificationDetails: {
    databaseMatch: boolean;
    institutionVerified: boolean;
    formatValidation: boolean;
    blacklistCheck: boolean;
  };
  ocrData: OCRData;
}

export default function Verification() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [imageData, setImageData] = useState<string>("");
  const [ocrData, setOcrData] = useState<OCRData | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setLocation("/");
      return;
    }

    // Get image data from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const imageParam = urlParams.get('image');
    if (imageParam) {
      const decodedImage = decodeURIComponent(imageParam);
      setImageData(decodedImage);
      processImage(decodedImage);
    } else {
      setLocation("/dashboard");
    }
  }, [setLocation]);

  const processImage = async (image: string) => {
    setIsProcessing(true);
    try {
      // Process with OCR
      const result = await ocrService.processImage(image, (progress) => {
        setOcrProgress(progress.progress);
      });
      
      setOcrData(result);
      
      // Send for verification
      await verifyMutation.mutateAsync({
        ocrData: result,
        imageUrl: image,
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: "Failed to process the certificate image",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyMutation = useMutation({
    mutationFn: async (data: { ocrData: OCRData; imageUrl: string }) => {
      const headers = authService.getAuthHeaders();
      const response = await apiRequest('POST', '/api/verify/certificate', {
        ...data,
        headers,
      });
      return response.json();
    },
    onSuccess: (data: VerificationResult) => {
      setVerificationResult(data);
      toast({
        title: "Verification complete",
        description: `Certificate ${data.status}`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "Failed to verify the certificate",
      });
    },
  });

  const handleRetake = () => {
    setLocation("/dashboard");
  };

  const handleSave = () => {
    toast({
      title: "Report saved",
      description: "Verification report has been saved",
    });
  };

  const handleShare = () => {
    if (navigator.share && verificationResult) {
      navigator.share({
        title: 'Certificate Verification Result',
        text: `Certificate verification: ${verificationResult.status}`,
      });
    } else {
      toast({
        title: "Share not supported",
        description: "Sharing is not supported on this device",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader 
        title="Certificate Verification"
        subtitle="Processing your document"
        onBack={() => setLocation("/dashboard")}
      />

      <div className="p-4 space-y-6">
        {/* Captured Image Preview */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Captured Image</h2>
            
            <div className="w-full h-48 bg-muted rounded-md overflow-hidden relative">
              {imageData && (
                <img 
                  src={imageData}
                  alt="Certificate preview"
                  className="w-full h-full object-cover"
                  data-testid="img-certificate-preview"
                />
              )}
              
              {isProcessing && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <div className="bg-card rounded-lg p-3 shadow-lg text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <span className="text-sm font-medium">Processing OCR...</span>
                    <Progress value={ocrProgress} className="mt-2 w-32" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetake}
                data-testid="button-retake"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              
              {ocrData && (
                <Button 
                  size="sm"
                  disabled={isProcessing}
                  data-testid="button-continue"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* OCR Extracted Data */}
        {ocrData && (
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3">Extracted Information</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Student Name:</span>
                  <span className="font-medium" data-testid="text-student-name">
                    {ocrData.studentName}
                  </span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Institution:</span>
                  <span className="font-medium" data-testid="text-institution">
                    {ocrData.institution}
                  </span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Degree:</span>
                  <span className="font-medium" data-testid="text-degree">
                    {ocrData.degree}
                  </span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Year:</span>
                  <span className="font-medium" data-testid="text-year">
                    {ocrData.year}
                  </span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Certificate ID:</span>
                  <span className="font-medium font-mono text-sm" data-testid="text-certificate-id">
                    {ocrData.certificateId}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification Results */}
        {verificationResult && (
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3">Verification Status</h2>
              
              <div className="mb-4">
                <VerificationBadge status={verificationResult.status} />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className={`w-4 h-4 ${verificationResult.verificationDetails.databaseMatch ? 'text-secondary' : 'text-muted-foreground'}`} />
                  <span className="text-sm">Database match found</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Check className={`w-4 h-4 ${verificationResult.verificationDetails.institutionVerified ? 'text-secondary' : 'text-muted-foreground'}`} />
                  <span className="text-sm">Institution verified</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Check className={`w-4 h-4 ${verificationResult.verificationDetails.formatValidation ? 'text-secondary' : 'text-muted-foreground'}`} />
                  <span className="text-sm">Format validation passed</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Check className={`w-4 h-4 ${verificationResult.verificationDetails.blacklistCheck ? 'text-secondary' : 'text-muted-foreground'}`} />
                  <span className="text-sm">No blacklist matches</span>
                </div>
              </div>

              {verificationResult.status === 'verified' && (
                <div className="mt-4 p-3 bg-secondary/10 rounded-md border border-secondary/20">
                  <p className="text-sm text-secondary">
                    <i className="fas fa-info-circle mr-2"></i>
                    This certificate has been successfully verified against our database and is authentic.
                  </p>
                </div>
              )}
              
              {verificationResult.status === 'failed' && (
                <div className="mt-4 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  <p className="text-sm text-destructive">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    This certificate could not be verified. It may be invalid or not in our database.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {verificationResult && (
          <div className="space-y-3">
            <Button 
              className="w-full bg-primary text-primary-foreground font-medium"
              onClick={handleSave}
              data-testid="button-save-report"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Verification Report
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={handleShare}
              data-testid="button-share-results"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
