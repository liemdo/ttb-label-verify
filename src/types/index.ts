// ============================================================
// Authentication
// ============================================================

/** TTB staff review labels; applicants are the companies submitting them. */
export type UserRole = "specialist" | "applicant";

export interface Agent {
  id: string;
  name: string;
  role: string;
  department: string;
  initials: string;
  color: string;
}

export interface Applicant {
  id: string;
  companyName: string;
  contactName: string;
  role: string;
  initials: string;
  color: string;
}

// ============================================================
// Settings
// ============================================================

export type OcrEngine = "openai" | "tesseract";

export interface AppSettings {
  ocrEngine: OcrEngine;
  openaiApiKey: string;
  openaiModel: "gpt-4o" | "gpt-4o-mini";
  defaultBeverageType: BeverageType;
  theme: "light" | "dark" | "system";
}

// ============================================================
// TTB Guidelines
// ============================================================

export type BeverageType = "spirits" | "wine" | "beer";

export interface RequiredField {
  field: string;
  displayName: string;
  required: boolean;
  notes: string;
  onlyIf?: string;
}

export interface FormattingRule {
  rule: string;
  description: string;
}

export interface SpecialRequirement {
  name: string;
  description: string;
  appliesWhen?: string;
}

export interface TTBGuideline {
  beverageType: BeverageType;
  displayName: string;
  regulation: string;
  description: string;
  requiredFields: RequiredField[];
  formattingRules: FormattingRule[];
  commonRejections: string[];
  specialRequirements: SpecialRequirement[];
}

// ============================================================
// Verification
// ============================================================

export type VerificationStatus = "pass" | "fail" | "warning" | "not_checked";

export interface FieldOverride {
  fieldName: string;
  originalStatus: VerificationStatus;
  overriddenStatus: VerificationStatus;
  reason: string;
  agentId: string;
  agentName: string;
  timestamp: string;
}

export interface LabelField {
  fieldName: string;
  displayName: string;
  extractedValue: string | null;
  expectedValue?: string;
  status: VerificationStatus;
  confidence: number;
  notes?: string;
  override?: FieldOverride;
  required: boolean;
}

/** Whether the label arrived through the company portal or was keyed in by staff. */
export type SubmissionSource = "applicant" | "specialist";

/** Tracks whether a specialist has signed off on the AI result. */
export type ReviewStatus = "awaiting_review" | "reviewed";

export interface VerificationResult {
  id: string;
  fileName: string;
  companyName: string;
  imageDataUrl: string;
  beverageType: BeverageType;
  overallVerdict: "approved" | "rejected" | "needs_review";
  fields: LabelField[];
  ocrEngine: OcrEngine;
  processingTimeMs: number;
  agentId: string;
  agentName: string;
  timestamp: string;
  agentNotes?: string;
  timeSavedMs?: number;
  submissionSource: SubmissionSource;
  submittedByName?: string;
  reviewStatus: ReviewStatus;
}

// ============================================================
// Image Quality
// ============================================================

export interface ImageQualityReport {
  width: number;
  height: number;
  isLowResolution: boolean;
  fileSizeMB: number;
  warnings: string[];
}

// ============================================================
// Diff
// ============================================================

export interface DiffSegment {
  type: "equal" | "added" | "removed";
  text: string;
}

// ============================================================
// API
// ============================================================

export interface VerifyRequest {
  imageBase64: string;
  beverageType: BeverageType;
  ocrEngine: OcrEngine;
  openaiApiKey?: string;
  openaiModel?: string;
  applicationData?: ApplicationData;
  companyName?: string;
  submissionSource?: SubmissionSource;
  submittedByName?: string;
}

export interface ApplicationData {
  brandName?: string;
  classType?: string;
  alcoholContent?: string;
  netContents?: string;
  producerAddress?: string;
  countryOfOrigin?: string;
}

export interface ExtractedField {
  fieldName: string;
  displayName: string;
  value: string | null;
  confidence: number;
}

export interface VerifyResponse {
  success: boolean;
  result?: VerificationResult;
  error?: string;
  useClientSide?: boolean;
}
