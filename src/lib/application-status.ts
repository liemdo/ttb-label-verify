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

/** How this application was filed — applicant portal vs specialist on behalf of the company. */
export function submissionAttribution(
  result: Pick<VerificationResult, "submissionSource" | "submittedByName">
): string {
  if (result.submissionSource === "applicant") {
    return result.submittedByName
      ? `Via applicant portal · ${result.submittedByName}`
      : "Via applicant portal";
  }
  return result.submittedByName
    ? `Submitted by specialist · ${result.submittedByName}`
    : "Submitted by specialist on behalf of the company";
}

/** Specialist who signed off, or null when the application is still unassigned. */
export function applicationReviewerName(agentName?: string | null) {
  const name = agentName?.trim();
  if (!name || name === "Unassigned" || name === "Unknown Agent") return null;
  return name;
}

/**
 * Fields that still block approval: fails and warnings.
 * Optional fields left as not_checked (for example country of origin on a
 * domestic label) do not force a reject.
 */
export function unresolvedReviewFields(fields: LabelField[]) {
  return fields.filter(
    (field) => field.status === "fail" || field.status === "warning"
  );
}
