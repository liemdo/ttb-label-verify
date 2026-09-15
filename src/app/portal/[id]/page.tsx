"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/context/auth-context";
import { useResults } from "@/context/results-context";
import { fetchResultByIdAction } from "@/actions/results";
import { VerificationCard } from "@/components/results/verification-card";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { PageLoading } from "@/components/shared/page-loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { VerificationResult } from "@/types";
import { ChevronLeft, Trash2 } from "lucide-react";

export default function PortalSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AuthGuard allow={["applicant"]}>
      <SubmissionDetail id={id} />
    </AuthGuard>
  );
}

function SubmissionDetail({ id }: { id: string }) {
  const router = useRouter();
  const { applicant } = useAuth();
  const { deleteResult } = useResults();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchResultByIdAction(id)
      .then(setResult)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  // An applicant may only open submissions filed under their own company
  const isOwnSubmission =
    result !== null && result.companyName === applicant?.companyName;

  const handleDelete = async () => {
    if (!result) return;
    setIsDeleting(true);
    try {
      await deleteResult(result.id);
      setShowDeleteDialog(false);
      router.push("/portal");
    } catch (err) {
      console.error(err);
      alert("Failed to delete this submission. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div
      data-detail-workspace
      className="h-full min-h-0 overflow-hidden flex flex-col gap-4 p-6 max-w-[90rem] mx-auto"
    >
      <div className="flex items-center gap-4 shrink-0">
        <Link
          href="/portal"
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors border border-border bg-card"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Submission Details</h1>
          <p className="text-muted-foreground mt-1">
            {result ? result.fileName : "Loading your submission..."}
          </p>
        </div>
      </div>

      {isLoading ? (
        <PageLoading message="Loading submission..." />
      ) : !isOwnSubmission ? (
        <Card className="p-12 bg-muted/20 border-border text-center">
          <p className="text-foreground font-medium">Submission not found</p>
          <p className="text-sm text-muted-foreground mt-2">
            This submission does not exist or was filed by another company.
          </p>
        </Card>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <VerificationCard
            result={result}
            headerActions={
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Application
              </Button>
            }
          />
          <ConfirmDeleteDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            description={`This will permanently delete "${result.fileName}". This action cannot be undone.`}
            isDeleting={isDeleting}
            onConfirm={handleDelete}
          />
        </div>
      )}
    </div>
  );
}
