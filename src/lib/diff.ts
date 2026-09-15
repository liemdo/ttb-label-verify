import type { DiffSegment } from "@/types";
import { governmentWarningWording, normalizeForCompare } from "@/lib/validators";

/**
 * Word-level diff for short texts like government warnings.
 * Case, whitespace, and punctuation are ignored for matching so an all-caps
 * label is not marked as a mismatch against the mixed-case mandated text.
 */
export function computeDiff(expected: string, actual: string): DiffSegment[] {
  if (
    expected === actual ||
    normalizeForCompare(expected) === normalizeForCompare(actual) ||
    governmentWarningWording(expected) === governmentWarningWording(actual)
  ) {
    return [{ type: "equal", text: expected }];
  }

  if (!actual) {
    return [{ type: "removed", text: expected }];
  }

  if (!expected) {
    return [{ type: "added", text: actual }];
  }

  const expectedWords = tokenize(expected.replace(/\s+/g, " ").trim());
  const actualWords = tokenize(actual.replace(/\s+/g, " ").trim());
  const lcs = longestCommonSubsequence(expectedWords, actualWords);

  const segments: DiffSegment[] = [];
  let ei = 0;
  let ai = 0;
  let li = 0;

  while (ei < expectedWords.length || ai < actualWords.length) {
    if (li < lcs.length) {
      // Add removed words (in expected but not in LCS)
      let removedText = "";
      while (ei < expectedWords.length && !tokensMatch(expectedWords[ei], lcs[li])) {
        removedText += expectedWords[ei];
        ei++;
      }
      if (removedText) {
        segments.push({ type: "removed", text: removedText });
      }

      // Add added words (in actual but not in LCS)
      let addedText = "";
      while (ai < actualWords.length && !tokensMatch(actualWords[ai], lcs[li])) {
        addedText += actualWords[ai];
        ai++;
      }
      if (addedText) {
        segments.push({ type: "added", text: addedText });
      }

      // Add equal word
      if (li < lcs.length) {
        segments.push({ type: "equal", text: lcs[li] });
        ei++;
        ai++;
        li++;
      }
    } else {
      // Remaining words
      let removedText = "";
      while (ei < expectedWords.length) {
        removedText += expectedWords[ei];
        ei++;
      }
      if (removedText) {
        segments.push({ type: "removed", text: removedText });
      }

      let addedText = "";
      while (ai < actualWords.length) {
        addedText += actualWords[ai];
        ai++;
      }
      if (addedText) {
        segments.push({ type: "added", text: addedText });
      }
    }
  }

  // Merge adjacent segments of the same type
  return mergeSegments(segments);
}

function tokensMatch(a: string, b: string): boolean {
  return a === b || a.toLowerCase() === b.toLowerCase();
}

/** Tokenize text into words while preserving spaces */
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let current = "";

  for (const char of text) {
    if (char === " ") {
      if (current) tokens.push(current);
      tokens.push(" ");
      current = "";
    } else {
      current += char;
    }
  }
  if (current) tokens.push(current);

  return tokens;
}

/** LCS of two string arrays */
function longestCommonSubsequence(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (tokensMatch(a[i - 1], b[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find the LCS
  const result: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (tokensMatch(a[i - 1], b[j - 1])) {
      result.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}

/** Merge adjacent segments of the same type */
function mergeSegments(segments: DiffSegment[]): DiffSegment[] {
  if (segments.length === 0) return [];

  const merged: DiffSegment[] = [segments[0]];
  for (let i = 1; i < segments.length; i++) {
    const last = merged[merged.length - 1];
    if (last.type === segments[i].type) {
      last.text += segments[i].text;
    } else {
      merged.push({ ...segments[i] });
    }
  }

  return merged;
}
