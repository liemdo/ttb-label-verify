"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_MB, MAX_BATCH_SIZE } from "@/lib/constants";
import { checkImageQuality } from "@/lib/image-quality";
import type { ImageQualityReport } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DropzoneProps {
  onFilesSelected: (files: File[], qualityReports: Record<string, ImageQualityReport>) => void;
  isBatchMode: boolean;
  disabled?: boolean;
}

export function Dropzone({ onFilesSelected, isBatchMode, disabled }: DropzoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: any[]) => {
      setError(null);

      if (fileRejections.length > 0) {
        const errorMsg = fileRejections[0].errors[0]?.message || "Invalid file.";
        setError(`Failed to accept some files: ${errorMsg}`);
        return;
      }

      if (!isBatchMode && acceptedFiles.length > 1) {
        setError("Only one file allowed in single mode. Switch to Batch Mode to upload multiple.");
        return;
      }

      if (acceptedFiles.length > MAX_BATCH_SIZE) {
        setError(`Maximum ${MAX_BATCH_SIZE} files allowed per batch.`);
        return;
      }

      const qualityReports: Record<string, ImageQualityReport> = {};
      const chunkSize = 10;
      for (let i = 0; i < acceptedFiles.length; i += chunkSize) {
        const chunk = acceptedFiles.slice(i, i + chunkSize);
        const reports = await Promise.all(
          chunk.map(async (file) => {
            const report = await checkImageQuality(file);
            return [file.name, report] as const;
          })
        );
        for (const [name, report] of reports) {
          qualityReports[name] = report;
        }
      }

      onFilesSelected(acceptedFiles, qualityReports);
    },
    [isBatchMode, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_IMAGE_SIZE_BYTES,
    multiple: isBatchMode,
    disabled,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all p-10 flex flex-col items-center justify-center min-h-[250px] text-center cursor-pointer ${
          disabled
            ? "bg-muted/50 border-border opacity-60 cursor-not-allowed"
            : isDragReject
            ? "bg-red-500/10 border-red-500"
            : isDragActive
            ? "bg-primary/10 border-primary"
            : "bg-muted/50 border-border hover:bg-accent/50 hover:border-ring"
        }`}
      >
        <input {...getInputProps()} />

        <div
          className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
            isDragReject
              ? "bg-red-500/20 text-red-400"
              : isDragActive
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isDragReject ? (
            <X className="h-8 w-8" />
          ) : isDragActive ? (
            <UploadCloud className="h-8 w-8" />
          ) : (
            <ImageIcon className="h-8 w-8" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1">
          {isDragActive ? "Drop labels here" : "Upload Label Images"}
        </h3>
        
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {isBatchMode
            ? `Drag & drop up to ${MAX_BATCH_SIZE} images, or click to browse.`
            : "Drag & drop a single label image, or click to browse."}
        </p>
        
        <p className="text-xs text-muted-foreground mt-4">
          Supported: JPG, PNG, WEBP (Max {MAX_IMAGE_SIZE_MB}MB per file)
        </p>

        {isDragActive && !isDragReject && (
          <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-xl" />
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-400">Upload Error</AlertTitle>
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
