import { v4 as uuidv4 } from "uuid";
import type {
  ExtractedField,
  LabelField,
  VerificationResult,
  ApplicationData,
  BeverageType,
  OcrEngine,
  VerificationStatus,
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
    agentId: string;
    agentName: string;
    processingTimeMs: number;
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

    const isRequired = req.required && (!req.onlyIf || req.onlyIf === "imported");

    let expectedValue: string | undefined;
    if (appData) {
      const fieldMap: Record<string, string | undefined> = {
        brandName: appData.brandName,
        classType: appData.classType,
        alcoholContent: appData.alcoholContent,
        netContents: appData.netContents,
        producerAddress: appData.producerAddress,
        countryOfOrigin: appData.countryOfOrigin,
      };
      expectedValue = fieldMap[req.field];
    }

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

  const hasAnyFail = labelFields.some((f) => f.status === "fail" && f.required);
  const hasAnyWarning = labelFields.some((f) => f.status === "warning" && f.required);
  const overallVerdict = hasAnyFail
    ? "rejected"
    : hasAnyWarning
    ? "needs_review"
    : "approved";

  // Calculate estimated time saved
  const timeSavedMs = MANUAL_REVIEW_TIME_MS - options.processingTimeMs;

  return {
    id: uuidv4(),
    fileName: options.fileName,
    imageDataUrl: options.imageDataUrl,
    beverageType: options.beverageType,
    overallVerdict,
    fields: labelFields,
    ocrEngine: options.ocrEngine,
    processingTimeMs: options.processingTimeMs,
    agentId: options.agentId,
    agentName: options.agentName,
    timestamp: new Date().toISOString(),
    timeSavedMs: Math.max(0, timeSavedMs),
  };
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
