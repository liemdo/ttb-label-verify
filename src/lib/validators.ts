import { GOVERNMENT_WARNING_TEXT } from "@/lib/constants";
import type { VerificationStatus } from "@/types";

/**
 * Normalize a string for comparison: lowercase, collapse whitespace, unify quotes.
 * Labels often print the government warning in all caps; this treats that as the same text.
 */
export function normalizeForCompare(str: string): string {
  return str
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(str: string): string {
  return normalizeForCompare(str);
}

/** TTB cares about mandated wording, not whether the body is mixed case or all caps. */
export function governmentWarningWording(str: string): string {
  return normalizeForCompare(str)
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = new Array<number>(cols);
  for (let j = 0; j < cols; j++) dp[j] = j;

  for (let i = 1; i < rows; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j < cols; j++) {
      const current = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = current;
    }
  }

  return dp[cols - 1];
}

/** Normalized edit similarity from 0–1. 1 is an exact match after normalize. */
function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.length === 0 || nb.length === 0) return 0;

  const maxLen = Math.max(na.length, nb.length);
  const score = 1 - levenshtein(na, nb) / maxLen;

  if (na.includes(nb) || nb.includes(na)) {
    return Math.max(score, Math.min(na.length, nb.length) / maxLen);
  }

  return score;
}

/**
 * Validate brand name: case-insensitive fuzzy match.
 * Handles cases like "STONE'S THROW" vs "Stone's Throw".
 */
export function validateBrandName(
  extracted: string | null,
  expected: string
): { status: VerificationStatus; notes: string } {
  if (!extracted) {
    return { status: "fail", notes: "Brand name not found on label" };
  }

  const sim = similarity(extracted, expected);

  if (sim >= 0.95) {
    return { status: "pass", notes: "Brand name matches" };
  } else if (sim >= 0.7) {
    return {
      status: "warning",
      notes: `Brand name is similar but not exact (${Math.round(sim * 100)}% match). Extracted: "${extracted}", Expected: "${expected}"`,
    };
  } else {
    return {
      status: "fail",
      notes: `Brand name mismatch. Extracted: "${extracted}", Expected: "${expected}"`,
    };
  }
}

/**
 * Validate class/type: case-insensitive match with flexibility for formatting.
 */
export function validateClassType(
  extracted: string | null,
  expected: string
): { status: VerificationStatus; notes: string } {
  if (!extracted) {
    return { status: "fail", notes: "Class/type not found on label" };
  }

  const sim = similarity(extracted, expected);

  if (sim >= 0.85) {
    return { status: "pass", notes: "Class/type matches" };
  } else if (sim >= 0.6) {
    return {
      status: "warning",
      notes: `Class/type is similar but may differ. Extracted: "${extracted}", Expected: "${expected}"`,
    };
  } else {
    return {
      status: "fail",
      notes: `Class/type mismatch. Extracted: "${extracted}", Expected: "${expected}"`,
    };
  }
}

/**
 * Validate alcohol content: extract numeric ABV and compare.
 */
export function validateAlcoholContent(
  extracted: string | null,
  expected: string
): { status: VerificationStatus; notes: string } {
  if (!extracted) {
    return { status: "fail", notes: "Alcohol content not found on label" };
  }

  const extractNum = (s: string): number | null => {
    const match = s.match(/(\d+(?:\.\d+)?)\s*%/);
    return match ? parseFloat(match[1]) : null;
  };

  const extractedAbv = extractNum(extracted);
  const expectedAbv = extractNum(expected);

  if (extractedAbv === null) {
    return {
      status: "warning",
      notes: `Could not parse ABV from extracted text: "${extracted}"`,
    };
  }

  if (expectedAbv === null) {
    return { status: "pass", notes: `ABV found: ${extractedAbv}%` };
  }

  if (Math.abs(extractedAbv - expectedAbv) < 0.1) {
    return { status: "pass", notes: `ABV matches: ${extractedAbv}%` };
  } else {
    return {
      status: "fail",
      notes: `ABV mismatch. Extracted: ${extractedAbv}%, Expected: ${expectedAbv}%`,
    };
  }
}

/**
 * Validate net contents: extract numeric value and unit.
 */
