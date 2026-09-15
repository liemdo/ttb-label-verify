import { describe, expect, it } from "vitest";
import { GOVERNMENT_WARNING_TEXT } from "@/lib/constants";
import {
  applyApplicantConfirmation,
  buildVerificationResult,
} from "@/lib/verification";

const warningField = {
  fieldName: "governmentWarning" as const,
  displayName: "Government Warning",
  value: GOVERNMENT_WARNING_TEXT,
  confidence: 0.99,
};

describe("buildVerificationResult", () => {
  it("starts pending and awaiting review", () => {
    const result = buildVerificationResult([warningField], {
      fileName: "label.jpeg",
      imageDataUrl: "data:image/png;base64,xx",
      beverageType: "spirits",
      ocrEngine: "openai",
      agentId: "sarah-chen",
      agentName: "Sarah Chen",
      processingTimeMs: 1200,
      companyName: "Silver Fox Distillers",
    });

    expect(result.overallVerdict).toBe("pending");
    expect(result.reviewStatus).toBe("awaiting_review");
    expect(result.companyName).toBe("Silver Fox Distillers");
    expect(
      result.fields.find((field) => field.fieldName === "governmentWarning")
        ?.status
    ).toBe("pass");
  });

  it("compares extracted values to application data", () => {
    const result = buildVerificationResult(
      [
        { fieldName: "brandName", displayName: "Brand Name", value: "HOCHSTADTER'S", confidence: 0.9 },
        { fieldName: "alcoholContent", displayName: "Alcohol Content", value: "45%", confidence: 0.9 },
        warningField,
      ],
      {
        fileName: "label.jpeg",
        imageDataUrl: "data:image/png;base64,xx",
        beverageType: "spirits",
        ocrEngine: "openai",
        agentId: "sarah-chen",
        agentName: "Sarah Chen",
        processingTimeMs: 800,
        applicationData: {
          brandName: "Hochstadter's",
          classType: "Straight Rye Whiskey",
          alcoholContent: "40%",
          netContents: "750 mL",
          producerAddress: "Philadelphia",
        },
      }
    );

    expect(
      result.fields.find((field) => field.fieldName === "brandName")?.status
    ).toBe("pass");
    expect(
      result.fields.find((field) => field.fieldName === "alcoholContent")
        ?.status
    ).toBe("fail");
  });

  it("does not fail optional country of origin when it is blank", () => {
    const result = buildVerificationResult([warningField], {
      fileName: "label.jpeg",
      imageDataUrl: "data:image/png;base64,xx",
      beverageType: "spirits",
      ocrEngine: "openai",
      agentId: "sarah-chen",
      agentName: "Sarah Chen",
      processingTimeMs: 500,
    });

    const origin = result.fields.find(
      (field) => field.fieldName === "countryOfOrigin"
    );
    expect(origin?.required).toBe(false);
    expect(origin?.status).toBe("not_checked");
  });
});

describe("applyApplicantConfirmation", () => {
  it("marks a matching confirmation as pass", () => {
    const draft = buildVerificationResult(
      [{ fieldName: "brandName", displayName: "Brand Name", value: "HOCHSTADTER'S", confidence: 0.9 }],
      {
        fileName: "label.jpeg",
        imageDataUrl: "data:image/png;base64,xx",
        beverageType: "spirits",
        ocrEngine: "openai",
        agentId: "unassigned",
        agentName: "Unassigned",
        processingTimeMs: 400,
        submissionSource: "applicant",
      }
    );

    const confirmed = applyApplicantConfirmation(
      draft,
      { brandName: "HOCHSTADTER'S" },
      { id: "ruth", name: "Ruth Alvarez" }
    );

    const brand = confirmed.fields.find(
      (field) => field.fieldName === "brandName"
    );
    expect(brand?.status).toBe("pass");
    expect(brand?.expectedValue).toBe("HOCHSTADTER'S");
    expect(brand?.notes).toMatch(/confirmed/i);
    expect(confirmed.reviewStatus).toBe("awaiting_review");
  });

  it("warns when a required field is left blank", () => {
    const draft = buildVerificationResult([], {
      fileName: "label.jpeg",
      imageDataUrl: "data:image/png;base64,xx",
      beverageType: "spirits",
      ocrEngine: "openai",
      agentId: "unassigned",
      agentName: "Unassigned",
      processingTimeMs: 400,
    });

    const confirmed = applyApplicantConfirmation(
      draft,
      { brandName: "" },
      { id: "ruth", name: "Ruth Alvarez" }
    );

    const brand = confirmed.fields.find(
      (field) => field.fieldName === "brandName"
    );
    expect(brand?.status).toBe("warning");
    expect(brand?.notes).toMatch(/blank/i);
  });

  it("does not let the applicant rewrite the government warning", () => {
    const draft = buildVerificationResult([warningField], {
      fileName: "label.jpeg",
      imageDataUrl: "data:image/png;base64,xx",
      beverageType: "spirits",
      ocrEngine: "openai",
      agentId: "unassigned",
      agentName: "Unassigned",
      processingTimeMs: 400,
    });

    const confirmed = applyApplicantConfirmation(
      draft,
      { governmentWarning: "something else" },
      { id: "ruth", name: "Ruth Alvarez" }
    );

    const warning = confirmed.fields.find(
      (field) => field.fieldName === "governmentWarning"
    );
    expect(warning?.extractedValue).toBe(GOVERNMENT_WARNING_TEXT);
    expect(warning?.status).toBe("pass");
  });
});
