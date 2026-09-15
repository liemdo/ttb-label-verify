"use server";

import { db } from "@/db";
import { verificationResults } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type {
  VerificationResult,
  LabelField,
  ReviewStatus,
  SubmissionSource,
  ApplicationStatus,
} from "@/types";
import { revalidatePath } from "next/cache";
import { deleteStoredLabelImage, deleteStoredLabelImages } from "@/lib/blob-storage";

type ResultRow = typeof verificationResults.$inferSelect;

function toVerificationResult(r: ResultRow): VerificationResult {
  return {
    id: r.id,
    fileName: r.fileName,
    companyName: r.companyName,
    imageDataUrl: r.imageDataUrl,
    beverageType: r.beverageType as VerificationResult["beverageType"],
    overallVerdict: r.overallVerdict as VerificationResult["overallVerdict"],
    fields: r.fields,
    ocrEngine: r.ocrEngine as VerificationResult["ocrEngine"],
    processingTimeMs: r.processingTimeMs,
    agentId: r.agentId,
    agentName: r.agentName,
    timestamp: r.timestamp.toISOString(),
    agentNotes: r.agentNotes || undefined,
    timeSavedMs: r.timeSavedMs || undefined,
    submissionSource: r.submissionSource as SubmissionSource,
    submittedByName: r.submittedByName || undefined,
    reviewStatus: r.reviewStatus as ReviewStatus,
  };
}

function toInsertValues(result: VerificationResult) {
  return {
    id: result.id,
    fileName: result.fileName,
    companyName: result.companyName,
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
    submissionSource: result.submissionSource,
    submittedByName: result.submittedByName || null,
    reviewStatus: result.reviewStatus,
  };
}

function revalidateResultViews(id?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/applications");
  revalidatePath("/applicants");
  revalidatePath("/portal");
  if (id) revalidatePath(`/applications/${id}`);
}

export async function fetchResultsAction(): Promise<VerificationResult[]> {
  try {
    const results = await db
      .select()
      .from(verificationResults)
      .orderBy(desc(verificationResults.timestamp));

    return results.map(toVerificationResult);
  } catch (error) {
    console.error("Failed to fetch results from database:", error);
    return [];
  }
}

/** Applicants only ever see the labels their own company submitted. */
export async function fetchResultsByCompanyAction(
  companyName: string
): Promise<VerificationResult[]> {
  try {
    const results = await db
      .select()
      .from(verificationResults)
      .where(eq(verificationResults.companyName, companyName))
      .orderBy(desc(verificationResults.timestamp));

    return results.map(toVerificationResult);
  } catch (error) {
    console.error("Failed to fetch results for company:", error);
    return [];
  }
}

export async function fetchResultByIdAction(id: string): Promise<VerificationResult | null> {
  try {
    const results = await db
      .select()
      .from(verificationResults)
      .where(eq(verificationResults.id, id))
      .limit(1);

    if (results.length === 0) return null;
    return toVerificationResult(results[0]);
  } catch (error) {
    console.error("Failed to fetch result by ID:", error);
    return null;
  }
}

export async function saveResultAction(result: VerificationResult): Promise<void> {
  try {
    await db.insert(verificationResults).values(toInsertValues(result));
    revalidateResultViews();
  } catch (err) {
    console.error("Failed to save result:", err);
    throw new Error("Database insertion failed");
  }
}

export async function saveResultsAction(results: VerificationResult[]): Promise<void> {
  if (results.length === 0) return;
  try {
    await db.insert(verificationResults).values(results.map(toInsertValues));
    revalidateResultViews();
  } catch (err) {
    console.error("Failed to batch save results:", err);
    throw new Error("Database batch insertion failed");
  }
}

export async function updateNotesAction(id: string, notes: string): Promise<void> {
  await db.update(verificationResults)
    .set({ agentNotes: notes })
    .where(eq(verificationResults.id, id));
  revalidateResultViews(id);
}

export async function updateFieldsAction(id: string, fields: LabelField[]): Promise<void> {
  await db.update(verificationResults)
    .set({ fields })
    .where(eq(verificationResults.id, id));
  revalidateResultViews(id);
}

/** A specialist sets the application's status, including reversing a prior decision. */
export async function decideApplicationAction(
  id: string,
  decision: ApplicationStatus,
  reviewer: { agentId: string; agentName: string }
): Promise<void> {
  const reopen = decision === "pending";

  await db
    .update(verificationResults)
    .set({
      overallVerdict: decision,
      reviewStatus: reopen ? "awaiting_review" : "reviewed",
      agentId: reopen ? "unassigned" : reviewer.agentId,
      agentName: reopen ? "Unassigned" : reviewer.agentName,
    })
    .where(eq(verificationResults.id, id));

  revalidateResultViews(id);
}

export async function deleteResultAction(id: string): Promise<void> {
  try {
    const [row] = await db
      .select({ imageDataUrl: verificationResults.imageDataUrl })
      .from(verificationResults)
      .where(eq(verificationResults.id, id))
      .limit(1);

    await db.delete(verificationResults).where(eq(verificationResults.id, id));
    await deleteStoredLabelImage(row?.imageDataUrl);
    revalidateResultViews();
  } catch (error) {
    console.error("Failed to delete result:", error);
    throw new Error("Failed to delete application");
  }
}

export async function updateCompanyNameAction(
  id: string,
  companyName: string
): Promise<void> {
  const trimmed = companyName.trim();
  if (!trimmed) {
    throw new Error("Company name is required");
  }

  await db
    .update(verificationResults)
    .set({ companyName: trimmed })
    .where(eq(verificationResults.id, id));

  revalidateResultViews(id);
}

export async function clearResultsAction(): Promise<void> {
  const rows = await db
    .select({ imageDataUrl: verificationResults.imageDataUrl })
    .from(verificationResults);

  await db.delete(verificationResults);
  await deleteStoredLabelImages(rows.map((row) => row.imageDataUrl));
  revalidateResultViews();
}
