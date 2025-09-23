import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MobileHeader } from "@/components/mobile-header";
import { VerificationBadge } from "@/components/verification-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth";
import { Search } from "lucide-react";
import { useState } from "react";

interface VerificationLogWithCertificate {
  id: string;
  status: 'verified' | 'failed' | 'pending';
  ocrData: {
    studentName: string;
    institution: string;
    degree: string;
    certificateId: string;
  };
  createdAt: string;
  certificate?: {
    studentName: string;
    institution: string;
    degree: string;
  };
}

export default function History() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: verificationHistory, isLoading } = useQuery<VerificationLogWithCertificate[]>({
    queryKey: ['/api/verification/history'],
    enabled: !!authService.getToken(),
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setLocation("/");
    }
  }, [setLocation]);

  const filteredHistory = verificationHistory?.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const studentName = item.ocrData?.studentName || item.certificate?.studentName || '';
    const institution = item.ocrData?.institution || item.certificate?.institution || '';
    const certificateId = item.ocrData?.certificateId || '';
    
    return (
      studentName.toLowerCase().includes(searchLower) ||
      institution.toLowerCase().includes(searchLower) ||
      certificateId.toLowerCase().includes(searchLower)
    );
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader 
        title="Verification History"
        subtitle="Past verification attempts"
        onBack={() => setLocation("/dashboard")}
      />

      <div className="p-4">
        {/* Search and Filter */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Verification Records */}
        {!isLoading && filteredHistory.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground" data-testid="text-no-results">
                {searchQuery ? "No verification records found matching your search." : "No verification history found."}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const studentName = item.ocrData?.studentName || item.certificate?.studentName || 'Unknown';
            const institution = item.ocrData?.institution || item.certificate?.institution || 'Unknown';
            const degree = item.ocrData?.degree || item.certificate?.degree || 'Unknown';
            
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium" data-testid={`text-student-name-${item.id}`}>
                        {studentName}
                      </h3>
                      <p className="text-sm text-muted-foreground" data-testid={`text-institution-${item.id}`}>
                        {institution}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-degree-${item.id}`}>
                        {degree}
                      </p>
                    </div>
                    <VerificationBadge 
                      status={item.status} 
                      data-testid={`badge-status-${item.id}`}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground" data-testid={`text-date-${item.id}`}>
                      {formatDate(item.createdAt)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary hover:underline h-auto p-0"
                      data-testid={`button-view-details-${item.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
