"use client";

import { useState } from "react";
import Link from "next/link";
import type { VerificationResult } from "@/types";
import { ApplicationStatusBadge, ApprovedByLine } from "@/components/shared/status-badge";
import { BATCH_CONCURRENCY } from "@/lib/constants";
import { applicationStatus } from "@/lib/application-status";
import { labelImageSrc } from "@/lib/blob";
import { VerificationCard } from "./verification-card";
import { AlertTriangle, ChevronDown, ChevronRight, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BatchFileError {
  fileName: string;
  message: string;
}

interface BatchResultsProps {
  results: VerificationResult[];
  errors?: BatchFileError[];
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function BatchResults({ results, errors = [] }: BatchResultsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (results.length === 0 && errors.length === 0) return null;

  const approved = results.filter((r) => applicationStatus(r) === "approved").length;
  const rejected = results.filter((r) => applicationStatus(r) === "rejected").length;
  const pending = results.filter((r) => applicationStatus(r) === "pending").length;
  const totalTime = results.reduce((sum, r) => sum + r.processingTimeMs, 0);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleExportCsv = () => {
    const headers = ["File", "Status", "Beverage Type", "Time(s)", "Timestamp", "Error"];
    const successRows = results.map((r) => [
      csvCell(r.fileName),
      applicationStatus(r),
      r.beverageType,
      (r.processingTimeMs / 1000).toFixed(2),
      new Date(r.timestamp).toISOString(),
      "",
    ]);
    const errorRows = errors.map((e) => [
      csvCell(e.fileName),
      "failed",
      "",
      "",
      "",
      csvCell(e.message),
    ]);

    const csvContent = [headers.join(","), ...successRows.map((row) => row.join(",")), ...errorRows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-muted/50">
        <div className="flex items-center gap-4 text-sm font-medium flex-wrap">
          <span className="text-foreground">{results.length} Processed</span>
          {errors.length > 0 && (
            <>
              <div className="h-4 w-px bg-border" />
              <span className="text-red-400">{errors.length} Failed</span>
            </>
          )}
          <div className="h-4 w-px bg-border" />
          <span className="text-emerald-400">{approved} Approved</span>
          <div className="h-4 w-px bg-border" />
          <span className="text-red-400">{rejected} Rejected</span>
          <div className="h-4 w-px bg-border" />
          <span className="text-blue-400">{pending} Pending review</span>
        </div>
        <div className="flex items-center gap-4">
          {results.length > 0 && (
            <span className="text-xs text-muted-foreground">
              Combined processing time: {(totalTime / 1000).toFixed(1)}s (up to {BATCH_CONCURRENCY} at a time)
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="border-border h-8 gap-2">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-2">
          <p className="text-sm font-medium text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {errors.length === 1 ? "1 file failed" : `${errors.length} files failed`}
          </p>
          <ul className="space-y-1.5">
            {errors.map((item) => (
              <li key={item.fileName} className="text-sm text-red-300/90">
                <span className="font-medium text-foreground">{item.fileName}</span>
                <span className="text-muted-foreground"> — {item.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        {results.map((result) => (
          <div key={result.id} className="border border-border rounded-lg bg-card overflow-hidden transition-all">
            <div
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors gap-3"
              onClick={() => toggleExpand(result.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button type="button" className="text-muted-foreground hover:text-foreground">
                  {expandedId === result.id ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
                <div className="h-8 w-8 rounded bg-muted overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={labelImageSrc(result.imageDataUrl)} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{result.fileName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{result.beverageType}</p>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <ApplicationStatusBadge result={result} />
                <ApprovedByLine result={result} />
                <Link
                  href={`/applications/${result.id}`}
                  onClick={(event) => event.stopPropagation()}
                  className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                >
                  Open full review
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {expandedId === result.id && (
              <div className="p-4 border-t border-border bg-card">
                <VerificationCard result={result} hideImage />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
