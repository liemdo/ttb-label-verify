import type { VerificationResult } from "@/types";

export function brandForHeading(result: VerificationResult): string {
  const field = result.fields.find((f) => f.fieldName === "brandName");
  const brand = field?.expectedValue?.trim() || field?.extractedValue?.trim();
  if (!brand) return result.fileName;
  if (brand === brand.toUpperCase() && /[A-Za-z]/.test(brand)) {
    return brand
      .toLowerCase()
      .replace(/(^|[\s/-])([a-z])/g, (_match, sep: string, ch: string) => sep + ch.toUpperCase());
  }
  return brand;
}
