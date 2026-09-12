"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/context/auth-context";
import { fetchResultByIdAction } from "@/actions/results";
import { VerificationCard } from "@/components/results/verification-card";
import { ReviewStatusBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card } from "@/components/ui/card";
import type { VerificationResult } from "@/types";
import { ChevronLeft } from "lucide-react";

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
  const { applicant } = useAuth();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResultByIdAction(id)
      .then(setResult)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  // An applicant may only open submissions filed under their own company
  const isOwnSubmission =
    result !== null && result.companyName === applicant?.companyName;

  return (
    <div
      data-detail-workspace
      className="h-full min-h-0 overflow-hidden flex flex-col gap-4 p-6 max-w-[90rem] mx-auto"
    >
      <div className="flex items-center gap-4 shrink-0">
        <Link
          href="/portal"
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Submission Details</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {result ? result.fileName : "Loading your submission..."}
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-12 bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800">
          <LoadingSpinner message="Loading submission..." />
        </Card>
      ) : !isOwnSubmission ? (
        <Card className="p-12 bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-zinc-700 dark:text-zinc-300 font-medium">Submission not found</p>
          <p className="text-sm text-zinc-500 mt-2">
            This submission does not exist or was filed by another company.
          </p>
        </Card>
      ) : (
        <>
          <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">Review status</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {result.reviewStatus === "awaiting_review"
                  ? "Automated checks are complete. A TTB specialist still needs to sign off."
                  : "A TTB specialist has reviewed this submission."}
              </p>
            </div>
            <ReviewStatusBadge status={result.reviewStatus} />
          </Card>

          <div className="flex-1 min-h-0">
            <VerificationCard result={result} />
          </div>
        </>
      )}
    </div>
  );
}
