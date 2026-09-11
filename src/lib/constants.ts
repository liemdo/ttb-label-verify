import type { Agent, Applicant } from "@/types";

// ============================================================
// Predefined Agents
// ============================================================

export const AGENTS: Agent[] = [
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    role: "Deputy Director",
    department: "Label Compliance",
    initials: "SC",
    color: "#3B82F6",
  },
  {
    id: "dave-morrison",
    name: "Dave Morrison",
    role: "Senior Compliance Agent",
    department: "Spirits & Wine Division",
    initials: "DM",
    color: "#10B981",
  },
  {
    id: "jenny-park",
    name: "Jenny Park",
    role: "Junior Compliance Agent",
    department: "General Review",
    initials: "JP",
    color: "#8B5CF6",
  },
  {
    id: "marcus-williams",
    name: "Marcus Williams",
    role: "IT Systems Administrator",
    department: "Technology Services",
    initials: "MW",
    color: "#F59E0B",
  },
];

// ============================================================
// Predefined Applicants (companies submitting labels)
// ============================================================

export const APPLICANTS: Applicant[] = [
  {
    id: "oak-barrel-distilling",
    companyName: "Oak Barrel Distilling Co.",
    contactName: "Ruth Alvarez",
    role: "Compliance Contact",
    initials: "OB",
    color: "#B45309",
  },
  {
    id: "napa-valley-vintners",
    companyName: "Napa Valley Vintners",
    contactName: "Thomas Reed",
    role: "Label Coordinator",
    initials: "NV",
    color: "#9333EA",
  },
  {
    id: "crafty-brews",
    companyName: "Crafty Brews LLC",
    contactName: "Priya Raman",
    role: "Brand Manager",
    initials: "CB",
    color: "#0D9488",
  },
  {
    id: "highland-spirits",
    companyName: "Highland Spirits",
    contactName: "Callum Fraser",
    role: "Regulatory Affairs",
    initials: "HS",
    color: "#2563EB",
  },
];

// ============================================================
// Government Warning Statement
// ============================================================

export const GOVERNMENT_WARNING_TEXT =
  "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.";

// ============================================================
// Field Display Names
// ============================================================

export const FIELD_DISPLAY_NAMES: Record<string, string> = {
  brandName: "Brand Name",
  classType: "Class/Type",
  alcoholContent: "Alcohol Content",
  netContents: "Net Contents",
  governmentWarning: "Government Warning",
  producerAddress: "Producer/Bottler",
  countryOfOrigin: "Country of Origin",
  sulfiteDeclaration: "Sulfite Declaration",
};

// ============================================================
// Image & batch constants
// ============================================================

export const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_BATCH_SIZE = 300;

// ============================================================
// Time estimation
// ============================================================

/** Average manual review time per label in milliseconds (7 minutes) */
export const MANUAL_REVIEW_TIME_MS = 7 * 60 * 1000;
