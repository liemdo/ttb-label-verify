"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import type { VerificationResult } from "@/types";
import { ApplicationStatusBadge, ApprovedByLine } from "@/components/shared/status-badge";
import { TimeSaved } from "@/components/results/time-saved";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, ScanSearch } from "lucide-react";
import { FieldCheckRow } from "@/components/results/field-check-row";
import { WarningDiffView } from "@/components/results/warning-diff-view";
import { AgentNotes } from "@/components/results/agent-notes";
import { LabelImageViewer } from "@/components/results/label-image-viewer";

interface VerificationCardProps {
  result: VerificationResult;
  onOverrideField?: (fieldName: string) => void;
  onUpdateNotes?: (notes: string) => void;
  hideImage?: boolean;
  reviewFooter?: ReactNode;
}

export function VerificationCard({
  result,
  onOverrideField,
  onUpdateNotes,
  hideImage = false,
  reviewFooter,
}: VerificationCardProps) {
  const govWarningField = useMemo(
    () => result.fields.find((f) => f.fieldName === "governmentWarning"),
    [result.fields]
  );
  
  const otherFields = useMemo(
    () => result.fields.filter((f) => f.fieldName !== "governmentWarning"),
    [result.fields]
  );

  const detailsRef = useRef<HTMLDivElement>(null);

  // The page used to be the scroll container, which moved the label. On
  // desktop, send the wheel to the details pane instead — except over the
  // image, which uses the wheel to zoom.
  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;

    const workspace = (details.closest("[data-detail-workspace]") ??
      details.closest("[data-slot='card']")) as HTMLElement | null;
    if (!workspace) return;

    const onWheel = (event: WheelEvent) => {
      if (!window.matchMedia("(min-width: 1024px)").matches) return;
      if ((event.target as Element | null)?.closest("[data-label-image]")) return;

      event.preventDefault();
      details.scrollTop += event.deltaY;
    };

    workspace.addEventListener("wheel", onWheel, { passive: false });
    return () => workspace.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <Card className="flex h-full min-h-0 flex-1 flex-col overflow-hidden border border-border bg-card shadow-xl py-0 gap-0 ring-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-border bg-muted/40 shrink-0 rounded-t-[calc(var(--radius-xl)-1px)]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ScanSearch className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground truncate max-w-[200px] sm:max-w-[300px]">
              {result.fileName}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="capitalize">{result.beverageType}</span>
            <span>•</span>
            <span className="capitalize">Engine: {result.ocrEngine}</span>
            <span>•</span>
            <span>{new Date(result.timestamp).toLocaleString()}</span>
            <span>•</span>
            <TimeSaved 
              processingTimeMs={result.processingTimeMs} 
              timeSavedMs={result.timeSavedMs} 
              variant="inline"
            />
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5">
          <ApplicationStatusBadge result={result} />
          <ApprovedByLine result={result} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {!hideImage && result.imageDataUrl && (
          <div className="w-full lg:w-3/5 border-b lg:border-b-0 lg:border-r border-border bg-muted/30 p-5 flex flex-col min-h-[360px] lg:min-h-0 overflow-hidden">
            <LabelImageViewer src={result.imageDataUrl} fill />
          </div>
        )}

        <div className={`w-full ${hideImage ? "" : "lg:w-2/5"} min-h-0 flex flex-col`}>
          <div
            ref={detailsRef}
            className="p-5 space-y-6 min-h-0 flex-1 overflow-y-auto overscroll-contain custom-scrollbar"
          >
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Verification Details</h3>
              <div className="space-y-2">
                {otherFields.map((field) => (
                  <FieldCheckRow
                    key={field.fieldName}
                    field={field}
                    onOverride={onOverrideField ? () => onOverrideField(field.fieldName) : undefined}
                  />
                ))}
              </div>
            </div>

            {govWarningField && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Government Warning Check</h3>
                  {onOverrideField && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOverrideField("governmentWarning")}
                      className="h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                      title="Override result"
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      <span className="text-xs">Override</span>
                    </Button>
                  )}
                </div>
                <WarningDiffView extractedWarning={govWarningField.extractedValue} />
                {govWarningField.override && (
                  <p className="text-xs text-primary mt-2">
                    Overridden by {govWarningField.override.agentName}
                    {govWarningField.override.reason
                      ? `: "${govWarningField.override.reason}"`
                      : ""}
                  </p>
                )}
              </div>
            )}

            {onUpdateNotes && (
              <div className="pt-4 border-t border-border">
                <AgentNotes notes={result.agentNotes} onSave={onUpdateNotes} />
              </div>
            )}

            {!onUpdateNotes && result.agentNotes && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Agent Notes</h3>
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded border border-border whitespace-pre-wrap">
                  {result.agentNotes}
                </p>
              </div>
            )}
          </div>

          {reviewFooter && (
            <div className="shrink-0 border-t border-border bg-card p-4">
              {reviewFooter}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
