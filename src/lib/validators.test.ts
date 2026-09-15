import { describe, expect, it } from "vitest";
import { GOVERNMENT_WARNING_TEXT } from "@/lib/constants";
import {
  governmentWarningWording,
  normalizeForCompare,
  validateAlcoholContent,
  validateBrandName,
  validateClassType,
  validateCountryOfOrigin,
  validateGovernmentWarning,
  validateNetContents,
  validateProducerAddress,
} from "@/lib/validators";

describe("normalizeForCompare", () => {
  it("ignores case and extra spaces", () => {
    expect(normalizeForCompare("  STONE'S  THROW  ")).toBe("stone's throw");
  });
});

describe("governmentWarningWording", () => {
  it("treats punctuation and case as equivalent", () => {
    expect(governmentWarningWording("GOVERNMENT WARNING:")).toBe(
      governmentWarningWording("Government warning:")
    );
  });
});

describe("validateBrandName", () => {
  it("passes an exact or case-insensitive match", () => {
    expect(validateBrandName("HOCHSTADTER'S", "Hochstadter's").status).toBe(
      "pass"
    );
  });

  it("fails when the brand is missing or unrelated", () => {
    expect(validateBrandName(null, "Hochstadter's").status).toBe("fail");
    expect(validateBrandName("Jim Beam", "Hochstadter's").status).toBe("fail");
  });
});

describe("validateClassType", () => {
  it("passes a close class/type designation", () => {
    expect(
      validateClassType("Straight Rye Whiskey", "STRAIGHT RYE WHISKEY").status
    ).toBe("pass");
  });
});

describe("validateAlcoholContent", () => {
  it("passes matching ABV and fails a mismatch", () => {
    expect(validateAlcoholContent("ALC. 40% BY VOL", "40% Alc./Vol.").status).toBe(
      "pass"
    );
    expect(validateAlcoholContent("45%", "40%").status).toBe("fail");
  });

  it("fails when alcohol content is missing", () => {
    expect(validateAlcoholContent(null, "40%").status).toBe("fail");
  });
});

describe("validateNetContents", () => {
  it("passes matching volume and unit", () => {
    expect(validateNetContents("750ML", "750 mL").status).toBe("pass");
  });

  it("fails a different volume", () => {
    expect(validateNetContents("375 mL", "750 mL").status).toBe("fail");
  });
});

describe("validateGovernmentWarning", () => {
  it("passes the mandated wording with an ALL CAPS header", () => {
    expect(validateGovernmentWarning(GOVERNMENT_WARNING_TEXT).status).toBe(
      "pass"
    );
  });

  it("fails a mixed-case header", () => {
    const mixed = GOVERNMENT_WARNING_TEXT.replace(
      "GOVERNMENT WARNING:",
      "Government Warning:"
    );
    expect(validateGovernmentWarning(mixed).status).toBe("fail");
    expect(validateGovernmentWarning(mixed).notes).toMatch(/ALL CAPS/);
  });

  it("fails when the statement is missing", () => {
    expect(validateGovernmentWarning(null).status).toBe("fail");
  });
});

describe("validateProducerAddress", () => {
  it("passes a close address match", () => {
    expect(
      validateProducerAddress(
        "Silver Fox Distillers, Philadelphia",
        "Silver Fox Distillers, Philadelphia, PA"
      ).status
    ).toBe("pass");
  });
});

describe("validateCountryOfOrigin", () => {
  it("passes when the expected country appears in the extracted text", () => {
    expect(
      validateCountryOfOrigin("Product of Scotland", "Scotland").status
    ).toBe("pass");
    expect(validateCountryOfOrigin("Ireland", "Scotland").status).toBe("fail");
  });
});
