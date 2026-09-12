"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ message = "Processing...", size = "md" }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2 className={`${sizeClass} animate-spin text-blue-400`} />
      {message && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">{message}</p>
      )}
    </div>
  );
}
