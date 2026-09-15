"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/context/auth-context";
import { fetchResultsByCompanyAction } from "@/actions/results";
import { ApplicationStatusBadge, ApprovedByLine } from "@/components/shared/status-badge";
import { isPending, submissionAttribution } from "@/lib/application-status";
import { PageLoading } from "@/components/shared/page-loading";
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
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { useResults } from "@/context/results-context";
import { BEVERAGE_TYPE_LABELS } from "@/lib/constants";
import { labelImageSrc } from "@/lib/blob";
import type { VerificationResult } from "@/types";
import { FileImage, Trash2, Upload } from "lucide-react";

export default function PortalPage() {
  return (
    <AuthGuard allow={["applicant"]}>
      <PortalContent />
    </AuthGuard>
  );
}

function brandFor(submission: VerificationResult): string {
  const field = submission.fields.find((f) => f.fieldName === "brandName");
  return field?.expectedValue?.trim() || field?.extractedValue?.trim() || "—";
}

function PortalContent() {
  const router = useRouter();
  const { applicant } = useAuth();
  const { deleteResult } = useResults();
  const [submissions, setSubmissions] = useState<VerificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<VerificationResult | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const companyName = applicant?.companyName;

  const load = useCallback(() => {
    if (!companyName) return;
    setIsLoading(true);
    fetchResultsByCompanyAction(companyName)
      .then(setSubmissions)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [companyName]);

  useEffect(load, [load]);

  const pendingCount = submissions.filter(isPending).length;

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await deleteResult(pendingDelete.id);
      setSubmissions((prev) => prev.filter((s) => s.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete this submission. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Submissions</h1>
          <p className="text-muted-foreground mt-1">
            Labels submitted by {companyName}
            {pendingCount > 0 &&
              ` — ${pendingCount} pending review`}
          </p>
        </div>
        <Link href="/portal/submit">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Upload className="h-4 w-4" />
            Submit Label
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <PageLoading message="Loading your submissions..." />
      ) : submissions.length === 0 ? (
        <Card className="p-16 bg-muted/30 border-border text-center flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileImage className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No submissions yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Submit a label image and it will be checked against TTB requirements
            right away.
          </p>
          <Link href="/portal/submit" className="mt-6">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Upload className="h-4 w-4" />
              Submit your first label
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="py-0 overflow-hidden border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 w-[72px]">Label</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Beverage type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date submitted</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="w-12 pr-4">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow
                  key={submission.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/portal/${submission.id}`)}
                >
                  <TableCell className="pl-4">
                    <div className="h-10 w-10 rounded bg-muted overflow-hidden border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={labelImageSrc(submission.imageDataUrl)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground max-w-[14rem] truncate">
                    {brandFor(submission)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {BEVERAGE_TYPE_LABELS[submission.beverageType] ??
                      submission.beverageType}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <ApplicationStatusBadge result={submission} />
                      <ApprovedByLine result={submission} />
                      {submission.submissionSource === "specialist" && (
                        <p className="text-xs text-muted-foreground">
                          {submissionAttribution(submission)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(submission.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[12rem] truncate">
                    {submission.fileName}
                  </TableCell>
                  <TableCell className="pr-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setPendingDelete(submission);
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
      )}

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        description={
          pendingDelete
            ? `This will permanently delete "${pendingDelete.fileName}". This action cannot be undone.`
            : ""
        }
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
