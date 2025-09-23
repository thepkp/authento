import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertVerificationLogSchema } from "@shared/schema";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // For demo purposes, we'll use simple password comparison
      // In production, use bcrypt.compare
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Protected routes
  app.get("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Certificate verification
  app.post("/api/verify/certificate", authenticateToken, async (req: any, res) => {
    try {
      const { ocrData, imageUrl } = req.body;
      
      let verificationStatus = 'failed';
      let verificationDetails: any = {
        databaseMatch: false,
        institutionVerified: false,
        formatValidation: false,
        blacklistCheck: false,
      };

      // Try to find certificate by student name or certificate ID
      let certificate = null;
      if (ocrData.certificateId) {
        certificate = await storage.getCertificateByCertificateId(ocrData.certificateId);
      } else if (ocrData.studentName) {
        certificate = await storage.getCertificateByStudentName(ocrData.studentName);
      }

      if (certificate) {
        verificationDetails.databaseMatch = true;
        verificationDetails.institutionVerified = true;
        verificationDetails.formatValidation = true;

        // Check blacklist
        const blacklistEntry = await storage.getBlacklistByCertificateId(certificate.certificateId);
        if (!blacklistEntry) {
          verificationDetails.blacklistCheck = true;
          verificationStatus = 'verified';
        }
      }

      // Create verification log
      const logData = {
        userId: req.user.userId,
        certificateId: certificate?.id || null,
        status: verificationStatus,
        ocrData,
        imageUrl,
        verificationDetails,
      };

      const verificationLog = await storage.createVerificationLog(logData);

      res.json({
        id: verificationLog.id,
        status: verificationStatus,
        certificate: certificate || null,
        verificationDetails,
        ocrData,
      });
    } catch (error) {
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // OCR processing endpoint
  app.post("/api/ocr/process", authenticateToken, async (req: any, res) => {
    try {
      const { imageData } = req.body;
      
      // In a real implementation, this would process the image with OCR
      // For now, we'll return mock OCR data based on the sample certificate
      const mockOcrData = {
        studentName: "John Smith",
        institution: "MIT",
        degree: "Computer Science",
        year: "2023",
        certificateId: "MIT-CS-2023-001247",
        confidence: 0.95,
      };

      res.json({
        success: true,
        data: mockOcrData,
      });
    } catch (error) {
      res.status(500).json({ message: "OCR processing failed" });
    }
  });

  // Get verification history
  app.get("/api/verification/history", authenticateToken, async (req: any, res) => {
    try {
      const verificationLogs = await storage.getVerificationLogsByUser(req.user.userId);
      
      // Enrich with certificate data
      const enrichedLogs = await Promise.all(
        verificationLogs.map(async (log) => {
          let certificate = null;
          if (log.certificateId) {
            certificate = await storage.getCertificate(log.certificateId);
          }
          
          return {
            ...log,
            certificate,
          };
        })
      );

      res.json(enrichedLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch verification history" });
    }
  });

  // Get verification statistics
  app.get("/api/verification/stats", authenticateToken, async (req: any, res) => {
    try {
      const stats = await storage.getVerificationStats(req.user.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get all certificates (for admin/bulk operations)
  app.get("/api/certificates", authenticateToken, async (req: any, res) => {
    try {
      const certificates = await storage.getAllCertificates();
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
