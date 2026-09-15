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
];

// ============================================================
// Predefined Applicants (companies submitting labels)
// ============================================================

export interface CompanyContactInfo {
  contactName: string;
  contactRole: string;
  phone: string;
  email: string;
}

/** Directory contacts for seeded / demo companies. */
export const COMPANY_CONTACTS: Record<string, CompanyContactInfo> = {
  "Oak Barrel Distilling Co.": {
    contactName: "Ruth Alvarez",
    contactRole: "Compliance Contact",
    phone: "(502) 555-0142",
    email: "ruth.alvarez@oakbarreldistilling.com",
  },
  "Napa Valley Vintners": {
    contactName: "Thomas Reed",
    contactRole: "Label Coordinator",
    phone: "(707) 555-0188",
    email: "thomas.reed@napavalleyvintners.com",
  },
  "Crafty Brews LLC": {
    contactName: "Priya Raman",
    contactRole: "Brand Manager",
    phone: "(303) 555-0114",
    email: "priya.raman@craftybrews.com",
  },
  "Highland Spirits": {
    contactName: "Callum Fraser",
    contactRole: "Regulatory Affairs",
    phone: "(859) 555-0160",
    email: "callum.fraser@highlandspirits.com",
  },
  "Blue Mountain Brewery": {
    contactName: "Nina Kowalski",
    contactRole: "Brewery Operations",
    phone: "(503) 555-0177",
    email: "nina.kowalski@bluemountainbrewery.com",
  },
  "Apex Whiskey Co.": {
    contactName: "Jordan Hale",
    contactRole: "Compliance Contact",
    phone: "(502) 555-0194",
    email: "jordan.hale@apexwhiskey.com",
  },
  "Golden State Brewers": {
    contactName: "Marcus Delgado",
    contactRole: "Brand Manager",
    phone: "(415) 555-0133",
    email: "marcus.delgado@goldenstatebrewers.com",
  },
  "Harbor Light Distilling": {
    contactName: "Elena Vasquez",
    contactRole: "Compliance Contact",
    phone: "(207) 555-0168",
    email: "elena.vasquez@harborlightdistilling.com",
  },
  "Riverstone Vineyards": {
    contactName: "Claire Nguyen",
    contactRole: "Label Coordinator",
    phone: "(707) 555-0181",
    email: "claire.nguyen@riverstonevineyards.com",
  },
  "Silver Fox Distillers": {
    contactName: "Owen Briggs",
    contactRole: "Regulatory Affairs",
    phone: "(270) 555-0156",
    email: "owen.briggs@silverfoxdistillers.com",
  },
  "Sonoma Coast Wineries": {
    contactName: "Isabel Moreau",
    contactRole: "Compliance Contact",
    phone: "(707) 555-0129",
    email: "isabel.moreau@sonomacoastwineries.com",
  },
};

export function companyContactFallback(companyName: string) {
  const trimmed = companyName.trim();
  return (
    COMPANY_CONTACTS[trimmed] ??
    Object.entries(COMPANY_CONTACTS).find(
      ([name]) => name.toLowerCase() === trimmed.toLowerCase()
    )?.[1]
  );
}

export const APPLICANTS: Applicant[] = [
  {
    id: "oak-barrel-distilling",
    companyName: "Oak Barrel Distilling Co.",
    ...COMPANY_CONTACTS["Oak Barrel Distilling Co."],
    role: COMPANY_CONTACTS["Oak Barrel Distilling Co."].contactRole,
    initials: "OB",
    color: "#B45309",
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
// Manual entry placeholders
// ============================================================

export const BEVERAGE_TYPE_LABELS: Record<string, string> = {
  spirits: "Distilled Spirits",
  wine: "Wine",
  beer: "Malt Beverage (Beer)",
};

/**
 * Example values shown per beverage type, since what a bourbon label states
 * looks nothing like what a beer label states.
 */
export const FIELD_PLACEHOLDERS: Record<string, Record<string, string>> = {
  spirits: {
    brandName: "e.g. OLD TOM DISTILLERY",
    classType: "e.g. Kentucky Straight Bourbon Whiskey",
    alcoholContent: "e.g. 45% Alc./Vol. (90 Proof)",
    netContents: "e.g. 750 mL",
    producerAddress: "e.g. Distilled and bottled by Old Tom, Frankfort, KY",
    countryOfOrigin: "e.g. Product of Scotland",
  },
  wine: {
    brandName: "e.g. SONOMA RIDGE",
    classType: "e.g. Cabernet Sauvignon",
    alcoholContent: "e.g. 13.5% Alc./Vol.",
    netContents: "e.g. 750 mL",
    producerAddress: "e.g. Produced and bottled by Sonoma Ridge, Napa, CA",
    countryOfOrigin: "e.g. Product of France",
    sulfiteDeclaration: "e.g. Contains Sulfites",
  },
  beer: {
    brandName: "e.g. BLUE MOUNTAIN",
    classType: "e.g. India Pale Ale",
    alcoholContent: "e.g. 6.2% Alc./Vol.",
    netContents: "e.g. 12 fl oz (355 mL)",
    producerAddress: "e.g. Brewed by Blue Mountain Brewery, Portland, OR",
    countryOfOrigin: "e.g. Product of Belgium",
  },
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
/** How many labels to extract in parallel during a batch run. */
export const BATCH_CONCURRENCY = 4;

// ============================================================
// Time estimation
// ============================================================

/** Average manual review time per label in milliseconds (7 minutes) */
export const MANUAL_REVIEW_TIME_MS = 7 * 60 * 1000;
