"use client";

import { Clock, Zap } from "lucide-react";

interface TimeSavedProps {
  processingTimeMs: number;
  timeSavedMs?: number;
  variant?: "inline" | "card";
}

export function TimeSaved({ processingTimeMs, timeSavedMs, variant = "inline" }: TimeSavedProps) {
  const processingSeconds = (processingTimeMs / 1000).toFixed(1);
  const savedMinutes = timeSavedMs ? Math.floor(timeSavedMs / 60000) : 6;
  const savedSeconds = timeSavedMs ? Math.round((timeSavedMs % 60000) / 1000) : 55;

  const overSla = processingTimeMs > 5000;

  if (variant === "card") {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
        overSla
          ? "bg-amber-500/10 border-amber-500/20"
          : "bg-emerald-500/10 border-emerald-500/20"
      }`}>
        <Zap className={`h-4 w-4 ${overSla ? "text-amber-400" : "text-emerald-400"}`} />
        <span className={`text-sm ${overSla ? "text-amber-300" : "text-emerald-300"}`}>
          Processed in <strong>{processingSeconds}s</strong>
          {overSla ? " (over the 5s target)" : ""} — est.{" "}
          <strong>
            {savedMinutes}m {savedSeconds}s
          </strong>{" "}
          saved vs manual review
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>{processingSeconds}s</span>
      {overSla && <span className="text-amber-500">over 5s target</span>}
      {timeSavedMs && timeSavedMs > 0 && (
        <span className="text-emerald-500">
          (~{savedMinutes}m saved)
        </span>
      )}
    </div>
  );
}

interface TotalTimeSavedProps {
  totalMs: number;
  labelCount?: number;
  todayMs?: number;
  variant?: "inline" | "banner";
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.round((ms % 3600000) / 60000);
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

export function TotalTimeSaved({
  totalMs,
  labelCount,
  todayMs,
  variant = "inline",
}: TotalTimeSavedProps) {
  const formatted = formatDuration(totalMs);

  if (variant === "banner") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
        <div>
          <p className="text-xs uppercase tracking-wider text-emerald-500/80 font-medium mb-1">
            Estimated time saved vs manual review
          </p>
          <p className="text-2xl font-bold text-emerald-400">{formatted}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Based on a 7-minute manual review baseline
            {labelCount != null && labelCount > 0
              ? ` across ${labelCount} label${labelCount === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>
        {todayMs != null && todayMs > 0 && (
          <div className="sm:text-right shrink-0">
            <p className="text-xs text-muted-foreground">Saved today</p>
            <p className="text-lg font-semibold text-emerald-300">
              {formatDuration(todayMs)}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-sm">
      <span className="text-muted-foreground">Total estimated time saved: </span>
      <span className="text-emerald-400 font-semibold">{formatted}</span>
    </div>
  );
}
