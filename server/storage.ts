import { type User, type InsertUser, type Certificate, type InsertCertificate, type VerificationLog, type InsertVerificationLog, type Blacklist } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Certificate operations
  getCertificate(id: string): Promise<Certificate | undefined>;
  getCertificateByStudentName(name: string): Promise<Certificate | undefined>;
  getCertificateByCertificateId(certId: string): Promise<Certificate | undefined>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getAllCertificates(): Promise<Certificate[]>;

  // Verification log operations
  createVerificationLog(log: InsertVerificationLog): Promise<VerificationLog>;
  getVerificationLogsByUser(userId: string): Promise<VerificationLog[]>;
  getVerificationLog(id: string): Promise<VerificationLog | undefined>;

  // Blacklist operations
  getBlacklistByCertificateId(certId: string): Promise<Blacklist | undefined>;
  getBlacklistByStudentName(name: string): Promise<Blacklist | undefined>;

  // Statistics
  getVerificationStats(userId: string): Promise<{ verified: number; pending: number; failed: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private certificates: Map<string, Certificate>;
  private verificationLogs: Map<string, VerificationLog>;
  private blacklist: Map<string, Blacklist>;

  constructor() {
    this.users = new Map();
    this.certificates = new Map();
    this.verificationLogs = new Map();
    this.blacklist = new Map();

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample certificates
    const sampleCerts: Certificate[] = [
      {
        id: "cert-1",
        certificateId: "MIT-CS-2023-001247",
        studentName: "John Smith",
        institution: "MIT",
        degree: "Computer Science",
        year: "2023",
        issuedDate: new Date("2023-06-15"),
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "cert-2",
        certificateId: "STANFORD-MBA-2023-002156",
        studentName: "Sarah Johnson",
        institution: "Stanford University",
        degree: "MBA - Business Administration",
        year: "2023",
        issuedDate: new Date("2023-05-20"),
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "cert-3",
        certificateId: "BERKELEY-CS-2023-003087",
        studentName: "Michael Chen",
        institution: "UC Berkeley",
        degree: "BS - Computer Science",
        year: "2023",
        issuedDate: new Date("2023-05-15"),
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "cert-4",
        certificateId: "GATECH-DS-2023-004123",
        studentName: "David Rodriguez",
        institution: "Georgia Tech",
        degree: "MS - Data Science",
        year: "2023",
        issuedDate: new Date("2023-05-10"),
        isActive: true,
        createdAt: new Date(),
      }
    ];

    sampleCerts.forEach(cert => this.certificates.set(cert.id, cert));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getCertificate(id: string): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }

  async getCertificateByStudentName(name: string): Promise<Certificate | undefined> {
    return Array.from(this.certificates.values()).find(
      cert => cert.studentName.toLowerCase().includes(name.toLowerCase())
    );
  }

  async getCertificateByCertificateId(certId: string): Promise<Certificate | undefined> {
    return Array.from(this.certificates.values()).find(
      cert => cert.certificateId === certId
    );
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const id = randomUUID();
    const certificate: Certificate = {
      ...insertCertificate,
      id,
      issuedDate: new Date(),
      isActive: true,
      createdAt: new Date(),
    };
    this.certificates.set(id, certificate);
    return certificate;
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return Array.from(this.certificates.values());
  }

  async createVerificationLog(insertLog: InsertVerificationLog): Promise<VerificationLog> {
    const id = randomUUID();
    const log: VerificationLog = {
      ...insertLog,
      id,
      createdAt: new Date(),
    };
    this.verificationLogs.set(id, log);
    return log;
  }

  async getVerificationLogsByUser(userId: string): Promise<VerificationLog[]> {
    return Array.from(this.verificationLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getVerificationLog(id: string): Promise<VerificationLog | undefined> {
    return this.verificationLogs.get(id);
  }

  async getBlacklistByCertificateId(certId: string): Promise<Blacklist | undefined> {
    return Array.from(this.blacklist.values()).find(
      item => item.certificateId === certId
    );
  }

  async getBlacklistByStudentName(name: string): Promise<Blacklist | undefined> {
    return Array.from(this.blacklist.values()).find(
      item => item.studentName?.toLowerCase() === name.toLowerCase()
    );
  }

  async getVerificationStats(userId: string): Promise<{ verified: number; pending: number; failed: number }> {
    const userLogs = await this.getVerificationLogsByUser(userId);
    
    return {
      verified: userLogs.filter(log => log.status === 'verified').length,
      pending: userLogs.filter(log => log.status === 'pending').length,
      failed: userLogs.filter(log => log.status === 'failed').length,
    };
  }
}

export const storage = new MemStorage();
