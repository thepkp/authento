import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("employer"), // student, employer, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  certificateId: text("certificate_id").notNull().unique(),
  studentName: text("student_name").notNull(),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  year: text("year").notNull(),
  issuedDate: timestamp("issued_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const verificationLogs = pgTable("verification_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  certificateId: varchar("certificate_id").references(() => certificates.id),
  status: text("status").notNull(), // verified, failed, pending
  ocrData: jsonb("ocr_data"),
  imageUrl: text("image_url"),
  verificationDetails: jsonb("verification_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blacklist = pgTable("blacklist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  certificateId: text("certificate_id"),
  studentName: text("student_name"),
  reason: text("reason").notNull(),
  reportedBy: varchar("reported_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).pick({
  certificateId: true,
  studentName: true,
  institution: true,
  degree: true,
  year: true,
});

export const insertVerificationLogSchema = createInsertSchema(verificationLogs).pick({
  userId: true,
  certificateId: true,
  status: true,
  ocrData: true,
  imageUrl: true,
  verificationDetails: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertVerificationLog = z.infer<typeof insertVerificationLogSchema>;
export type VerificationLog = typeof verificationLogs.$inferSelect;
export type Blacklist = typeof blacklist.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
