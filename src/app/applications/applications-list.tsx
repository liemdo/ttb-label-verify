"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApplicationStatusBadge } from "@/components/shared/status-badge";
import { isPending } from "@/lib/application-status";
import { labelImageSrc } from "@/lib/blob";
import { BEVERAGE_TYPE_LABELS } from "@/lib/constants";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useResults } from "@/context/results-context";
import type { VerificationResult } from "@/types";
import { FolderOpen, Trash2 } from "lucide-react";

function brandFor(result: VerificationResult): string {
  const field = result.fields.find((f) => f.fieldName === "brandName");
  return field?.expectedValue?.trim() || field?.extractedValue?.trim() || result.fileName;
}

export function ApplicationsList({
  initialResults,
}: {
  initialResults: VerificationResult[];
}) {
  const router = useRouter();
  const { results: liveResults, isLoading, deleteResult } = useResults();
  const [pendingDelete, setPendingDelete] = useState<VerificationResult | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // History and Verify write into client context immediately. Use that list
  // once it has loaded so specialist submissions are not missing here while
  // the server snapshot is stale (or a save is still in flight).
  const results = isLoading ? initialResults : liveResults;

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteResult(pendingDelete.id);
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
      <Card className="p-16 bg-muted/30 border-border text-center flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No Applications</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          The application queue is currently empty.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className="py-0 overflow-hidden border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4 w-[72px]">Label</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Beverage type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead>Date submitted</TableHead>
              <TableHead>File</TableHead>
              <TableHead className="w-12 pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow
                key={result.id}
                className="cursor-pointer"
                onClick={() => router.push(`/applications/${result.id}`)}
              >
                <TableCell className="pl-4">
                  <div className="h-10 w-10 rounded bg-muted overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={labelImageSrc(result.imageDataUrl)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-foreground max-w-[14rem] truncate">
                  {brandFor(result)}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <p className="text-foreground whitespace-nowrap">{result.companyName}</p>
                  {result.submissionSource === "applicant" && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Via applicant portal
                      {result.submittedByName ? ` · ${result.submittedByName}` : ""}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {BEVERAGE_TYPE_LABELS[result.beverageType] ?? result.beverageType}
                </TableCell>
                <TableCell>
                  <ApplicationStatusBadge result={result} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {isPending(result) ? "Unassigned" : result.agentName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(result.timestamp).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[12rem] truncate">
                  {result.fileName}
                </TableCell>
                <TableCell className="pr-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPendingDelete(result);
                    }}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                    title="Delete application"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

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
