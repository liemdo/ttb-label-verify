import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import type { LabelField } from "@/types";

export const companies = pgTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const verificationResults = pgTable("verification_results", {
  id: text("id").primaryKey(),
  fileName: text("file_name").notNull(),
  companyName: text("company_name").notNull(),
  // Private Blob URL; older seed/demo rows may still store a data: URL
  imageDataUrl: text("image_data_url").notNull(),
  beverageType: text("beverage_type").notNull(),
  overallVerdict: text("overall_verdict").notNull(),
  fields: jsonb("fields").$type<LabelField[]>().notNull(),
  ocrEngine: text("ocr_engine").notNull(),
  processingTimeMs: integer("processing_time_ms").notNull(),
  agentId: text("agent_id").notNull(),
  agentName: text("agent_name").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  agentNotes: text("agent_notes"),
  timeSavedMs: integer("time_saved_ms"),
  submissionSource: text("submission_source").notNull().default("specialist"),
  submittedByName: text("submitted_by_name"),
  reviewStatus: text("review_status").notNull().default("reviewed"),
});
