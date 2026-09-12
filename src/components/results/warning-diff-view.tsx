"use client";

import { GOVERNMENT_WARNING_TEXT } from "@/lib/constants";
import { computeDiff } from "@/lib/diff";
import type { DiffSegment } from "@/types";

interface WarningDiffViewProps {
  extractedWarning: string | null;
}

export function WarningDiffView({ extractedWarning }: WarningDiffViewProps) {
  if (!extractedWarning) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
        <p className="text-sm font-medium text-red-400 mb-2">
          Government Warning Not Found
        </p>
        <p className="text-xs text-zinc-500">
          The mandatory government warning statement was not detected on this label.
        </p>
        <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 mb-1">Required text:</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {GOVERNMENT_WARNING_TEXT}
          </p>
        </div>
      </div>
    );
  }

  const segments = computeDiff(GOVERNMENT_WARNING_TEXT, extractedWarning);
  const isExactMatch = segments.length === 1 && segments[0].type === "equal";

  return (
    <div
      className={`rounded-lg border p-4 ${
        isExactMatch
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-red-500/30 bg-red-500/5"
      }`}
    >
      <p className={`text-sm font-medium mb-3 ${isExactMatch ? "text-emerald-400" : "text-red-400"}`}>
        {isExactMatch
          ? "✓ Government Warning Matches Exactly"
          : "✗ Government Warning Differences Detected"}
      </p>

      {!isExactMatch && (
        <>
          <div className="flex gap-4 text-[10px] text-zinc-500 mb-2">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-red-500/30 border border-red-500/50" />
              Expected (missing)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
              Found on label (extra)
            </span>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 text-sm leading-relaxed">
            {segments.map((seg: DiffSegment, i: number) => (
              <span
                key={i}
                className={
                  seg.type === "removed"
                    ? "bg-red-500/20 text-red-300 line-through"
                    : seg.type === "added"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-zinc-700 dark:text-zinc-300"
                }
              >
                {seg.text}
              </span>
            ))}
          </div>
        </>
      )}

      {isExactMatch && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
          {GOVERNMENT_WARNING_TEXT}
        </p>
      )}
    </div>
  );
}
