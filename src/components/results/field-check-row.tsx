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
      className={`rounded-lg border px-4 py-3 transition-colors space-y-2.5 ${
        field.override
          ? "border-indigo-500/30 bg-indigo-500/5"
          : field.status === "fail"
          ? "border-red-500/20 bg-red-500/5"
          : field.status === "warning"
          ? "border-amber-500/20 bg-amber-500/5"
          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30"
      }`}
    >
      {/* Header: title + meta actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-center gap-2 flex-wrap pt-0.5">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {field.displayName}
          </span>
          {field.required && (
            <span className="text-[10px] text-zinc-600 uppercase tracking-wide">
              required
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ConfidenceBar confidence={field.confidence} />
          <StatusBadge status={field.status} overridden={!!field.override} />
          {onOverride && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOverride}
              className="h-7 gap-1.5 px-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              title="Override result"
            >
              <PenLine className="h-3.5 w-3.5" />
              <span className="text-xs">Override</span>
            </Button>
          )}
        </div>
      </div>

      {/* Body: full-width values and notes */}
      <div className="space-y-1.5">
        <div className="text-sm leading-relaxed">
          <span className="text-zinc-500 text-xs">Extracted: </span>
          <span
            className={
              field.extractedValue ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 italic dark:text-zinc-600"
            }
          >
            {field.extractedValue
              ? field.fieldName === "governmentWarning"
                ? field.extractedValue.substring(0, 80) +
                  (field.extractedValue.length > 80 ? "..." : "")
                : field.extractedValue
              : "Not found"}
          </span>
        </div>

        {field.expectedValue && (
          <div className="text-sm leading-relaxed">
            <span className="text-zinc-500 text-xs">Expected: </span>
            <span className="text-zinc-500 dark:text-zinc-400">{field.expectedValue}</span>
          </div>
        )}

        {field.notes && (
          <p className="text-xs text-zinc-500 leading-relaxed">{field.notes}</p>
        )}

        {field.override && (
          <div className="text-xs text-indigo-400 flex items-center gap-1 pt-0.5">
            <PenLine className="h-3 w-3 shrink-0" />
            <span>
              Overridden by {field.override.agentName}
              {field.override.reason ? `: "${field.override.reason}"` : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
