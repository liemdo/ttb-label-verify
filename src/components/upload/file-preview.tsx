"use client";

import { useState } from "react";
import { ZoomIn, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface FilePreviewProps {
  file: File;
  onClear: () => void;
  disabled?: boolean;
}

export function FilePreview({ file, onClear, disabled }: FilePreviewProps) {
  const [url] = useState(() => URL.createObjectURL(file));
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="aspect-[4/3] w-full flex items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={file.name}
            className="max-h-full max-w-full object-contain drop-shadow-md rounded"
          />
        </div>
        
        {/* Overlay controls */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 rounded-full bg-zinc-50 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors backdrop-blur-sm"
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
        
        {/* File info footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md p-2.5 border-t border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate pr-4">
            {file.name}
          </span>
          <span className="text-[10px] text-zinc-500 shrink-0">
            {(file.size / (1024 * 1024)).toFixed(1)} MB
          </span>
        </div>
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-5xl w-[90vw] h-[90vh] p-0 bg-transparent border-none shadow-none flex flex-col">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-full bg-zinc-50 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors backdrop-blur-sm border border-zinc-300 dark:border-zinc-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center p-4 pt-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={file.name}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
