"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ReviewStatusBadge, VerdictBadge } from "@/components/shared/status-badge";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { useResults } from "@/context/results-context";
import type { VerificationResult } from "@/types";
import { Building2, FolderOpen, Trash2 } from "lucide-react";

export function ApplicationsList({
  initialResults,
}: {
  initialResults: VerificationResult[];
}) {
  const router = useRouter();
  const { deleteResult } = useResults();
  const [results, setResults] = useState(initialResults);
  const [pendingDelete, setPendingDelete] = useState<VerificationResult | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteResult(pendingDelete.id);
      setResults((prev) => prev.filter((r) => r.id !== pendingDelete.id));
      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete application. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (results.length === 0) {
    return (
      <div className="p-16 border border-zinc-800 rounded-lg bg-zinc-900/30 text-center flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
          <FolderOpen className="h-8 w-8 text-zinc-600" />
        </div>
        <h3 className="text-lg font-medium text-zinc-300">No Applications</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-sm">
          The application queue is currently empty.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {results.map((result) => (
          <Link
            key={result.id}
            href={`/applications/${result.id}`}
            className="block border border-zinc-800 rounded-lg bg-zinc-950 p-4 hover:bg-zinc-900/50 transition-colors group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-12 w-12 rounded bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.imageDataUrl}
                    alt=""
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-medium text-zinc-100 truncate">
                    {result.fileName}
                  </h3>
                  <p className="text-sm text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    <span className="truncate">{result.companyName}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="capitalize shrink-0">{result.beverageType}</span>
                  </p>
                  {result.submissionSource === "applicant" && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Submitted via applicant portal
                      {result.submittedByName ? ` by ${result.submittedByName}` : ""}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-zinc-300">
                    {result.reviewStatus === "awaiting_review"
                      ? "Unassigned"
                      : result.agentName}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(result.timestamp).toLocaleDateString()}
                  </p>
                </div>
                {result.reviewStatus === "awaiting_review" && (
                  <div className="hidden md:block">
                    <ReviewStatusBadge status={result.reviewStatus} />
                  </div>
                )}
                <VerdictBadge verdict={result.overallVerdict} />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPendingDelete(result);
                  }}
                  className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                  title="Delete application"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        description={
          pendingDelete
            ? `This will permanently delete "${pendingDelete.fileName}" from ${pendingDelete.companyName}. This action cannot be undone.`
            : ""
        }
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
