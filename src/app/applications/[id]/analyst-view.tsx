"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VerificationCard } from "@/components/results/verification-card";
import { OverrideDialog } from "@/components/results/override-dialog";
import { Button } from "@/components/ui/button";
import {
  updateNotesAction,
  updateFieldsAction,
  decideApplicationAction,
} from "@/actions/results";
import { useResults } from "@/context/results-context";
import { useAuth } from "@/context/auth-context";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { CompanyInfoDialog } from "@/components/results/company-info-dialog";
import { isPending, unresolvedReviewFields } from "@/lib/application-status";
import type { ApplicationStatus, FieldOverride, VerificationResult } from "@/types";
import { Building2, CheckCircle2, Trash2, XCircle } from "lucide-react";

export function AnalystView({ initialResult }: { initialResult: VerificationResult }) {
  const router = useRouter();
  const { agent } = useAuth();
  const { deleteResult } = useResults();
  const [result, setResult] = useState(initialResult);
  const [overrideField, setOverrideField] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeciding, setIsDeciding] = useState<Exclude<ApplicationStatus, "pending"> | null>(null);

  const handleUpdateNotes = async (notes: string) => {
    try {
      await updateNotesAction(result.id, notes);
      setResult((prev) => ({ ...prev, agentNotes: notes }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOverrideSubmit = async (override: FieldOverride) => {
    const newFields = result.fields.map((f) => {
      if (f.fieldName === override.fieldName) {
        return { ...f, status: override.overriddenStatus, override };
      }
      return f;
    });

    try {
      await updateFieldsAction(result.id, newFields);
      setResult((prev) => ({
        ...prev,
        fields: newFields,
      }));
      setOverrideField(null);
    } catch (err) {
      console.error(err);
      alert("Failed to override field. Please try again.");
    }
  };

  const handleDecide = async (decision: Exclude<ApplicationStatus, "pending">) => {
    if (!agent) return;

    setIsDeciding(decision);
    try {
      await decideApplicationAction(result.id, decision, {
        agentId: agent.id,
        agentName: agent.name,
      });
      setResult((prev) => ({
        ...prev,
        overallVerdict: decision,
        reviewStatus: "reviewed",
        agentId: agent.id,
        agentName: agent.name,
      }));
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${decision === "approved" ? "approve" : "reject"} this application. Please try again.`);
    } finally {
      setIsDeciding(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteResult(result.id);
      setShowDeleteDialog(false);
      router.push("/applications");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete application. Please try again.");
      setIsDeleting(false);
    }
  };

  const blockingFields = unresolvedReviewFields(result.fields);
  const canApprove = blockingFields.length === 0;
  const activeField = result.fields.find((f) => f.fieldName === overrideField);

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 rounded-lg border border-border bg-card p-4 shrink-0">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Submitting Company</p>
          </div>
          <CompanyInfoDialog
            companyName={result.companyName}
            submittedByName={result.submittedByName}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isDeleting}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2 shrink-0"
        >
          <Trash2 className="h-4 w-4" />
          Delete Application
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <VerificationCard
          result={result}
          onUpdateNotes={handleUpdateNotes}
          onOverrideField={setOverrideField}
          reviewFooter={
            isPending(result) ? (
              <div className="flex flex-col gap-3">
                {canApprove ? (
                  <p className="text-sm text-foreground">
                    All fields pass. This application can be approved.
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
                  onClick={() => handleDecide(canApprove ? "approved" : "rejected")}
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
            ) : undefined
          }
        />
      </div>

      {activeField && (
        <OverrideDialog
          open={!!overrideField}
          onOpenChange={(open) => !open && setOverrideField(null)}
          fieldName={activeField.fieldName}
          fieldDisplayName={activeField.displayName}
          currentStatus={activeField.status}
          onSubmit={handleOverrideSubmit}
        />
      )}

      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        description={`This will permanently delete "${result.fileName}" from ${result.companyName}. This action cannot be undone.`}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
