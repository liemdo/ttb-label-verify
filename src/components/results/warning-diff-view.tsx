"use client";

import { GOVERNMENT_WARNING_TEXT } from "@/lib/constants";
import { computeDiff } from "@/lib/diff";
import { validateGovernmentWarning } from "@/lib/validators";
import type { DiffSegment, VerificationStatus } from "@/types";

interface WarningDiffViewProps {
  extractedWarning: string | null;
  /** Field status from verification — keeps this panel in sync with Approve. */
  status?: VerificationStatus;
}

export function WarningDiffView({ extractedWarning, status }: WarningDiffViewProps) {
  if (!extractedWarning) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
        <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
          Government Warning Not Found
        </p>
        <p className="text-xs text-muted-foreground">
          The mandatory government warning statement was not detected on this label.
        </p>
        <div className="mt-3 p-3 bg-muted rounded border border-border">
          <p className="text-xs text-muted-foreground mb-1">Required text:</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {GOVERNMENT_WARNING_TEXT}
          </p>
        </div>
      </div>
    );
  }

  const validation = validateGovernmentWarning(extractedWarning);
  const isMatch = status === "pass" || validation.status === "pass";

  return (
    <div
      className={`rounded-lg border p-4 ${
        isMatch
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-red-500/30 bg-red-500/5"
      }`}
    >
      <p className={`text-sm font-medium mb-3 ${isMatch ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"}`}>
        {isMatch
          ? "✓ Government Warning Matches"
          : "✗ Government Warning Differences Detected"}
      </p>

      {isMatch ? (
        <>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            TTB requires &ldquo;GOVERNMENT WARNING:&rdquo; in all caps. The rest of the
            mandated wording must match and be legible — mixed case or all caps
            are both acceptable. Bold type and contrast are a visual check.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed p-3 bg-muted rounded border border-border">
            {extractedWarning}
          </p>
        </>
      ) : (
        <>
          <div className="flex gap-4 text-[10px] text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-red-200 border border-red-800 dark:bg-red-900/70 dark:border-red-400" />
              Expected (missing)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-emerald-200 border border-emerald-800 dark:bg-emerald-900/70 dark:border-emerald-400" />
              Found on label (extra)
            </span>
          </div>

          <div className="p-3 bg-muted rounded border border-border text-sm leading-relaxed wrap-anywhere">
            {computeDiff(GOVERNMENT_WARNING_TEXT, extractedWarning).map((seg: DiffSegment, i: number) => (
              <span
                key={i}
                className={
                  seg.type === "removed"
                    ? "bg-red-200 text-red-900 dark:bg-red-900/70 dark:text-red-200 line-through"
                    : seg.type === "added"
                    ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/70 dark:text-emerald-200"
                    : "text-foreground"
                }
              >
                {seg.text}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
