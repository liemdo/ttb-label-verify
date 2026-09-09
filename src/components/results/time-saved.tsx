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

  if (variant === "card") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <Zap className="h-4 w-4 text-emerald-400" />
        <span className="text-sm text-emerald-300">
          Processed in <strong>{processingSeconds}s</strong> — est.{" "}
          <strong>
            {savedMinutes}m {savedSeconds}s
          </strong>{" "}
          saved vs manual review
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
      <Clock className="h-3 w-3" />
      <span>{processingSeconds}s</span>
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
}

export function TotalTimeSaved({ totalMs }: TotalTimeSavedProps) {
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.round((totalMs % 3600000) / 60000);

  return (
    <div className="text-sm">
      <span className="text-zinc-400">Total estimated time saved: </span>
      <span className="text-emerald-400 font-semibold">
        {hours > 0 ? `${hours}h ` : ""}
        {minutes}m
      </span>
    </div>
  );
}
