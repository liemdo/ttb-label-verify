"use client";

import { useState } from "react";
import { FileImage, X, AlertCircle } from "lucide-react";
import type { ImageQualityReport } from "@/types";

interface BatchUploadListProps {
  files: File[];
  qualityReports: Record<string, ImageQualityReport>;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function BatchUploadList({
  files,
  qualityReports,
  onRemove,
  disabled,
}: BatchUploadListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {files.map((file, index) => {
        const report = qualityReports[file.name];
        const hasWarning = report && (report.isLowResolution || report.warnings.length > 0);

        return (
          <div
            key={`${file.name}-${index}`}
            className={`flex items-center gap-3 p-3 rounded-lg border bg-zinc-50 dark:bg-zinc-900/50 ${
              hasWarning ? "border-amber-500/30" : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <div
              className={`h-10 w-10 shrink-0 rounded flex items-center justify-center ${
                hasWarning ? "bg-amber-500/10" : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              <FileImage
                className={`h-5 w-5 ${
                  hasWarning ? "text-amber-400" : "text-zinc-500 dark:text-zinc-400"
                }`}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                {file.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-zinc-500">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
                {hasWarning && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
                    <AlertCircle className="h-3 w-3" />
                    Low Quality
                  </span>
                )}
              </div>
            </div>

            {!disabled && (
              <button
                onClick={() => onRemove(index)}
                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