export function validateNetContents(
  extracted: string | null,
  expected: string
): { status: VerificationStatus; notes: string } {
  if (!extracted) {
    return { status: "fail", notes: "Net contents not found on label" };
  }

  const extractValue = (s: string): { value: number; unit: string } | null => {
    const match = s.match(/(\d+(?:\.\d+)?)\s*(mL|ml|L|l|fl\.?\s*oz\.?)/i);
    if (!match) return null;
    return { value: parseFloat(match[1]), unit: match[2].toLowerCase().replace(/\s+/g, "") };
  };

  const ev = extractValue(extracted);
  const xv = extractValue(expected);

  if (!ev) {
    return {
      status: "warning",
      notes: `Could not parse net contents from: "${extracted}"`,
    };
  }

  if (!xv) {
    return { status: "pass", notes: `Net contents found: ${extracted}` };
  }

  // Normalize units
  const normalizeUnit = (u: string) => {
    if (u.includes("oz")) return "floz";
    if (u === "l") return "l";
    return "ml";
  };

  if (ev.value === xv.value && normalizeUnit(ev.unit) === normalizeUnit(xv.unit)) {
    return { status: "pass", notes: "Net contents match" };
  } else {
    return {
      status: "fail",
      notes: `Net contents mismatch. Extracted: ${extracted}, Expected: ${expected}`,
    };
  }
}

/**
 * TTB (27 CFR 16.21–16.22): the words "GOVERNMENT WARNING" must be in capital
 * letters. The rest of the statement must use the mandated wording and be
 * legible — mixed case or all caps are both acceptable.
 */
export function validateGovernmentWarning(
  extracted: string | null
): { status: VerificationStatus; notes: string } {
  if (!extracted) {
    return { status: "fail", notes: "Government warning statement not found on label" };
  }

  const headerMatch = extracted.match(/GOVERNMENT\s+WARNING\s*:/);
  if (!headerMatch) {
    const lowerMatch = extracted.match(/government\s+warning\s*:/i);
    if (lowerMatch) {
      return {
        status: "fail",
        notes: '"GOVERNMENT WARNING:" must be in ALL CAPS. Found: "' +
          lowerMatch[0] + '"',
      };
    }
    return {
      status: "fail",
      notes: 'Government warning header "GOVERNMENT WARNING:" not found',
    };
  }

  if (governmentWarningWording(extracted) === governmentWarningWording(GOVERNMENT_WARNING_TEXT)) {
    return {
      status: "pass",
      notes: "Mandated wording is present. TTB requires the header in all caps; the body may be mixed case or all caps.",
    };
  }

  const sim = similarity(extracted, GOVERNMENT_WARNING_TEXT);
  if (sim >= 0.95) {
    return {
      status: "warning",
      notes: `Government warning is very close but not exact (${Math.round(sim * 100)}% match). Minor wording differences detected.`,
    };
  }

  return {
    status: "fail",
    notes: "Government warning text does not match the required statement. Must be word-for-word exact.",
  };
}

/**
 * Validate producer/bottler address (fuzzy match).
 */
export function validateProducerAddress(
  extracted: string | null,
  expected: string
): { status: VerificationStatus; notes: string } {
  if (!extracted) {
    return { status: "fail", notes: "Producer/bottler information not found on label" };
  }

  const sim = similarity(extracted, expected);
  if (sim >= 0.7) {
    return { status: "pass", notes: "Producer/bottler information matches" };
  } else if (sim >= 0.4) {
    return {
      status: "warning",
      notes: `Producer info partially matches (${Math.round(sim * 100)}%). Manual review recommended.`,
    };
  } else {
    return {
      status: "fail",
      notes: `Producer/bottler mismatch. Extracted: "${extracted}"`,
    };
  }
}

/**
 * Validate country of origin.
 */
export function validateCountryOfOrigin(
  extracted: string | null,
  expected: string
): { status: VerificationStatus; notes: string } {
  if (!extracted) {
    return { status: "fail", notes: "Country of origin not found on label" };
  }

  if (normalize(extracted).includes(normalize(expected))) {
    return { status: "pass", notes: "Country of origin matches" };
  }

  return {
    status: "fail",
    notes: `Country of origin mismatch. Extracted: "${extracted}", Expected: "${expected}"`,
  };
}
