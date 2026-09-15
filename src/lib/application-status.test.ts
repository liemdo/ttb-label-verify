import { describe, expect, it } from "vitest";
import {
  applicationReviewerName,
  applicationStatus,
  isPending,
  submissionAttribution,
  unresolvedReviewFields,
} from "@/lib/application-status";
import { makeField } from "@/test/fixtures";

describe("applicationStatus", () => {
  it("is pending while awaiting review, even if a verdict was stored", () => {
    expect(
      applicationStatus({
        overallVerdict: "approved",
        reviewStatus: "awaiting_review",
      })
    ).toBe("pending");
  });

  it("returns approved or rejected after review", () => {
    expect(
      applicationStatus({
        overallVerdict: "approved",
        reviewStatus: "reviewed",
      })
    ).toBe("approved");
    expect(
      applicationStatus({
        overallVerdict: "rejected",
        reviewStatus: "reviewed",
      })
    ).toBe("rejected");
  });

  it("treats a reviewed needs_review verdict as pending", () => {
    expect(
      applicationStatus({
        overallVerdict: "needs_review",
        reviewStatus: "reviewed",
      })
    ).toBe("pending");
  });
});

describe("isPending", () => {
  it("is true only for pending applications", () => {
    expect(
      isPending({
        overallVerdict: "pending",
        reviewStatus: "awaiting_review",
      })
    ).toBe(true);
    expect(
      isPending({
        overallVerdict: "approved",
        reviewStatus: "reviewed",
      })
    ).toBe(false);
  });
});

describe("submissionAttribution", () => {
  it("labels applicant and specialist filings", () => {
    expect(
      submissionAttribution({
        submissionSource: "applicant",
        submittedByName: "Ruth Alvarez",
      })
    ).toBe("Via applicant portal · Ruth Alvarez");
    expect(
      submissionAttribution({
        submissionSource: "applicant",
      })
    ).toBe("Via applicant portal");
    expect(
      submissionAttribution({
        submissionSource: "specialist",
        submittedByName: "Sarah Chen",
      })
    ).toBe("Submitted by specialist · Sarah Chen");
    expect(
      submissionAttribution({
        submissionSource: "specialist",
      })
    ).toBe("Submitted by specialist on behalf of the company");
  });
});

describe("applicationReviewerName", () => {
  it("hides unassigned placeholders", () => {
    expect(applicationReviewerName("Sarah Chen")).toBe("Sarah Chen");
    expect(applicationReviewerName("Unassigned")).toBeNull();
    expect(applicationReviewerName("Unknown Agent")).toBeNull();
    expect(applicationReviewerName("  ")).toBeNull();
  });
});

describe("unresolvedReviewFields", () => {
  it("blocks on fail and warning, not on optional not_checked", () => {
    const fields = [
      makeField({ status: "pass" }),
      makeField({
        fieldName: "classType",
        displayName: "Class/Type",
        status: "fail",
      }),
      makeField({
        fieldName: "alcoholContent",
        displayName: "Alcohol Content",
        status: "warning",
      }),
      makeField({
        fieldName: "countryOfOrigin",
        displayName: "Country of Origin",
        status: "not_checked",
        required: false,
      }),
    ];

    expect(unresolvedReviewFields(fields).map((field) => field.fieldName)).toEqual(
      ["classType", "alcoholContent"]
    );
  });
});
