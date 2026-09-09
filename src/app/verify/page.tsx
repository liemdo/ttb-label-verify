"use client";

import { useState, useCallback, useMemo } from "react";
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
import { VerificationCard } from "@/components/results/verification-card";
import { BatchResults } from "@/components/results/batch-results";
import { OverrideDialog } from "@/components/results/override-dialog";
import { QuickActions } from "@/components/results/quick-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  ImageQualityReport,
  ApplicationData,
  BeverageType,
  VerificationResult,
  FieldOverride,
} from "@/types";
import { Play, RotateCcw } from "lucide-react";
import { extractWithTesseract } from "@/lib/tesseract";
import { buildVerificationResult } from "@/lib/verification";

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
  const { addResult, addResults, addOverride, updateAgentNotes } = useResults();

  const [mode, setMode] = useState<"single" | "batch">(initialMode);
  const [files, setFiles] = useState<File[]>([]);
  const [qualityReports, setQualityReports] = useState<Record<string, ImageQualityReport>>({});
  
  const [beverageType, setBeverageType] = useState<BeverageType>(settings.defaultBeverageType);
  const [skipComparison, setSkipComparison] = useState(false);
  const [appData, setAppData] = useState<ApplicationData>({});

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Single mode result
  const [result, setResult] = useState<VerificationResult | null>(null);
  // Batch mode results
  const [batchResults, setBatchResults] = useState<VerificationResult[]>([]);

  // Override dialog state
  const [overrideField, setOverrideField] = useState<string | null>(null);

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
    setError(null);
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
                fileName: file.name,
                agentId: agent?.id,
                agentName: agent?.name,
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
              agentId: agent?.id || "unknown",
              agentName: agent?.name || "Unknown Agent",
              processingTimeMs: Date.now() - startTime,
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

  const handleVerify = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      if (mode === "single") {
        const res = await processFile(files[0]);
        setResult(res);
        addResult(res);
      } else {
        const results: VerificationResult[] = [];
        for (let i = 0; i < files.length; i++) {
          try {
            const res = await processFile(files[i]);
            results.push(res);
          } catch (err) {
            console.error(`Failed to process ${files[i].name}`, err);
          }
          setProgress(Math.round(((i + 1) / files.length) * 100));
        }
        setBatchResults(results);
        addResults(results);
      }
    } catch (err: any) {
      if (err.message === "CLIENT_SIDE_REQUIRED" || err.message.includes("Cannot reach OpenAI API")) {
        setError("Network error connecting to AI API. Would you like to switch to Offline Tesseract Mode?");
      } else {
        setError(err.message || "An unexpected error occurred during verification.");
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

  const handleOverrideSubmit = (override: FieldOverride) => {
    if (mode === "single" && result) {
      const updatedFields = result.fields.map(f => {
        if (f.fieldName === override.fieldName) {
          return { ...f, status: override.overriddenStatus, override };
        }
        return f;
      });
      
      const hasAnyFail = updatedFields.some(f => f.status === "fail" && f.required);
      const hasAnyWarning = updatedFields.some(f => f.status === "warning" && f.required);
      const overallVerdict = (hasAnyFail ? "rejected" : hasAnyWarning ? "needs_review" : "approved") as VerificationResult["overallVerdict"];
      
      const updatedResult = { ...result, fields: updatedFields, overallVerdict };
      setResult(updatedResult);
      addOverride(result.id, override);
    }
  };

  const handleUpdateNotes = (notes: string) => {
    if (mode === "single" && result) {
      setResult({ ...result, agentNotes: notes });
      updateAgentNotes(result.id, notes);
    }
  };

  // Keyboard Shortcuts
  const allPassed = useMemo(() => {
    if (mode !== "single" || !result) return false;
    return !result.fields.some(f => (f.status === "fail" || f.status === "warning") && f.required);
  }, [mode, result]);

  useKeyboardShortcuts([
    {
      key: "a",
      description: "Quick Approve",
      action: () => {
        if (result && allPassed) {
          // In a real app this would call an API. Here we just show a toast or clear.
          clearFiles();
        }
      }
    },
    {
      key: "r",
      description: "Quick Reject",
      action: () => {
        if (result && !allPassed) {
          clearFiles();
        }
      }
    },
    {
      key: "n",
      description: "Next Label",
      action: () => {
        if (result || batchResults.length > 0) {
          clearFiles();
        }
      }
    }
  ]);

  const activeField = result?.fields.find(f => f.fieldName === overrideField);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Label Verification</h1>
          <p className="text-zinc-400 mt-1">Upload and verify alcohol labels against TTB requirements</p>
        </div>
        <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button
            onClick={() => { setMode("single"); clearFiles(); }}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              mode === "single" ? "bg-zinc-800 text-white font-medium shadow-sm" : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            Single
          </button>
          <button
            onClick={() => { setMode("batch"); clearFiles(); }}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              mode === "batch" ? "bg-zinc-800 text-white font-medium shadow-sm" : "text-zinc-400 hover:text-zinc-300"
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

      {/* Upload State */}
      {!result && batchResults.length === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {files.length === 0 ? (
              <Dropzone onFilesSelected={handleFilesSelected} isBatchMode={mode === "batch"} />
            ) : mode === "single" ? (
              <div className="space-y-4">
                {qualityReports[files[0].name] && (
                  <ImageQualityCheck report={qualityReports[files[0].name]} />
                )}
                <FilePreview file={files[0]} onClear={clearFiles} disabled={isProcessing} />
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
            <Card className="p-5 bg-zinc-950 border-zinc-800">
              <ApplicationForm 
                defaultBeverageType={beverageType}
                onChange={(data, type, skip) => {
                  setAppData(data);
                  setBeverageType(type);
                  setSkipComparison(skip);
                }}
              />
              
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <Button
                  onClick={handleVerify}
                  disabled={files.length === 0 || isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Results State */}
      {(result || batchResults.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {mode === "single" && result && (
              <QuickActions
                allPassed={allPassed}
                onApprove={clearFiles}
                onReject={clearFiles}
              />
            )}
            {mode === "batch" && <div />}
            <Button
              onClick={clearFiles}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Verify Another
            </Button>
          </div>

          {mode === "single" && result && (
            <VerificationCard
              result={result}
              onOverrideField={setOverrideField}
              onUpdateNotes={handleUpdateNotes}
            />
          )}

          {mode === "batch" && batchResults.length > 0 && (
            <BatchResults results={batchResults} />
          )}
        </div>
      )}

      {/* Override Dialog */}
      {activeField && result && (
        <OverrideDialog
          open={!!overrideField}
          onOpenChange={(o) => !o && setOverrideField(null)}
          fieldName={activeField.fieldName}
          fieldDisplayName={activeField.displayName}
          currentStatus={activeField.status}
          onSubmit={handleOverrideSubmit}
        />
      )}
    </div>
  );
}
