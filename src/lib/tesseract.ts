import type { ExtractedField } from "@/types";

/**
 * Extract text from a label image using Tesseract.js (browser-side OCR).
 * This runs entirely client-side via Web Workers — no API key needed.
 */
export async function extractWithTesseract(
  imageBase64: string
): Promise<ExtractedField[]> {
  // Dynamic import to avoid SSR issues
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");

  try {
    // Ensure proper data URL format
    const dataUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const result = await worker.recognize(dataUrl);
    const rawText = result.data.text;

    return parseFieldsFromText(rawText);
  } finally {
    await worker.terminate();
  }
}

/**
 * Parse structured fields from raw OCR text using regex patterns.
 */
function parseFieldsFromText(rawText: string): ExtractedField[] {
  const fields: ExtractedField[] = [];
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const fullText = lines.join(" ");

  // Government Warning — look for the distinctive pattern
  const govWarningMatch = fullText.match(
    /GOVERNMENT\s+WARNING\s*:?\s*\(1\)[\s\S]*?health\s+problems\.?/i
  );
  fields.push({
    fieldName: "governmentWarning",
    displayName: "Government Warning",
    value: govWarningMatch ? govWarningMatch[0].trim() : null,
    confidence: govWarningMatch ? 0.7 : 0,
  });

  // Alcohol Content — patterns like "40% Alc./Vol.", "45% ABV", "80 Proof"
  const abvMatch = fullText.match(
    /(\d{1,3}(?:\.\d+)?)\s*%\s*(?:Alc\.?\s*\/?\s*Vol\.?|ABV)(?:\s*\(?\s*(\d+)\s*Proof\s*\)?)?/i
  );
  fields.push({
    fieldName: "alcoholContent",
    displayName: "Alcohol Content",
    value: abvMatch ? abvMatch[0].trim() : null,
    confidence: abvMatch ? 0.75 : 0,
  });

  // Net Contents — patterns like "750 mL", "1.75 L", "12 fl oz"
  const netMatch = fullText.match(
    /(\d+(?:\.\d+)?)\s*(mL|ml|L|l|fl\.?\s*oz\.?|FL\.?\s*OZ\.?)/i
  );
  fields.push({
    fieldName: "netContents",
    displayName: "Net Contents",
    value: netMatch ? netMatch[0].trim() : null,
    confidence: netMatch ? 0.8 : 0,
  });

  // Sulfite Declaration
  const sulfiteMatch = fullText.match(/contains?\s+sulfites?/i);
  fields.push({
    fieldName: "sulfiteDeclaration",
    displayName: "Sulfite Declaration",
    value: sulfiteMatch ? sulfiteMatch[0].trim() : null,
    confidence: sulfiteMatch ? 0.85 : 0,
  });

  // Country of Origin
  const countryMatch = fullText.match(
    /(?:Product|Produced|Made|Imported)\s+(?:of|from|in)\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|\n|$)/i
  );
  fields.push({
    fieldName: "countryOfOrigin",
    displayName: "Country of Origin",
    value: countryMatch ? countryMatch[0].trim() : null,
    confidence: countryMatch ? 0.6 : 0,
  });

  // Producer/Bottler Address — look for patterns with city/state
  const addressMatch = fullText.match(
    /(?:(?:Produced|Bottled|Distilled|Brewed|Vinted|Imported|Blended)\s+(?:and\s+)?(?:bottled|produced|distilled)?\s*by\s+)?([A-Z][^.]*?(?:[A-Z]{2}\s+\d{5}|[A-Z][a-z]+,\s*[A-Z]{2}))/i
  );
  fields.push({
    fieldName: "producerAddress",
    displayName: "Producer/Bottler",
    value: addressMatch ? addressMatch[0].trim() : null,
    confidence: addressMatch ? 0.5 : 0,
  });

  // Brand Name — heuristic: largest/first prominent text (first non-trivial line)
  // Filter out lines that match other known patterns
  const knownPatterns =
    /government\s+warning|alc|vol|proof|mL|fl\s*oz|sulfite|product\s+of|bottled\s+by|produced\s+by|distilled|brewed|imported|net\s+cont/i;
  const brandCandidates = lines.filter(
    (l) => l.length > 2 && l.length < 60 && !knownPatterns.test(l)
  );
  const brandName = brandCandidates.length > 0 ? brandCandidates[0] : null;
  fields.push({
    fieldName: "brandName",
    displayName: "Brand Name",
    value: brandName,
    confidence: brandName ? 0.4 : 0, // Low confidence — heuristic
  });

  // Class/Type — second candidate or look for common type keywords
  const typeKeywords =
    /whiskey|bourbon|vodka|gin|rum|tequila|brandy|cognac|wine|cabernet|merlot|chardonnay|pinot|ale|lager|stout|porter|ipa|pilsner|sauvignon/i;
  const typeCandidate = lines.find(
    (l) => typeKeywords.test(l) && l !== brandName
  );
  const classTypeFromKeyword = typeCandidate || null;
  // Also check second brand candidate
  const classType =
    classTypeFromKeyword ||
    (brandCandidates.length > 1 ? brandCandidates[1] : null);
  fields.push({
    fieldName: "classType",
    displayName: "Class/Type",
    value: classType,
    confidence: classTypeFromKeyword ? 0.5 : classType ? 0.3 : 0,
  });

  return fields;
}
