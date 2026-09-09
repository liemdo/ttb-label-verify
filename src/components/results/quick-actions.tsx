"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuickActionsProps {
  allPassed: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function QuickActions({ allPassed, onApprove, onReject }: QuickActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={onApprove}
        className={`${
          allPassed
            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        } gap-2`}
        size="lg"
      >
        <CheckCircle2 className="h-4 w-4" />
        Approve
        <kbd className="ml-1 text-xs opacity-60 font-mono">A</kbd>
      </Button>
      <Button
        onClick={onReject}
        variant="outline"
        className="border-red-500/40 text-red-400 hover:bg-red-500/10 gap-2"
        size="lg"
      >
        <XCircle className="h-4 w-4" />
        Reject
        <kbd className="ml-1 text-xs opacity-60 font-mono">R</kbd>
      </Button>
    </div>
  );
}
