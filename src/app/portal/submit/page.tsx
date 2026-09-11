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
import { ChevronLeft, Send } from "lucide-react";

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
  const [skipComparison, setSkipComparison] = useState(false);
  const [appData, setAppData] = useState<ApplicationData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearFiles = () => {
    setFiles([]);
    setQualityReports({});
    setError(null);
  };

  const runVerification = async (file: File): Promise<VerificationResult> => {
    const base64 = await readFileAsDataUrl(file);

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
          applicationData: skipComparison ? undefined : appData,
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
        throw new Error(data.error || "Verification failed");
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
      applicationData: skipComparison ? undefined : appData,
      companyName: applicant!.companyName,
      agentId: "unassigned",
      agentName: "Unassigned",
      processingTimeMs: Date.now() - startTime,
      submissionSource: "applicant",
      submittedByName: applicant!.contactName,
    });
  };

  const handleSubmit = async () => {
    if (files.length === 0 || !applicant) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await ensureCompanyAction(applicant.companyName);
      const result = await runVerification(files[0]);
      await saveResultAction(result);
      router.push(`/portal/${result.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      setIsSubmitting(false);
    }
  };

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
            Your label is checked against TTB requirements immediately, then
            reviewed by a compliance specialist.
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
              disabled={isSubmitting}
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
                }}
              />

              <div className="mt-6 pt-6 border-t border-zinc-800">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" message="" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Submit for Review
                    </span>
                  )}
                </Button>
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
