"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useSettings } from "@/context/settings-context";
import { useResults } from "@/context/results-context";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Dropzone } from "@/components/upload/dropzone";
import { FilePreview } from "@/components/upload/file-preview";
import { BatchUploadList } from "@/components/upload/batch-upload-list";
import { ImageQualityCheck } from "@/components/upload/image-quality-check";
import { ApplicationForm } from "@/components/upload/application-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { AnalystView } from "@/components/results/analyst-view";
import { ReviewWorkspace } from "@/components/results/review-workspace";
import { BatchResults } from "@/components/results/batch-results";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  ImageQualityReport,
  ApplicationData,
  BeverageType,
  VerificationResult,
} from "@/types";
import { Play, RotateCcw } from "lucide-react";
import { extractWithTesseract } from "@/lib/tesseract";
import { buildVerificationResult } from "@/lib/verification";
import { BATCH_CONCURRENCY } from "@/lib/constants";
import { missingRequiredApplicationFields } from "@/lib/ttb-guidelines";
import { runWithConcurrency } from "@/lib/async-pool";
import { brandForHeading } from "@/lib/brand";
import { ensureCompanyAction, type CompanyContactInput } from "@/actions/companies";
import { uploadLabelImageAction } from "@/actions/blob";
import type { BatchFileError } from "@/components/results/batch-results";

