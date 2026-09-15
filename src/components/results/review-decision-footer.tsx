"use client";

import { Button } from "@/components/ui/button";
import { isPending, unresolvedReviewFields } from "@/lib/application-status";
import type { ApplicationStatus, VerificationResult } from "@/types";
import { CheckCircle2, XCircle } from "lucide-react";

interface ReviewDecisionFooterProps {
  result: VerificationResult;
  onDecide: (decision: Exclude<ApplicationStatus, "pending">) => void;
  isDeciding: Exclude<ApplicationStatus, "pending"> | null;
}

export function ReviewDecisionFooter({
  result,
  onDecide,
  isDeciding,
}: ReviewDecisionFooterProps) {
  if (!isPending(result)) return null;

  const blockingFields = unresolvedReviewFields(result.fields);
  const canApprove = blockingFields.length === 0;

  return (
    <div className="flex flex-col gap-3">
      {canApprove ? (
        <p className="text-sm text-foreground">
          All checked fields pass. This application can be approved.
        </p>
      ) : (
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {blockingFields.length}{" "}
            {blockingFields.length === 1 ? "field needs" : "fields need"}{" "}
            to be resolved to approve
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {blockingFields.map((field) => field.displayName).join(", ")}
          </p>
        </div>
      )}
      <Button
        type="button"
        onClick={() => onDecide(canApprove ? "approved" : "rejected")}
        disabled={isDeciding !== null}
        className={
          canApprove
            ? "bg-emerald-600 hover:bg-emerald-700 text-white gap-2 w-full"
            : "bg-red-600 hover:bg-red-700 text-white gap-2 w-full"
        }
      >
        {canApprove ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        {isDeciding
          ? canApprove
            ? "Approving..."
            : "Rejecting..."
          : canApprove
            ? "Approve"
            : "Reject"}
      </Button>
    </div>
  );
}
