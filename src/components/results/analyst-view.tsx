"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VerificationCard } from "@/components/results/verification-card";
import { OverrideDialog } from "@/components/results/override-dialog";
import { ReviewDecisionFooter } from "@/components/results/review-decision-footer";
import { Button } from "@/components/ui/button";
import {
  updateNotesAction,
  updateFieldsAction,
  decideApplicationAction,
} from "@/actions/results";
import { useResults } from "@/context/results-context";
import { useAuth } from "@/context/auth-context";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { CompanyInfoDialog } from "@/components/results/company-info-dialog";
import { unresolvedReviewFields, submissionAttribution, applicationStatus } from "@/lib/application-status";
import type { ApplicationStatus, FieldOverride, ReviewStatus, VerificationResult } from "@/types";
import { Building2, Trash2 } from "lucide-react";

export function AnalystView({
  initialResult,
  onDeleted,
}: {
  initialResult: VerificationResult;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const { agent } = useAuth();
  const { deleteResult, updateResult } = useResults();
  const [result, setResult] = useState(initialResult);
  const [overrideField, setOverrideField] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeciding, setIsDeciding] = useState<ApplicationStatus | null>(null);

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

  const handleDecide = async (decision: ApplicationStatus) => {
    if (!agent || applicationStatus(result) === decision) return;

    setIsDeciding(decision);
    try {
      await decideApplicationAction(result.id, decision, {
        agentId: agent.id,
        agentName: agent.name,
      });
      const reopen = decision === "pending";
      const updates = {
        overallVerdict: decision,
        reviewStatus: (reopen ? "awaiting_review" : "reviewed") as ReviewStatus,
        agentId: reopen ? "unassigned" : agent.id,
        agentName: reopen ? "Unassigned" : agent.name,
      };
      setResult((prev) => ({ ...prev, ...updates }));
      updateResult(result.id, updates);
      router.refresh();
    } catch (err) {
      console.error(err);
      const labels: Record<ApplicationStatus, string> = {
        pending: "reopen",
        approved: "approve",
        rejected: "reject",
      };
      alert(`Failed to ${labels[decision]} this application. Please try again.`);
    } finally {
      setIsDeciding(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteResult(result.id);
      setShowDeleteDialog(false);
      router.refresh();
      if (onDeleted) {
        onDeleted();
      } else {
        router.push("/applications");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete application. Please try again.");
      setIsDeleting(false);
    }
  };

  useKeyboardShortcuts([
    {
      key: "a",
      description: "Quick Approve",
      action: () => {
        if (applicationStatus(result) !== "approved") {
          void handleDecide("approved");
        }
      },
    },
    {
      key: "r",
      description: "Quick Reject",
      action: () => {
        if (applicationStatus(result) !== "rejected") {
          void handleDecide("rejected");
        }
      },
    },
    {
      key: "o",
      description: "Override Field",
      action: () => {
        if (overrideField) return;
        const blocking = unresolvedReviewFields(result.fields);
        const target =
          blocking[0] ?? result.fields.find((field) => field.status !== "pass");
        if (target) setOverrideField(target.fieldName);
      },
    },
  ]);

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
            submissionSource={result.submissionSource}
          />
          <p className="text-xs text-muted-foreground">
            {submissionAttribution(result)}
          </p>
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
            <ReviewDecisionFooter
              result={result}
              onDecide={handleDecide}
              isDeciding={isDeciding}
            />
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
