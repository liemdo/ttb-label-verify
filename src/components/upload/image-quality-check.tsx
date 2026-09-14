"use client";

import { AlertTriangle, Info } from "lucide-react";
import type { ImageQualityReport } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImageQualityCheckProps {
  report: ImageQualityReport;
}

export function ImageQualityCheck({ report }: ImageQualityCheckProps) {
  if (report.warnings.length === 0) return null;

  return (
    <Alert
      className={`${
        report.isLowResolution
          ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
          : "bg-primary/10 border-primary/20 text-primary"
      }`}
    >
      {report.isLowResolution ? (
        <AlertTriangle className={`h-4 w-4 ${report.isLowResolution ? "text-amber-400" : "text-primary"}`} />
      ) : (
        <Info className="h-4 w-4 text-primary" />
      )}
      <AlertTitle className={report.isLowResolution ? "text-amber-400" : "text-primary"}>
        Image Quality Notice
      </AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1 mt-1 text-xs opacity-80">
          {report.warnings.map((warning, i) => (
            <li key={i}>{warning}</li>
          ))}
        </ul>
        {report.isLowResolution && (
          <p className="mt-2 text-xs font-medium">
            AI results may be less accurate. Consider uploading a higher resolution image if verification fails.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
