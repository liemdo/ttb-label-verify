"use client";

import { useState } from "react";
import { ZoomIn, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LabelImageViewer } from "@/components/results/label-image-viewer";

interface FilePreviewProps {
  file: File;
  onClear: () => void;
  disabled?: boolean;
  scanning?: boolean;
}

export function FilePreview({ file, onClear, disabled, scanning = false }: FilePreviewProps) {
  const [url] = useState(() => URL.createObjectURL(file));
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/50">
        <div className="aspect-[4/3] w-full flex items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={file.name}
            className="max-h-full max-w-full object-contain drop-shadow-md rounded"
          />
        </div>

        {scanning ? (
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="absolute inset-0 bg-primary/8" />
            <div className="label-scan-beam" />
            <div className="absolute inset-x-0 bottom-12 flex justify-center">
              <span className="rounded-full border border-border bg-card/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
                Scanning label…
              </span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 rounded-full bg-card/80 text-foreground hover:bg-accent transition-colors backdrop-blur-sm"
              title="Zoom image"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            {!disabled && (
              <button
                onClick={onClear}
                className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors backdrop-blur-sm"
                title="Remove image"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        
        {/* File info footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md p-2.5 border-t border-border/50 flex items-center justify-between">
          <span className="text-xs font-medium text-foreground truncate pr-4">
            {file.name}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {(file.size / (1024 * 1024)).toFixed(1)} MB
          </span>
        </div>
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="flex h-[90vh] w-[90vw] max-w-5xl flex-col gap-0 p-4 sm:max-w-5xl">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          <div className="flex min-h-0 flex-1 flex-col pr-8">
            <LabelImageViewer src={url} alt={file.name} fill hideTitle />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
