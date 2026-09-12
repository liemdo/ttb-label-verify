"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LabelImageViewer } from "@/components/results/label-image-viewer";
import { ConfidenceBar } from "@/components/results/confidence-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { APPLICANT_CONFIRMABLE } from "@/lib/verification";
import { BEVERAGE_TYPE_LABELS } from "@/lib/constants";
import type { VerificationResult } from "@/types";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";

interface LabelReviewStepProps {
  result: VerificationResult;
  /** Confirmed value per field name, seeded from what the AI read. */
  values: Record<string, string>;
  onValueChange: (fieldName: string, value: string) => void;
  onResetField: (fieldName: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function LabelReviewStep({
  result,
  values,
  onValueChange,
  onResetField,
  onBack,
  onSubmit,
  isSubmitting,
}: LabelReviewStepProps) {
  const editableFields = result.fields.filter(APPLICANT_CONFIRMABLE);
  const warningField = result.fields.find(
    (f) => f.fieldName === "governmentWarning"
  );

  const filledByAi = editableFields.filter((f) => f.extractedValue).length;
  const blankRequired = editableFields.filter(
    (f) => f.required && !(values[f.fieldName] ?? "").trim()
  );
  const warningFailed =
    !!warningField && (warningField.status === "fail" || warningField.status === "warning");
  const hasGaps = blankRequired.length > 0 || warningFailed;

  return (
    <div className="space-y-6">
      <Card className="p-5 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Sparkles className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                The AI filled in {filledByAi} of {editableFields.length} fields
                from your label
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Check each value against your artwork and correct anything the AI
                misread. What you submit here is what the TTB specialist compares
                against the label.
              </p>
            </div>
          </div>
          <div className="text-xs text-zinc-500 shrink-0 sm:text-right">
            <p>{BEVERAGE_TYPE_LABELS[result.beverageType] ?? result.beverageType}</p>
            <p className="mt-0.5">
              Read in {(result.processingTimeMs / 1000).toFixed(1)}s
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2 lg:sticky lg:top-6">
          <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-3">Your label</h2>
            <LabelImageViewer
              src={result.imageDataUrl}
              alt={`Label for ${result.fileName}`}
            />
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <Card className="p-5 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 space-y-5">
            <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Label information
            </h2>

            {editableFields.map((field) => {
              const value = values[field.fieldName] ?? "";
              const readByAi = (field.extractedValue ?? "").trim();
              const isCorrected = value.trim() !== readByAi;
              const notFound = !readByAi;

              return (
                <div key={field.fieldName} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      {field.displayName}
                      {field.required && (
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wide">
                          required
                        </span>
                      )}
                    </Label>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notFound && <ConfidenceBar confidence={field.confidence} />}
                      {isCorrected && readByAi && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onResetField(field.fieldName)}
                          className="h-6 gap-1 px-1.5 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          title={`Restore what the AI read: ${readByAi}`}
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span className="text-[11px]">Undo</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  <Input
                    value={value}
                    onChange={(e) => onValueChange(field.fieldName, e.target.value)}
                    placeholder={
                      notFound
                        ? "The AI could not find this on your label — enter it yourself"
                        : ""
                    }
                    className={`bg-zinc-50 dark:bg-zinc-900 ${
                      isCorrected
                        ? "border-indigo-500/40"
                        : notFound
                          ? "border-amber-500/30"
                          : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  />

                  {isCorrected && readByAi ? (
                    <p className="text-[11px] text-indigo-400">
                      You changed this. The AI read &ldquo;{readByAi}&rdquo;.
                    </p>
                  ) : field.expectedValue &&
                    field.expectedValue.trim() !== readByAi &&
                    !isCorrected ? (
                    <p className="text-[11px] text-amber-400">
                      You entered &ldquo;{field.expectedValue}&rdquo; before the
                      review, which differs from the label.
                    </p>
                  ) : (
                    field.notes && (
                      <p className="text-[11px] text-zinc-500">{field.notes}</p>
                    )
                  )}
                </div>
              );
            })}
          </Card>

          {warningField && (
            <Card className="p-5 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {warningField.displayName}
                </h2>
                <StatusBadge status={warningField.status} />
              </div>
              <p className="text-xs text-zinc-500">
                The mandated warning statement is fixed text, so it is checked
                automatically rather than entered.
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {warningField.extractedValue || (
                  <span className="text-zinc-400 italic dark:text-zinc-600">Not found on label</span>
                )}
              </p>
              {warningField.notes && (
                <p className="text-[11px] text-zinc-500">{warningField.notes}</p>
              )}
            </Card>
          )}
        </div>
      </div>

      <Card
        className={`p-5 ${
          hasGaps
            ? "bg-amber-500/5 border-amber-500/25"
            : "bg-emerald-500/5 border-emerald-500/25"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {hasGaps ? (
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {hasGaps
                  ? "Some required information is still missing"
                  : "Everything required is filled in"}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {blankRequired.length > 0 && (
                  <>
                    {blankRequired.map((f) => f.displayName).join(", ")}{" "}
                    {blankRequired.length === 1 ? "is" : "are"} blank.{" "}
                  </>
                )}
                {warningFailed && <>The government warning did not check out. </>}
                {hasGaps
                  ? "You can fill these in, or submit anyway and let a specialist review it against your artwork."
                  : "A TTB specialist will compare this against your artwork."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
              size="lg"
              className="gap-2 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              size="lg"
              className={`gap-2 text-white ${
                hasGaps
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <Send className="h-4 w-4" />
              {isSubmitting
                ? "Submitting..."
                : hasGaps
                  ? "Submit anyway"
                  : "Submit application"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
