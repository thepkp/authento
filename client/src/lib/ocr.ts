import Tesseract from 'tesseract.js';

export interface OCRResult {
  studentName: string;
  institution: string;
  degree: string;
  year: string;
  certificateId: string;
  confidence: number;
}

export interface OCRProgress {
  status: string;
  progress: number;
}

export class OCRService {
  private worker: Tesseract.Worker | null = null;

  async initialize(): Promise<void> {
    if (this.worker) {
      return;
    }

    this.worker = await Tesseract.createWorker('eng', 1, {
      logger: m => console.log('[OCR]', m)
    });
    
    await this.worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .-:/',
    });
  }

  async processImage(
    imageData: string, 
    onProgress?: (progress: OCRProgress) => void
  ): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('Failed to initialize OCR worker');
    }

    const { data } = await this.worker.recognize(imageData, {}, {
      logger: (m) => {
        if (onProgress && m.status && typeof m.progress === 'number') {
          onProgress({
            status: m.status,
            progress: m.progress
          });
        }
      }
    });

    // Extract structured data from OCR text
    const extractedData = this.extractCertificateData(data.text);
    
    return {
      ...extractedData,
      confidence: data.confidence / 100
    };
  }

  private extractCertificateData(text: string): Omit<OCRResult, 'confidence'> {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Default values
    let studentName = '';
    let institution = '';
    let degree = '';
    let year = '';
    let certificateId = '';

    // Patterns for extraction
    const namePatterns = [
      /(?:name|student|candidate|recipient)[\s:]+([A-Za-z\s]+)/i,
      /^([A-Z][a-z]+ [A-Z][a-z]+)$/,
    ];

    const institutionPatterns = [
      /(?:university|college|institute|school)[\s:]*([A-Za-z\s]+)/i,
      /(MIT|Stanford|Harvard|Berkeley|Yale|Princeton)/i,
    ];

    const degreePatterns = [
      /(?:degree|bachelor|master|phd|diploma)[\s:]*([A-Za-z\s\-]+)/i,
      /(?:BS|BA|MS|MA|PhD|MBA)[\s\-]*([A-Za-z\s]+)/i,
    ];

    const yearPatterns = [
      /(?:year|date|graduated|issued)[\s:]*(\d{4})/i,
      /\b(19|20)\d{2}\b/,
    ];

    const idPatterns = [
      /(?:id|number|certificate)[\s:]*([A-Z0-9\-]+)/i,
      /\b[A-Z]{2,}-[A-Z0-9\-]+\b/,
    ];

    // Extract information
    for (const line of lines) {
      // Try to extract student name
      if (!studentName) {
        for (const pattern of namePatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim().length > 3) {
            studentName = match[1].trim();
            break;
          }
        }
      }

      // Try to extract institution
      if (!institution) {
        for (const pattern of institutionPatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            institution = match[1].trim();
            break;
          }
        }
      }

      // Try to extract degree
      if (!degree) {
        for (const pattern of degreePatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            degree = match[1].trim();
            break;
          }
        }
      }

      // Try to extract year
      if (!year) {
        for (const pattern of yearPatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            year = match[1];
            break;
          }
        }
      }

      // Try to extract certificate ID
      if (!certificateId) {
        for (const pattern of idPatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            certificateId = match[1].trim();
            break;
          }
        }
      }
    }

    return {
      studentName: studentName || 'Unknown',
      institution: institution || 'Unknown',
      degree: degree || 'Unknown',
      year: year || 'Unknown',
      certificateId: certificateId || 'Unknown'
    };
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();
