"use client";

import { useState } from "react";
import type { VerificationResult } from "@/types";
import { VerdictBadge } from "@/components/shared/status-badge";
import { VerificationCard } from "./verification-card";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BatchResultsProps {
  results: VerificationResult[];
}

export function BatchResults({ results }: BatchResultsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (results.length === 0) return null;

  const approved = results.filter((r) => r.overallVerdict === "approved").length;
  const rejected = results.filter((r) => r.overallVerdict === "rejected").length;
  const needsReview = results.filter((r) => r.overallVerdict === "needs_review").length;
  const totalTime = results.reduce((sum, r) => sum + r.processingTimeMs, 0);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleExportCsv = () => {
    const headers = ["File", "Verdict", "Beverage Type", "Time(s)", "Timestamp"];
    const rows = results.map(r => [
      r.fileName,
      r.overallVerdict,
      r.beverageType,
      (r.processingTimeMs / 1000).toFixed(2),
      new Date(r.timestamp).toISOString()
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `batch-results-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="text-zinc-800 dark:text-zinc-200">{results.length} Processed</span>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-emerald-400">{approved} Approved</span>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-red-400">{rejected} Rejected</span>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-amber-400">{needsReview} Need Review</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500">
            Total processing time: {(totalTime / 1000).toFixed(1)}s
          </span>
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="border-zinc-300 dark:border-zinc-700 h-8 gap-2">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {results.map((result) => (
          <div key={result.id} className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 overflow-hidden transition-all">
            {/* Row header */}
            <div
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              onClick={() => toggleExpand(result.id)}
            >
              <div className="flex items-center gap-3">
                <button className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                  {expandedId === result.id ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
                <div className="h-8 w-8 rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.imageDataUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{result.fileName}</p>
                  <p className="text-xs text-zinc-500 capitalize">{result.beverageType}</p>
                </div>
              </div>
              <VerdictBadge verdict={result.overallVerdict} />
            </div>

            {/* Expanded content */}
            {expandedId === result.id && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <VerificationCard result={result} hideImage />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
