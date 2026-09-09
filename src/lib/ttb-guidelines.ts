import type { TTBGuideline } from "@/types";

export const TTB_GUIDELINES: Record<string, TTBGuideline> = {
  spirits: {
    beverageType: "spirits",
    displayName: "Distilled Spirits",
    regulation: "27 CFR Part 5",
    description:
      "Distilled spirits include whiskey, vodka, rum, gin, tequila, brandy, and other liquors produced by distillation. Labels are subject to strict field-of-vision requirements and may require formula approval for flavored or non-standard products.",
    requiredFields: [
      {
        field: "brandName",
        displayName: "Brand Name",
        required: true,
        notes:
          "Must appear in the same field of vision as class/type and alcohol content.",
      },
      {
        field: "classType",
        displayName: "Class/Type Designation",
        required: true,
        notes:
          'Must accurately describe the product (e.g., "Kentucky Straight Bourbon Whiskey", "London Dry Gin"). Must match formula approval if applicable.',
      },
      {
        field: "alcoholContent",
        displayName: "Alcohol Content (ABV)",
        required: true,
        notes:
          'Stated as percentage alcohol by volume (e.g., "40% Alc./Vol."). Proof statement is optional but common (e.g., "80 Proof").',
      },
      {
        field: "netContents",
        displayName: "Net Contents",
        required: true,
        notes:
          "Must use standard sizes: 50 mL, 100 mL, 200 mL, 375 mL, 750 mL, 1 L, or 1.75 L.",
      },
      {
        field: "governmentWarning",
        displayName: "Government Warning Statement",
        required: true,
        notes:
          'Must use exact mandated text. "GOVERNMENT WARNING:" must be in all caps and bold or contrasting type.',
      },
      {
        field: "producerAddress",
        displayName: "Name & Address of Producer/Bottler",
        required: true,
        notes:
          "Must match the name and address on the TTB permit. For imports, must show importer information.",
      },
      {
        field: "countryOfOrigin",
        displayName: "Country of Origin",
        required: true,
        onlyIf: "imported",
        notes: 'Required for all imported products. Must state "Product of [Country]".',
      },
    ],
    formattingRules: [
      {
        rule: "Field of Vision",
        description:
          "Brand name, class/type designation, and alcohol content must appear on the same side of the container (same field of vision).",
      },
      {
        rule: "Minimum Type Size",
        description:
          "Mandatory information must be in type size of at least 2mm for containers 200 mL or larger.",
      },
      {
        rule: "Contrasting Background",
        description:
          "All mandatory text must be readily legible against a contrasting background.",
      },
      {
        rule: "Government Warning Formatting",
        description:
          '"GOVERNMENT WARNING:" must be in all caps and in bold or otherwise contrasting type. The rest of the statement must be legible.',
      },
    ],
    commonRejections: [
      "ABV not in the same field of vision as brand name and class/type",
      "Missing or incorrect proof statement",
      "Class/type designation not matching formula approval",
      'Government Warning not using exact mandated text or "GOVERNMENT WARNING:" not in all caps',
      "Net contents not using a standard bottle size",
      "Missing age statement for products requiring one",
      "Producer/bottler name not matching TTB permit",
    ],
    specialRequirements: [
      {
        name: "Age Statement",
        description:
          "Required for certain types of spirits (e.g., straight whiskey aged less than 4 years). Must state the age of the youngest spirit in the blend.",
        appliesWhen: "Product is a straight whiskey aged less than 4 years",
      },
      {
        name: "Proof Statement",
        description:
          "While not always required, proof is commonly included alongside ABV. Proof = 2 × ABV.",
      },
      {
        name: "Formula Approval",
        description:
          "Required for flavored spirits, spirits with non-standard ingredients, or products that don't fit established classes.",
        appliesWhen: "Product contains flavoring, coloring, or non-standard ingredients",
      },
    ],
  },

  wine: {
    beverageType: "wine",
    displayName: "Wine",
    regulation: "27 CFR Part 4",
    description:
      "Wine includes grape wine, fruit wine, sparkling wine, and other fermented beverages with 7% or more alcohol by volume. Wines under 7% ABV are generally regulated by the FDA rather than TTB.",
    requiredFields: [
      {
        field: "brandName",
        displayName: "Brand Name",
        required: true,
        notes: "The name under which the wine is marketed.",
      },
      {
        field: "classType",
        displayName: "Class/Type Designation",
        required: true,
        notes:
          'e.g., "Red Wine", "Cabernet Sauvignon", "Sparkling Wine". Varietal names require at least 75% of the named grape.',
      },
      {
        field: "alcoholContent",
        displayName: "Alcohol Content (ABV)",
        required: true,
        notes:
          "Required for wines with 14% ABV or higher. Wines under 14% may use a broader tolerance range.",
      },
      {
        field: "netContents",
        displayName: "Net Contents",
        required: true,
        notes: "Must use standard sizes (e.g., 750 mL, 1.5 L).",
      },
      {
        field: "governmentWarning",
        displayName: "Government Warning Statement",
        required: true,
        notes:
          'Must use exact mandated text. "GOVERNMENT WARNING:" must be in all caps.',
      },
      {
        field: "producerAddress",
        displayName: "Name & Address of Bottler/Producer",
        required: true,
        notes:
          'Must include qualifying statement such as "Produced and bottled by" or "Vinted and bottled by".',
      },
      {
        field: "countryOfOrigin",
        displayName: "Country of Origin",
        required: true,
        onlyIf: "imported",
        notes: "Required for all imported wines.",
      },
      {
        field: "sulfiteDeclaration",
        displayName: "Sulfite Declaration",
        required: true,
        notes:
          '"Contains Sulfites" required for wines with 10+ ppm sulfur dioxide.',
      },
    ],
    formattingRules: [
      {
        rule: "Minimum Type Size",
        description:
          "Mandatory information must meet minimum type size requirements based on container size.",
      },
      {
        rule: "Contrasting Background",
        description: "All mandatory text must be legible against a contrasting background.",
      },
      {
        rule: "Government Warning Formatting",
        description:
          '"GOVERNMENT WARNING:" must be in all caps and contrasting type.',
      },
    ],
    commonRejections: [
      "Missing sulfite declaration",
      "Varietal designation used with less than 75% of named grape",
      "Appellation of origin missing when vintage date is used",
      "Government Warning text not exact or not in required format",
      "Alcohol content tolerance exceeded",
      "Missing or incorrect qualifying statement for bottler",
    ],
    specialRequirements: [
      {
        name: "Sulfite Declaration",
        description:
          '"Contains Sulfites" must appear on all wines containing 10 or more parts per million of sulfur dioxide.',
        appliesWhen: "Wine contains 10+ ppm sulfur dioxide (most wines)",
      },
      {
        name: "Appellation of Origin",
        description:
          "Required when a vintage date, varietal designation, or 'estate bottled' claim is used.",
        appliesWhen: "Label uses vintage date, varietal, or estate bottled claim",
      },
      {
        name: "Vintage Date",
        description:
          "If used, at least 85% of the wine must be from the stated vintage year (95% for AVA-designated wines).",
        appliesWhen: "Label displays a vintage year",
      },
    ],
  },

  beer: {
    beverageType: "beer",
    displayName: "Malt Beverages / Beer",
    regulation: "27 CFR Part 7",
    description:
      "Malt beverages (beer, ale, lager, stout, porter, etc.) are beverages made from malted barley and hops. Products not containing both malt and hops may be regulated by the FDA instead of TTB.",
    requiredFields: [
      {
        field: "brandName",
        displayName: "Brand Name",
        required: true,
        notes: "The name under which the product is marketed.",
      },
      {
        field: "classType",
        displayName: "Class/Type Designation",
        required: true,
        notes:
          'e.g., "Ale", "Lager", "India Pale Ale", "Stout". Must accurately describe the product.',
      },
      {
        field: "alcoholContent",
        displayName: "Alcohol Content (ABV)",
        required: true,
        notes:
          "Required in most states. Some states prohibit ABV on beer labels — check state-specific requirements.",
      },
      {
        field: "netContents",
        displayName: "Net Contents",
        required: true,
        notes:
          "Stated in fluid ounces or metric units (e.g., 12 fl oz, 355 mL).",
      },
      {
        field: "governmentWarning",
        displayName: "Government Warning Statement",
        required: true,
        notes:
          'Must use exact mandated text. "GOVERNMENT WARNING:" must be in all caps.',
      },
      {
        field: "producerAddress",
        displayName: "Name & Address of Brewer/Importer",
        required: true,
        notes: "Must match the name and address on the TTB brewer's notice or importer's permit.",
      },
      {
        field: "countryOfOrigin",
        displayName: "Country of Origin",
        required: true,
        onlyIf: "imported",
        notes: "Required for all imported malt beverages.",
      },
    ],
    formattingRules: [
      {
        rule: "Minimum Type Size",
        description:
          "Mandatory information must be at least 2mm for containers larger than half a pint.",
      },
      {
        rule: "Contrasting Background",
        description: "All mandatory text must be legible against a contrasting background.",
      },
      {
        rule: "Government Warning Formatting",
        description:
          '"GOVERNMENT WARNING:" must be in all caps and contrasting type.',
      },
    ],
    commonRejections: [
      "Missing or incorrect government warning text",
      "ABV statement not meeting state-specific requirements",
      "Class/type not accurately describing the product",
      "Net contents not properly stated",
      "Producer/brewer name not matching TTB permit",
      "Misleading or unsubstantiated health claims",
    ],
    specialRequirements: [
      {
        name: "FTC Beer Definition",
        description:
          "TTB regulates malt beverages made with both malted barley and hops. Products without both may fall under FDA jurisdiction.",
        appliesWhen: "Product does not contain both malt and hops",
      },
      {
        name: "Formula Approval",
        description:
          "Required for beers with non-traditional ingredients, flavors, or processes.",
        appliesWhen: "Product contains non-traditional ingredients or flavoring",
      },
    ],
  },
};

export function getGuidelineForBeverage(beverageType: string): TTBGuideline {
  return TTB_GUIDELINES[beverageType] ?? TTB_GUIDELINES.spirits;
}

export function getRequiredFieldsForBeverage(
  beverageType: string,
  isImported: boolean = false
): string[] {
  const guideline = getGuidelineForBeverage(beverageType);
  return guideline.requiredFields
    .filter((f) => {
      if (!f.required) return false;
      if (f.onlyIf === "imported" && !isImported) return false;
      return true;
    })
    .map((f) => f.field);
}
