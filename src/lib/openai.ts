import OpenAI from "openai";
import type { ExtractedField } from "@/types";

const EXTRACTION_PROMPT = `You are an expert at reading alcohol beverage labels. Analyze the provided label image and extract the following fields. Return ONLY valid JSON (no markdown).

Return a JSON object with a "fields" key containing an array. Each object in the array should have:
- "fieldName": one of ["brandName", "classType", "alcoholContent", "netContents", "governmentWarning", "producerAddress", "countryOfOrigin", "sulfiteDeclaration"]
- "displayName": human-readable name for the field
- "value": the extracted text exactly as it appears on the label, or null if not found
- "confidence": a number between 0 and 1 indicating how confident you are in the extraction

Important rules:
1. Extract text EXACTLY as it appears on the label — do not correct spelling or capitalization
2. For the government warning, extract the COMPLETE text including "GOVERNMENT WARNING:" prefix
3. For alcohol content, include the full expression (e.g., "45% Alc./Vol. (90 Proof)")
4. For producer/bottler address, include the full name and address
5. If you cannot read a field clearly, set value to null and confidence to a low number
6. If a field is simply not present on the label, set value to null and confidence to 0.9 (high confidence it's absent)
7. Handle imperfect images — glare, angles, curved text — to the best of your ability

Return ONLY the JSON object with the "fields" array, no other text.`;

export async function extractWithOpenAI(
  imageBase64: string,
  apiKey: string,
  model: string = "gpt-4o"
): Promise<ExtractedField[]> {
  const client = new OpenAI({ apiKey });

  // Ensure proper data URL format
  const imageUrl = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: EXTRACTION_PROMPT },
          {
            type: "image_url",
            image_url: { url: imageUrl, detail: "high" },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  try {
    const parsed = JSON.parse(content);
    const fields = parsed.fields || parsed;
    if (!Array.isArray(fields)) {
      throw new Error("Expected array of fields");
    }
    return fields as ExtractedField[];
  } catch {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error("Failed to parse AI response. Please try again.");
  }
}

export async function testOpenAIConnection(apiKey: string): Promise<boolean> {
  try {
    const client = new OpenAI({ apiKey });
    await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say ok" }],
      max_tokens: 5,
    });
    return true;
  } catch {
    return false;
  }
}
