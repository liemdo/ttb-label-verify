"use server";

import { db } from "@/db";
import { verificationResults } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { VerificationResult, LabelField } from "@/types";
import { revalidatePath } from "next/cache";

export async function fetchResultsAction(): Promise<VerificationResult[]> {
  try {
    const results = await db
      .select()
      .from(verificationResults)
      .orderBy(desc(verificationResults.timestamp));
    
    return results.map((r) => ({
      id: r.id,
      fileName: r.fileName,
      imageDataUrl: r.imageDataUrl,
      beverageType: r.beverageType as any,
      overallVerdict: r.overallVerdict as any,
      fields: r.fields,
      ocrEngine: r.ocrEngine as any,
      processingTimeMs: r.processingTimeMs,
      agentId: r.agentId,
      agentName: r.agentName,
      timestamp: r.timestamp.toISOString(),
      agentNotes: r.agentNotes || undefined,
      timeSavedMs: r.timeSavedMs || undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch results from database:", error);
    return [];
  }
}

export async function saveResultAction(result: VerificationResult): Promise<void> {
  try {
    await db.insert(verificationResults).values({
      id: result.id,
      fileName: result.fileName,
      imageDataUrl: result.imageDataUrl,
      beverageType: result.beverageType,
      overallVerdict: result.overallVerdict,
      fields: result.fields,
      ocrEngine: result.ocrEngine,
      processingTimeMs: result.processingTimeMs,
      agentId: result.agentId,
      agentName: result.agentName,
      timestamp: new Date(result.timestamp),
      agentNotes: result.agentNotes || null,
      timeSavedMs: result.timeSavedMs || null,
    });
    revalidatePath("/history");
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("Failed to save result:", err);
    throw new Error("Database insertion failed");
  }
}

export async function saveResultsAction(results: VerificationResult[]): Promise<void> {
  if (results.length === 0) return;
  try {
    const values = results.map(result => ({
      id: result.id,
      fileName: result.fileName,
      imageDataUrl: result.imageDataUrl,
      beverageType: result.beverageType,
      overallVerdict: result.overallVerdict,
      fields: result.fields,
      ocrEngine: result.ocrEngine,
      processingTimeMs: result.processingTimeMs,
      agentId: result.agentId,
      agentName: result.agentName,
      timestamp: new Date(result.timestamp),
      agentNotes: result.agentNotes || null,
      timeSavedMs: result.timeSavedMs || null,
    }));
    await db.insert(verificationResults).values(values);
    revalidatePath("/history");
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("Failed to batch save results:", err);
    throw new Error("Database batch insertion failed");
  }
}

export async function updateNotesAction(id: string, notes: string): Promise<void> {
  await db.update(verificationResults)
    .set({ agentNotes: notes })
    .where(eq(verificationResults.id, id));
}

export async function updateFieldsAction(id: string, fields: LabelField[], overallVerdict: string): Promise<void> {
  await db.update(verificationResults)
    .set({ fields, overallVerdict })
    .where(eq(verificationResults.id, id));
}

export async function clearResultsAction(): Promise<void> {
  await db.delete(verificationResults);
  revalidatePath("/history");
  revalidatePath("/dashboard");
}
