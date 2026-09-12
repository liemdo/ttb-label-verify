"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/context/auth-context";
import { useSettings } from "@/context/settings-context";
import { Dropzone } from "@/components/upload/dropzone";
import { FilePreview } from "@/components/upload/file-preview";
import { ImageQualityCheck } from "@/components/upload/image-quality-check";
import { ApplicationForm } from "@/components/upload/application-form";
import { LabelReviewStep } from "@/components/upload/label-review-step";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ensureCompanyAction } from "@/actions/companies";
import { saveResultAction } from "@/actions/results";
import { extractWithTesseract } from "@/lib/tesseract";
import {
  applyApplicantConfirmation,
  buildVerificationResult,
} from "@/lib/verification";
import type {
  ApplicationData,
  BeverageType,
  ImageQualityReport,
  VerificationResult,
} from "@/types";
import { ChevronLeft, ScanSearch } from "lucide-react";

export default function SubmitLabelPage() {
  return (
    <AuthGuard allow={["applicant"]}>
      <SubmitLabelContent />
    </AuthGuard>
  );
}

function SubmitLabelContent() {
  const router = useRouter();
  const { applicant } = useAuth();
  const { settings, getEffectiveApiKey } = useSettings();

  const [files, setFiles] = useState<File[]>([]);
  const [qualityReports, setQualityReports] = useState<Record<string, ImageQualityReport>>({});
  const [beverageType, setBeverageType] = useState<BeverageType>(settings.defaultBeverageType);
  const [skipComparison, setSkipComparison] = useState(true);
  const [appData, setAppData] = useState<ApplicationData>({});

  // Set once the AI has read the label, which moves the page to the review step
  const [review, setReview] = useState<VerificationResult | null>(null);
  const [confirmedValues, setConfirmedValues] = useState<Record<string, string>>({});
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearFiles = () => {
    setFiles([]);
    setQualityReports({});
    setReview(null);
    setError(null);
  };

  const runReview = async (): Promise<VerificationResult> => {
    const file = files[0];
    const base64 = await readFileAsDataUrl(file);
    const applicationData = skipComparison ? undefined : appData;

    if (settings.ocrEngine === "openai") {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          beverageType,
          ocrEngine: "openai",
          openaiApiKey: getEffectiveApiKey(),
          openaiModel: settings.openaiModel,
          applicationData,
          companyName: applicant!.companyName,
          fileName: file.name,
          agentId: "unassigned",
          agentName: "Unassigned",
          submissionSource: "applicant",
          submittedByName: applicant!.contactName,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "We could not read this label");
      }
      return data.result;
    }

    const startTime = Date.now();
    const extracted = await extractWithTesseract(base64);

    return buildVerificationResult(extracted, {
      fileName: file.name,
      imageDataUrl: base64,
      beverageType,
      ocrEngine: "tesseract",
      applicationData,
      companyName: applicant!.companyName,
      agentId: "unassigned",
      agentName: "Unassigned",
      processingTimeMs: Date.now() - startTime,
      submissionSource: "applicant",
      submittedByName: applicant!.contactName,
    });
  };

  const handleReview = async () => {
    if (files.length === 0 || !applicant) return;

    setIsReviewing(true);
    setError(null);

    try {
      const result = await runReview();

      // Seed the editable form with what the AI read, falling back to anything
      // the applicant typed in beforehand
      const seeded: Record<string, string> = {};
      for (const field of result.fields) {
        seeded[field.fieldName] =
          field.extractedValue?.trim() || field.expectedValue?.trim() || "";
      }

      setReview(result);
      setConfirmedValues(seeded);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleSubmit = async () => {
    if (!review || !applicant) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const confirmed = applyApplicantConfirmation(review, confirmedValues, {
        id: applicant.id,
        name: applicant.contactName,
      });

      await ensureCompanyAction(applicant.companyName);
      await saveResultAction(confirmed);
      router.push(`/portal/${confirmed.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  const resetField = (fieldName: string) => {
    const field = review?.fields.find((f) => f.fieldName === fieldName);
    setConfirmedValues((prev) => ({
      ...prev,
      [fieldName]: field?.extractedValue?.trim() ?? "",
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/portal"
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {review ? "Review your label information" : "Submit a Label"}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {review
              ? "Step 2 of 2 — confirm what the AI read, then submit"
              : "Step 1 of 2 — upload your label and run a review"}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {review ? (
        <LabelReviewStep
          result={review}
          values={confirmedValues}
          onValueChange={(fieldName, value) =>
            setConfirmedValues((prev) => ({ ...prev, [fieldName]: value }))
          }
          onResetField={resetField}
          onBack={() => {
            setReview(null);
            window.scrollTo({ top: 0 });
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      ) : files.length === 0 ? (
        <Dropzone
          onFilesSelected={(newFiles, reports) => {
            setFiles(newFiles);
            setQualityReports(reports);
            setError(null);
          }}
          isBatchMode={false}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {qualityReports[files[0].name] && (
              <ImageQualityCheck report={qualityReports[files[0].name]} />
            )}
            <FilePreview file={files[0]} onClear={clearFiles} disabled={isReviewing} />
          </div>

          <div>
            <Card className="p-5 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
              <ApplicationForm
                defaultBeverageType={beverageType}
                companyName={applicant?.companyName ?? ""}
                onChange={(data, type, skip) => {
                  setAppData(data);
                  setBeverageType(type);
                  setSkipComparison(skip);
                }}
              />

              <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <Button
                  onClick={handleReview}
                  disabled={isReviewing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {isReviewing ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" message="" />
                      Reading label...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ScanSearch className="h-4 w-4" />
                      Review
                    </span>
                  )}
                </Button>
                <p className="text-[11px] text-zinc-500 mt-2 text-center">
                  The AI reads your label and fills in the application for you.
                  You can correct anything before submitting.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
