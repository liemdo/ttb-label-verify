import { NextResponse } from "next/server";
import type { VerifyRequest } from "@/types";
import { extractWithOpenAI } from "@/lib/openai";
import { buildVerificationResult } from "@/lib/verification";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyRequest & {
      fileName?: string;
      agentId?: string;
      agentName?: string;
    };

    const {
      imageBase64,
      beverageType,
      ocrEngine,
      openaiApiKey,
      openaiModel,
      applicationData,
      fileName = "label.jpg",
      agentId = "unknown",
      agentName = "Unknown Agent",
      companyName,
      submissionSource,
      submittedByName,
    } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    if (ocrEngine === "openai") {
      // Use server-side env var as fallback
      const apiKey = openaiApiKey || process.env.OPENAI_API_KEY || "";

      if (!apiKey) {
        return NextResponse.json(
          {
            success: false,
            error:
              "OpenAI API key is required. Set it in Settings or add OPENAI_API_KEY to your .env.local file.",
          },
          { status: 400 }
        );
      }

      const extractedFields = await extractWithOpenAI(
        imageBase64,
        apiKey,
        openaiModel || "gpt-4o"
      );

      const processingTimeMs = Date.now() - startTime;

      const result = buildVerificationResult(extractedFields, {
        fileName,
        imageDataUrl: imageBase64.startsWith("data:")
          ? imageBase64
          : `data:image/jpeg;base64,${imageBase64}`,
        beverageType,
        ocrEngine,
        applicationData,
        companyName,
        agentId,
        agentName,
        processingTimeMs,
        submissionSource,
        submittedByName,
      });

      return NextResponse.json({ success: true, result });
    }

    // Tesseract runs client-side
    return NextResponse.json({
      success: false,
      error:
        "Tesseract OCR runs client-side. This endpoint is for AI (OpenAI) processing only.",
      useClientSide: true,
    });
  } catch (error) {
    console.error("Verification error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    // Detect network/auth errors to suggest Tesseract fallback
    const isNetworkError =
      message.includes("fetch") ||
      message.includes("ECONNREFUSED") ||
      message.includes("network");
    const isAuthError =
      message.includes("401") ||
      message.includes("Incorrect API key") ||
      message.includes("invalid_api_key");

    return NextResponse.json(
      {
        success: false,
        error: isAuthError
          ? "Invalid OpenAI API key. Check your key in Settings."
          : isNetworkError
          ? "Cannot reach OpenAI API. Your network may be blocking external requests. Try switching to Tesseract mode in Settings."
          : message,
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
