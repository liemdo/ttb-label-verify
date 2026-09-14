import { v4 as uuidv4 } from "uuid";
import type {
  ExtractedField,
  LabelField,
  VerificationResult,
  ApplicationData,
  BeverageType,
  OcrEngine,
  VerificationStatus,
  SubmissionSource,
} from "@/types";
import { FIELD_DISPLAY_NAMES, MANUAL_REVIEW_TIME_MS } from "@/lib/constants";
import { getGuidelineForBeverage } from "@/lib/ttb-guidelines";
import {
  validateBrandName,
  validateClassType,
  validateAlcoholContent,
  validateNetContents,
  validateGovernmentWarning,
  validateProducerAddress,
  validateCountryOfOrigin,
} from "@/lib/validators";

/**
 * Run the full verification pipeline: compare extracted fields against
 * application data and TTB requirements.
 */
export function buildVerificationResult(
  extractedFields: ExtractedField[],
  options: {
    fileName: string;
    imageDataUrl: string;
    beverageType: BeverageType;
    ocrEngine: OcrEngine;
    applicationData?: ApplicationData;
    companyName?: string;
    agentId: string;
    agentName: string;
    processingTimeMs: number;
    submissionSource?: SubmissionSource;
    submittedByName?: string;
  }
): VerificationResult {
  const guideline = getGuidelineForBeverage(options.beverageType);

  const extractedMap = new Map<string, ExtractedField>();
  for (const field of extractedFields) {
    extractedMap.set(field.fieldName, field);
  }

  const labelFields: LabelField[] = guideline.requiredFields.map((req) => {
    const extracted = extractedMap.get(req.field);
    const extractedValue = extracted?.value ?? null;
    const confidence = extracted?.confidence ?? 0;
    const appData = options.applicationData;
    const displayName = FIELD_DISPLAY_NAMES[req.field] || req.displayName;

    // Conditional fields such as country of origin only bind for imports, so a
    // blank one is not a gap in the application
    const isRequired = req.required && !req.onlyIf;

    // Field names line up with the guideline definitions, so a stated value is
    // simply looked up by field name.
    const expectedValue = appData?.[req.field]?.trim() || undefined;

    let status: VerificationStatus = "not_checked";
    let notes = "";

    if (req.field === "governmentWarning") {
      const result = validateGovernmentWarning(extractedValue);
      status = result.status;
      notes = result.notes;
    } else if (expectedValue) {
      const result = getValidationResult(req.field, extractedValue, expectedValue);
      status = result.status;
      notes = result.notes;
    } else if (extractedValue) {
      status = "pass";
      notes = "Field found on label (no application data to compare against)";
    } else if (isRequired) {
      status = "warning";
      notes = "Required field not detected on label. Manual review recommended.";
    } else {
      status = "not_checked";
      notes = "Optional field not found";
    }

    return {
      fieldName: req.field,
      displayName,
      extractedValue,
      expectedValue,
      status,
      confidence,
      notes,
      required: isRequired,
    };
  });

  const timeSavedMs = MANUAL_REVIEW_TIME_MS - options.processingTimeMs;

  return {
    id: uuidv4(),
    fileName: options.fileName,
    companyName: options.companyName?.trim() || "Unknown",
    imageDataUrl: options.imageDataUrl,
    beverageType: options.beverageType,
    overallVerdict: "pending",
    fields: labelFields,
    ocrEngine: options.ocrEngine,
    processingTimeMs: options.processingTimeMs,
    agentId: options.agentId,
    agentName: options.agentName,
    timestamp: new Date().toISOString(),
    timeSavedMs: Math.max(0, timeSavedMs),
    submissionSource: options.submissionSource ?? "specialist",
    submittedByName: options.submittedByName,
    reviewStatus: "awaiting_review",
  };
}

/** Fields the applicant confirms by hand; the warning statement is fixed text. */
export const APPLICANT_CONFIRMABLE = (field: LabelField) =>
  field.fieldName !== "governmentWarning";

/**
 * Fold the applicant's confirmed values into an AI result. The AI reading stays
 * in `extractedValue` as the audit trail while the confirmed value becomes the
 * declared `expectedValue`, so a specialist can compare the artwork against
 * what the company actually claims.
 */
export function applyApplicantConfirmation(
  result: VerificationResult,
  values: Record<string, string>,
  confirmedBy: { id: string; name: string }
): VerificationResult {
  const timestamp = new Date().toISOString();

  const fields: LabelField[] = result.fields.map((field) => {
    if (!APPLICANT_CONFIRMABLE(field)) return field;

    const stated = (values[field.fieldName] ?? "").trim();
    const readByAi = (field.extractedValue ?? "").trim();

    if (!stated) {
      return {
        ...field,
        expectedValue: undefined,
        status: field.required ? "warning" : "not_checked",
        notes: field.required
          ? "Left blank by the applicant. Confirm against the artwork."
          : "Not provided",
      };
    }

    if (stated === readByAi) {
      return {
        ...field,
        expectedValue: stated,
        status: "pass",
        notes: "Applicant confirmed the value read from the label.",
      };
    }

    return {
      ...field,
      expectedValue: stated,
      status: "pass",
      notes: "Applicant corrected the value read from the label.",
      override: {
        fieldName: field.fieldName,
        originalStatus: field.status,
        overriddenStatus: "pass",
        reason: readByAi
          ? `Corrected from "${readByAi}" as read by the AI`
          : "Filled in by the applicant; the AI found nothing on the label",
        agentId: confirmedBy.id,
        agentName: confirmedBy.name,
        timestamp,
      },
    };
  });

  return { ...result, fields, overallVerdict: "pending", reviewStatus: "awaiting_review" };
}

function getValidationResult(
  fieldName: string,
  extracted: string | null,
  expected: string
): { status: VerificationStatus; notes: string } {
  switch (fieldName) {
    case "brandName":
      return validateBrandName(extracted, expected);
    case "classType":
      return validateClassType(extracted, expected);
    case "alcoholContent":
      return validateAlcoholContent(extracted, expected);
    case "netContents":
      return validateNetContents(extracted, expected);
    case "producerAddress":
      return validateProducerAddress(extracted, expected);
    case "countryOfOrigin":
      return validateCountryOfOrigin(extracted, expected);
    default:
      if (!extracted) {
        return { status: "warning", notes: "Field not found on label" };
      }
      return { status: "pass", notes: "Field present" };
  }
}
