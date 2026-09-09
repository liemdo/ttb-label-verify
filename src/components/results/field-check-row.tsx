"use client";

import type { LabelField } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfidenceBar } from "@/components/results/confidence-bar";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";

interface FieldCheckRowProps {
  field: LabelField;
  onOverride?: () => void;
}

export function FieldCheckRow({ field, onOverride }: FieldCheckRowProps) {
  return (
    <div
      className={`flex items-start gap-4 px-4 py-3 rounded-lg border transition-colors ${
        field.override
          ? "border-indigo-500/30 bg-indigo-500/5"
          : field.status === "fail"
          ? "border-red-500/20 bg-red-500/5"
          : field.status === "warning"
          ? "border-amber-500/20 bg-amber-500/5"
          : "border-zinc-800 bg-zinc-900/30"
      }`}
    >
      {/* Field info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-200">
            {field.displayName}
          </span>
          {field.required && (
            <span className="text-[10px] text-zinc-600 uppercase">required</span>
          )}
        </div>

        {/* Extracted value */}
        <div className="text-sm">
          <span className="text-zinc-500 text-xs">Extracted: </span>
          <span className={`${field.extractedValue ? "text-zinc-300" : "text-zinc-600 italic"}`}>
            {field.extractedValue
              ? field.fieldName === "governmentWarning"
                ? field.extractedValue.substring(0, 80) + (field.extractedValue.length > 80 ? "..." : "")
                : field.extractedValue
              : "Not found"}
          </span>
        </div>

        {/* Expected value */}
        {field.expectedValue && (
          <div className="text-sm">
            <span className="text-zinc-500 text-xs">Expected: </span>
            <span className="text-zinc-400">{field.expectedValue}</span>
          </div>
        )}

        {/* Notes */}
        {field.notes && (
          <p className="text-xs text-zinc-500 mt-1">{field.notes}</p>
        )}

        {/* Override info */}
        {field.override && (
          <div className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
            <PenLine className="h-3 w-3" />
            Overridden by {field.override.agentName}: &quot;{field.override.reason}&quot;
          </div>
        )}
      </div>

      {/* Right side: confidence + status + override button */}
      <div className="flex items-center gap-3 shrink-0">
        <ConfidenceBar confidence={field.confidence} />
        <StatusBadge status={field.status} overridden={!!field.override} />
        {onOverride && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOverride}
            className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-300"
            title="Override result"
          >
            <PenLine className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
