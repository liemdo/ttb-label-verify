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
import { VerificationCard } from "@/components/results/verification-card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ensureCompanyAction } from "@/actions/companies";
import { saveResultAction } from "@/actions/results";
import { extractWithTesseract } from "@/lib/tesseract";
import { buildVerificationResult } from "@/lib/verification";
import type {
  ApplicationData,
  BeverageType,
  ImageQualityReport,
  VerificationResult,
} from "@/types";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ScanSearch,
  Send,
} from "lucide-react";

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

  const [review, setReview] = useState<VerificationResult | null>(null);
  const [isReviewStale, setIsReviewStale] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearFiles = () => {
    setFiles([]);
    setQualityReports({});
    setReview(null);
    setIsReviewStale(false);
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
      setReview(result);
      setIsReviewStale(false);
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
      await ensureCompanyAction(applicant.companyName);
      await saveResultAction(review);
      router.push(`/portal/${review.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  // Anything the applicant stated that the label doesn't back up
  const mismatchedFields = review
    ? review.fields.filter((f) => f.status === "fail")
    : [];
  const missingFields = review
    ? review.fields.filter((f) => f.status === "warning" && f.required)
    : [];
  const hasConcerns = mismatchedFields.length > 0 || missingFields.length > 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/portal"
          className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors border border-zinc-800 bg-zinc-950"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Submit a Label</h1>
          <p className="text-zinc-400 mt-1">
            Upload your label and run a review. You can submit it either way.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {files.length === 0 ? (
        <Dropzone
          onFilesSelected={(newFiles, reports) => {
            setFiles(newFiles);
            setQualityReports(reports);
            setReview(null);
            setIsReviewStale(false);
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
            <FilePreview
              file={files[0]}
              onClear={clearFiles}
              disabled={isReviewing || isSubmitting}
            />
          </div>

          <div>
            <Card className="p-5 bg-zinc-950 border-zinc-800">
              <ApplicationForm
                defaultBeverageType={beverageType}
                companyName={applicant?.companyName ?? ""}
                onChange={(data, type, skip) => {
                  setAppData(data);
                  setBeverageType(type);
                  setSkipComparison(skip);
                  if (review) setIsReviewStale(true);
                }}
              />

              <div className="mt-6 pt-6 border-t border-zinc-800">
                <Button
                  onClick={handleReview}
                  disabled={isReviewing || isSubmitting}
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
                      {review ? "Review again" : "Review"}
                    </span>
                  )}
                </Button>
                <p className="text-[11px] text-zinc-500 mt-2 text-center">
                  The AI reads your label so you can check it before submitting.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {review && (
        <div className="space-y-4">
          <Card
            className={`p-5 ${
              hasConcerns
                ? "bg-amber-500/5 border-amber-500/25"
                : "bg-emerald-500/5 border-emerald-500/25"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                {hasConcerns ? (
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-100">
                    {hasConcerns
                      ? "The label doesn't match everything you entered"
                      : "Everything on the label checks out"}
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">
                    {mismatchedFields.length > 0 && (
                      <>
                        {formatFieldList(mismatchedFields.map((f) => f.displayName))}{" "}
                        {mismatchedFields.length === 1 ? "does" : "do"} not match
                        the label.{" "}
                      </>
                    )}
                    {missingFields.length > 0 && (
                      <>
                        {formatFieldList(missingFields.map((f) => f.displayName))}{" "}
                        {missingFields.length === 1 ? "was" : "were"} not found on
                        the label.{" "}
                      </>
                    )}
                    {hasConcerns
                      ? "You can fix the label and review again, or submit as is and let a specialist decide."
                      : "You're ready to submit this label for review."}
                  </p>
                  {isReviewStale && (
                    <p className="text-xs text-amber-300 mt-2">
                      You changed something since this review. Run Review again to
                      see up-to-date results.
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isReviewing || isReviewStale}
                size="lg"
                className={`shrink-0 gap-2 text-white ${
                  hasConcerns
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <Send className="h-4 w-4" />
                {isSubmitting
                  ? "Submitting..."
                  : hasConcerns
                    ? "Submit anyway"
                    : "Submit application"}
              </Button>
            </div>
          </Card>

          <VerificationCard result={review} />
        </div>
      )}
    </div>
  );
}

function formatFieldList(names: string[]): string {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
