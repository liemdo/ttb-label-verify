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
      
      // Check quality for first file in single mode, or all in batch (might be slow, maybe just first few)
      const filesToCheck = isBatchMode ? acceptedFiles.slice(0, 5) : acceptedFiles;
      
      for (const file of filesToCheck) {
        const report = await checkImageQuality(file);
        qualityReports[file.name] = report;
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
            ? "bg-zinc-900/50 border-zinc-800 opacity-60 cursor-not-allowed"
            : isDragReject
            ? "bg-red-500/10 border-red-500"
            : isDragActive
            ? "bg-blue-500/10 border-blue-500"
            : "bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800/50 hover:border-zinc-500"
        }`}
      >
        <input {...getInputProps()} />

        <div
          className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
            isDragReject
              ? "bg-red-500/20 text-red-400"
              : isDragActive
              ? "bg-blue-500/20 text-blue-400"
              : "bg-zinc-800 text-zinc-400"
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

        <h3 className="text-lg font-semibold text-zinc-200 mb-1">
          {isDragActive ? "Drop labels here" : "Upload Label Images"}
        </h3>
        
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          {isBatchMode
            ? `Drag & drop up to ${MAX_BATCH_SIZE} images, or click to browse.`
            : "Drag & drop a single label image, or click to browse."}
        </p>
        
        <p className="text-xs text-zinc-500 mt-4">
          Supported: JPG, PNG, WEBP (Max {MAX_IMAGE_SIZE_MB}MB per file)
        </p>

        {isDragActive && !isDragReject && (
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse rounded-xl" />
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
