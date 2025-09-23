import { type User, type InsertUser, type Certificate, type InsertCertificate, type VerificationLog, type InsertVerificationLog, type Blacklist, users, certificates, verificationLogs, blacklist } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, ilike, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const connectionString = process.env.DATABASE_URL!;
const client = neon(connectionString);
const db = drizzle(client);

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

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with sample data on first run
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    try {
      // Check if certificates already exist
      const existingCerts = await db.select().from(certificates).limit(1);
      if (existingCerts.length > 0) {
        return; // Data already exists
      }

      // Sample certificates
      const sampleCerts: InsertCertificate[] = [
        {
          certificateId: "MIT-CS-2023-001247",
          studentName: "John Smith",
          institution: "MIT",
          degree: "Computer Science",
          year: "2023",
        },
        {
          certificateId: "STANFORD-MBA-2023-002156",
          studentName: "Sarah Johnson",
          institution: "Stanford University",
          degree: "MBA - Business Administration",
          year: "2023",
        },
        {
          certificateId: "BERKELEY-CS-2023-003087",
          studentName: "Michael Chen",
          institution: "UC Berkeley",
          degree: "BS - Computer Science",
          year: "2023",
        },
        {
          certificateId: "GATECH-DS-2023-004123",
          studentName: "David Rodriguez",
          institution: "Georgia Tech",
          degree: "MS - Data Science",
          year: "2023",
        }
      ];

      await db.insert(certificates).values(sampleCerts);
    } catch (error) {
      console.log('Sample data already exists or error inserting:', error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      role: insertUser.role || "employer"
    }).returning();
    return result[0];
  }

  async getCertificate(id: string): Promise<Certificate | undefined> {
    const result = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
    return result[0];
  }

  async getCertificateByStudentName(name: string): Promise<Certificate | undefined> {
    const result = await db.select().from(certificates)
      .where(ilike(certificates.studentName, `%${name}%`)).limit(1);
    return result[0];
  }

  async getCertificateByCertificateId(certId: string): Promise<Certificate | undefined> {
    const result = await db.select().from(certificates)
      .where(eq(certificates.certificateId, certId)).limit(1);
    return result[0];
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const result = await db.insert(certificates).values(insertCertificate).returning();
    return result[0];
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return await db.select().from(certificates);
  }

  async createVerificationLog(insertLog: InsertVerificationLog): Promise<VerificationLog> {
    const result = await db.insert(verificationLogs).values({
      ...insertLog,
      userId: insertLog.userId || null,
      certificateId: insertLog.certificateId || null,
      imageUrl: insertLog.imageUrl || null,
      ocrData: insertLog.ocrData || {},
      verificationDetails: insertLog.verificationDetails || {},
    }).returning();
    return result[0];
  }

  async getVerificationLogsByUser(userId: string): Promise<VerificationLog[]> {
    return await db.select().from(verificationLogs)
      .where(eq(verificationLogs.userId, userId))
      .orderBy(sql`created_at DESC`);
  }

  async getVerificationLog(id: string): Promise<VerificationLog | undefined> {
    const result = await db.select().from(verificationLogs)
      .where(eq(verificationLogs.id, id)).limit(1);
    return result[0];
  }

  async getBlacklistByCertificateId(certId: string): Promise<Blacklist | undefined> {
    const result = await db.select().from(blacklist)
      .where(eq(blacklist.certificateId, certId)).limit(1);
    return result[0];
  }

  async getBlacklistByStudentName(name: string): Promise<Blacklist | undefined> {
    const result = await db.select().from(blacklist)
      .where(ilike(blacklist.studentName, name)).limit(1);
    return result[0];
  }

  async getVerificationStats(userId: string): Promise<{ verified: number; pending: number; failed: number }> {
    const [verifiedCount] = await db.select({ count: sql`count(*)` })
      .from(verificationLogs)
      .where(sql`${verificationLogs.userId} = ${userId} AND ${verificationLogs.status} = 'verified'`);
    
    const [pendingCount] = await db.select({ count: sql`count(*)` })
      .from(verificationLogs)
      .where(sql`${verificationLogs.userId} = ${userId} AND ${verificationLogs.status} = 'pending'`);
    
    const [failedCount] = await db.select({ count: sql`count(*)` })
      .from(verificationLogs)
      .where(sql`${verificationLogs.userId} = ${userId} AND ${verificationLogs.status} = 'failed'`);
    
    return {
      verified: Number(verifiedCount.count) || 0,
      pending: Number(pendingCount.count) || 0,
      failed: Number(failedCount.count) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
