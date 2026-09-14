import type {
  ApplicationStatus,
  LabelField,
  ReviewStatus,
  VerificationResult,
} from "@/types";

/**
 * The one status an application has. AI field checks do not decide this —
 * a specialist does, after reviewing (and optionally overriding) the fields.
 */
export function applicationStatus(result: {
  overallVerdict: string;
  reviewStatus: ReviewStatus;
}): ApplicationStatus {
  if (result.reviewStatus === "awaiting_review") return "pending";
  if (result.overallVerdict === "approved") return "approved";
  if (result.overallVerdict === "rejected") return "rejected";
  return "pending";
}

export function isPending(result: Pick<VerificationResult, "overallVerdict" | "reviewStatus">) {
  return applicationStatus(result) === "pending";
}

/** Specialist who signed off, or null when the application is still unassigned. */
export function applicationReviewerName(agentName?: string | null) {
  const name = agentName?.trim();
  if (!name || name === "Unassigned" || name === "Unknown Agent") return null;
  return name;
}

/** Fields that still block approval — anything that is not a pass (including overrides to pass). */
export function unresolvedReviewFields(fields: LabelField[]) {
  return fields.filter((field) => field.status !== "pass");
}
