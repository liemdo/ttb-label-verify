"use client";

import { useMemo } from "react";
import type { VerificationResult } from "@/types";
import { VerdictBadge } from "@/components/shared/status-badge";
import { TimeSaved } from "@/components/results/time-saved";
import { Card } from "@/components/ui/card";
import { ScanSearch } from "lucide-react";
import { FieldCheckRow } from "@/components/results/field-check-row";
import { WarningDiffView } from "@/components/results/warning-diff-view";
import { AgentNotes } from "@/components/results/agent-notes";

interface VerificationCardProps {
  result: VerificationResult;
  onOverrideField?: (fieldName: string) => void;
  onUpdateNotes?: (notes: string) => void;
  hideImage?: boolean;
}

export function VerificationCard({
  result,
  onOverrideField,
  onUpdateNotes,
  hideImage = false,
}: VerificationCardProps) {
  const govWarningField = useMemo(
    () => result.fields.find((f) => f.fieldName === "governmentWarning"),
    [result.fields]
  );
  
  const otherFields = useMemo(
    () => result.fields.filter((f) => f.fieldName !== "governmentWarning"),
    [result.fields]
  );

  return (
    <Card className="overflow-hidden border-zinc-800 bg-zinc-950 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-zinc-800 bg-zinc-900/30">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ScanSearch className="h-5 w-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100 truncate">
              {result.fileName}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
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
        <div className="shrink-0">
          <VerdictBadge verdict={result.overallVerdict} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left column: Image */}
        {!hideImage && result.imageDataUrl && (
          <div className="w-full lg:w-2/5 border-r border-zinc-800 bg-zinc-900/20 p-5 flex flex-col">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Label Image</h3>
            <div className="flex-1 relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.imageDataUrl}
                alt="Analyzed label"
                className="absolute inset-0 w-full h-full object-contain p-2"
              />
            </div>
          </div>
        )}

        {/* Right column: Fields */}
        <div className={`w-full ${hideImage ? "" : "lg:w-3/5"} p-5 space-y-6`}>
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Verification Details</h3>
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

          {/* Special Gov Warning Section */}
          {govWarningField && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-zinc-400">Government Warning Check</h3>
                {onOverrideField && (
                  <button
                    onClick={() => onOverrideField("governmentWarning")}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Override Result
                  </button>
                )}
              </div>
              <WarningDiffView extractedWarning={govWarningField.extractedValue} />
              {govWarningField.override && (
                <p className="text-xs text-indigo-400 mt-2">
                  Overridden by {govWarningField.override.agentName}: &quot;{govWarningField.override.reason}&quot;
                </p>
              )}
            </div>
          )}

          {/* Agent Notes */}
          {onUpdateNotes && (
            <div className="pt-4 border-t border-zinc-800">
              <AgentNotes notes={result.agentNotes} onSave={onUpdateNotes} />
            </div>
          )}
          
          {!onUpdateNotes && result.agentNotes && (
            <div className="pt-4 border-t border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Agent Notes</h3>
              <p className="text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded border border-zinc-800 whitespace-pre-wrap">
                {result.agentNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
