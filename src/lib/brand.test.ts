import { describe, expect, it } from "vitest";
import { brandForHeading } from "@/lib/brand";
import { makeField, makeResult } from "@/test/fixtures";

describe("brandForHeading", () => {
  it("prefers the expected brand, then the extracted value", () => {
    expect(
      brandForHeading(
        makeResult({
          fields: [
            makeField({
              expectedValue: "Hochstadter's",
              extractedValue: "OTHER",
            }),
          ],
        })
      )
    ).toBe("Hochstadter's");

    expect(
      brandForHeading(
        makeResult({
          fields: [
            makeField({ expectedValue: undefined, extractedValue: "Rye Co" }),
          ],
        })
      )
    ).toBe("Rye Co");
  });

  it("title-cases an all-caps brand", () => {
    expect(
      brandForHeading(
        makeResult({
          fields: [makeField({ expectedValue: "HOCHSTADTER'S RYE" })],
        })
      )
    ).toBe("Hochstadter's Rye");
  });

  it("falls back to the file name when no brand exists", () => {
    expect(
      brandForHeading(
        makeResult({
          fileName: "label.jpeg",
          fields: [
            makeField({
              fieldName: "classType",
              expectedValue: undefined,
              extractedValue: null,
            }),
          ],
        })
      )
    ).toBe("label.jpeg");
  });
});
