"use client";

interface ConfidenceBarProps {
  confidence: number;
}

export function ConfidenceBar({ confidence }: ConfidenceBarProps) {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 80
      ? "bg-emerald-500"
      : pct >= 50
      ? "bg-amber-500"
      : "bg-red-500";
  const textColor =
    pct >= 80
      ? "text-emerald-400"
      : pct >= 50
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="flex items-center gap-1.5 min-w-[60px]" title={`Confidence: ${pct}%`}>
      <div className="w-10 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] font-mono ${textColor}`}>{pct}%</span>
    </div>
  );
}