export default function VerifyPage() {
  return (
    <AuthGuard>
      <VerifyContent />
    </AuthGuard>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "batch" ? "batch" : "single";

  const { agent } = useAuth();
  const { settings, getEffectiveApiKey, setOcrEngine } = useSettings();
  const { addResult, addResults } = useResults();

  const [mode, setMode] = useState<"single" | "batch">(initialMode);
  const [files, setFiles] = useState<File[]>([]);
  const [qualityReports, setQualityReports] = useState<Record<string, ImageQualityReport>>({});
  
  const [beverageType, setBeverageType] = useState<BeverageType>("spirits");
  const [skipComparison, setSkipComparison] = useState(false);
  const [appData, setAppData] = useState<ApplicationData>({});
  const [companyName, setCompanyName] = useState("");
  const [newCompanyContact, setNewCompanyContact] = useState<CompanyContactInput | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<VerificationResult | null>(null);
  const [batchResults, setBatchResults] = useState<VerificationResult[]>([]);
  const [batchErrors, setBatchErrors] = useState<BatchFileError[]>([]);

  const handleFilesSelected = (newFiles: File[], newReports: Record<string, ImageQualityReport>) => {
    setFiles(newFiles);
    setQualityReports(newReports);
    setError(null);
  };

  const clearFiles = () => {
    setFiles([]);
    setQualityReports({});
    setResult(null);
    setBatchResults([]);
    setBatchErrors([]);
    setError(null);
    setCompanyName("");
    setNewCompanyContact(null);
  };

  const uploadLabelImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    return uploadLabelImageAction(formData);
  };

  const processFile = async (file: File): Promise<VerificationResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          
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
                companyName: companyName.trim(),
                fileName: file.name,
                agentId: agent?.id,
                agentName: agent?.name,
                submissionSource: "specialist",
                submittedByName: agent?.name,
              }),
            });
            
            const data = await res.json();
            
            if (!data.success) {
              if (data.useClientSide) {
                // Fallback requested by API
                throw new Error("CLIENT_SIDE_REQUIRED");
              }
              throw new Error(data.error || "Verification failed");
            }
            
            resolve(data.result);
          } else {
            // Tesseract Mode
            const startTime = Date.now();
            const extracted = await extractWithTesseract(base64);
            
            const result = buildVerificationResult(extracted, {
              fileName: file.name,
              imageDataUrl: base64,
              beverageType,
              ocrEngine: "tesseract",
              applicationData: skipComparison ? undefined : appData,
              companyName: companyName.trim(),
              agentId: agent?.id || "unknown",
              agentName: agent?.name || "Unknown Agent",
              processingTimeMs: Date.now() - startTime,
              submissionSource: "specialist",
              submittedByName: agent?.name,
            });
            
            resolve(result);
          }
        } catch (err: any) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const missingAppFields = skipComparison
    ? []
    : missingRequiredApplicationFields(appData, beverageType);

  const handleVerify = async () => {
    if (files.length === 0) return;
    if (!companyName.trim()) {
      setError("Please select or enter the submitting company before verifying.");
      return;
    }
    if (
      newCompanyContact &&
      (!newCompanyContact.contactName.trim() ||
        !newCompanyContact.contactPhone.trim() ||
        !newCompanyContact.contactEmail.trim())
    ) {
      setError("Add a contact name, phone, and email for the new company.");
      return;
    }
    if (missingAppFields.length > 0) {
      setError(
        `Enter application data for: ${missingAppFields.join(", ")}. Or skip comparison.`
      );
      return;
    }

    setIsProcessing(true);
    setError(null);
    setBatchErrors([]);
    setProgress(0);

    try {
      const company = await ensureCompanyAction(
        companyName,
        newCompanyContact ?? undefined
      );
      setCompanyName(company.name);

      if (mode === "single") {
        const res = await processFile(files[0]);
        const imageDataUrl = await uploadLabelImage(files[0]);
        const withCompany = { ...res, companyName: company.name, imageDataUrl };
        setResult(withCompany);
        await addResult(withCompany);
      } else {
        const settled = await runWithConcurrency(
          files,
          BATCH_CONCURRENCY,
          async (file) => {
            const res = await processFile(file);
            const imageDataUrl = await uploadLabelImage(file);
            return { ...res, companyName: company.name, imageDataUrl };
          },
          (done, total) => setProgress(Math.round((done / total) * 100))
        );

        const results: VerificationResult[] = [];
        const errors: BatchFileError[] = [];
        settled.forEach((item, index) => {
          if (item.status === "fulfilled") {
            results.push(item.value);
            return;
          }
          const reason = item.reason;
          const message =
            reason instanceof Error ? reason.message : String(reason);
          errors.push({ fileName: files[index].name, message });
        });

        setBatchResults(results);
        setBatchErrors(errors);
        if (results.length > 0) {
          await addResults(results);
        }
        if (results.length === 0 && errors.length > 0) {
          const networkBlocked = errors.some(
            (e) =>
              e.message === "CLIENT_SIDE_REQUIRED" ||
              e.message.includes("Cannot reach OpenAI API")
          );
          setError(
            networkBlocked
              ? "Network error connecting to AI API. Would you like to switch to Offline Tesseract Mode?"
              : `All ${errors.length} files failed to process.`
          );
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === "CLIENT_SIDE_REQUIRED" || message.includes("Cannot reach OpenAI API")) {
        setError("Network error connecting to AI API. Would you like to switch to Offline Tesseract Mode?");
      } else {
        setError(message || "An unexpected error occurred during verification.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwitchToTesseract = () => {
    setOcrEngine("tesseract");
    setError(null);
    handleVerify();
  };

  useKeyboardShortcuts([
    {
      key: "n",
      description: "Next Label",
      action: () => {
        if (result || batchResults.length > 0 || batchErrors.length > 0) {
          clearFiles();
        }
      },
    },
  ]);

  if (mode === "single" && result) {
    return (
      <ReviewWorkspace
        title="Application Details"
        subtitle={`Detailed analyst view for ${brandForHeading(result)}`}
        trailing={
          <Button
            onClick={clearFiles}
            variant="outline"
            className="border-border text-foreground hover:bg-accent gap-2 shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
            Verify Another
          </Button>
        }
      >
        <AnalystView key={result.id} initialResult={result} onDeleted={clearFiles} />
      </ReviewWorkspace>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Label Verification</h1>
          <p className="text-muted-foreground mt-1">
            Match the label to the application, then review TTB-required fields
          </p>
        </div>
        <div className="flex items-center bg-muted rounded-lg p-1 border border-border">
          <button
            onClick={() => { setMode("single"); clearFiles(); }}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              mode === "single" ? "bg-card text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Single
          </button>
          <button
            onClick={() => { setMode("batch"); clearFiles(); }}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              mode === "batch" ? "bg-card text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Batch Upload
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-red-400">{error}</p>
          {error.includes("Offline Tesseract Mode") && (
            <Button size="sm" onClick={handleSwitchToTesseract} className="bg-red-500 hover:bg-red-600 text-white">
              Switch to Offline Mode
            </Button>
          )}
        </div>
      )}

      {/* Upload State — form fields only appear after a label is uploaded */}
      {!result && batchResults.length === 0 && batchErrors.length === 0 && (
        files.length === 0 ? (
          <Dropzone onFilesSelected={handleFilesSelected} isBatchMode={mode === "batch"} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {mode === "single" ? (
                <div className="space-y-4">
                  {qualityReports[files[0].name] && (
                    <ImageQualityCheck report={qualityReports[files[0].name]} />
                  )}
                  <FilePreview file={files[0]} onClear={clearFiles} disabled={isProcessing} scanning={isProcessing} />
                </div>
              ) : (
                <BatchUploadList
                  files={files}
                  qualityReports={qualityReports}
                  onRemove={(i) => {
                    const newFiles = [...files];
                    newFiles.splice(i, 1);
                    setFiles(newFiles);
                  }}
                  disabled={isProcessing}
                />
              )}
            </div>

            <div>
              <Card className="p-5 bg-card border-border">
                <ApplicationForm
                  compareByDefault
                  defaultBeverageType={beverageType}
                  companyName={companyName}
                  onCompanyChange={setCompanyName}
                  onNewCompanyContactChange={setNewCompanyContact}
                  onChange={(data, type, skip) => {
                    setAppData(data);
                    setBeverageType(type);
                    setSkipComparison(skip);
                  }}
                />

                <div className="mt-6 pt-6 border-t border-border">
                  <Button
                    onClick={handleVerify}
                    disabled={
                      files.length === 0 ||
                      isProcessing ||
                      !companyName.trim() ||
                      missingAppFields.length > 0 ||
                      !!(
                        newCompanyContact &&
                        (!newCompanyContact.contactName.trim() ||
                          !newCompanyContact.contactPhone.trim() ||
                          !newCompanyContact.contactEmail.trim())
                      )
                    }
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner size="sm" message="" />
                        Processing... {mode === "batch" && `${progress}%`}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        {mode === "single" ? "Run Verification" : `Verify ${files.length} Labels`}
                      </span>
                    )}
                  </Button>
                  {missingAppFields.length > 0 ? (
                    <p className="text-[11px] text-muted-foreground mt-2 text-center">
                      Required application fields: {missingAppFields.join(", ")}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground mt-2 text-center">
                      {agent?.name
                        ? `This label will be submitted by ${agent.name} on behalf of the company.`
                        : "This label will be submitted by a specialist on behalf of the company."}
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )
      )}

      {mode === "batch" && (batchResults.length > 0 || batchErrors.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Button
              onClick={clearFiles}
              variant="outline"
              className="border-border text-foreground hover:bg-accent gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Verify Another
            </Button>
          </div>
          <BatchResults results={batchResults} errors={batchErrors} />
        </div>
      )}
    </div>
  );
}
