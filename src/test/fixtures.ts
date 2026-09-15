import type { LabelField, VerificationResult } from "@/types";

export function makeField(overrides: Partial<LabelField> = {}): LabelField {
  return {
    fieldName: "brandName",
    displayName: "Brand Name",
    extractedValue: "HOCHSTADTER'S",
    expectedValue: "HOCHSTADTER'S",
    status: "pass",
    confidence: 0.95,
    required: true,
    ...overrides,
  };
}

export function makeResult(
  overrides: Partial<VerificationResult> = {}
): VerificationResult {
  return {
    id: "test-id",
    fileName: "label.jpeg",
    companyName: "Test Co",
    imageDataUrl: "data:image/png;base64,xx",
    beverageType: "spirits",
    overallVerdict: "pending",
    fields: [makeField()],
    ocrEngine: "openai",
    processingTimeMs: 1000,
    agentId: "unassigned",
    agentName: "Unassigned",
    timestamp: "2026-09-15T00:00:00.000Z",
    submissionSource: "specialist",
    reviewStatus: "awaiting_review",
    ...overrides,
  };
}
