"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/context/auth-context";
import { fetchResultsByCompanyAction } from "@/actions/results";
import { ReviewStatusBadge, VerdictBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { VerificationResult } from "@/types";
import { FileImage, Upload } from "lucide-react";

export default function PortalPage() {
  return (
    <AuthGuard allow={["applicant"]}>
      <PortalContent />
    </AuthGuard>
  );
}

function PortalContent() {
  const { applicant } = useAuth();
  const [submissions, setSubmissions] = useState<VerificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const awaitingCount = submissions.filter(
    (s) => s.reviewStatus === "awaiting_review"
  ).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Submissions</h1>
          <p className="text-zinc-400 mt-1">
            Labels submitted by {companyName}
            {awaitingCount > 0 &&
              ` — ${awaitingCount} awaiting specialist review`}
          </p>
        </div>
        <Link href="/portal/submit">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Upload className="h-4 w-4" />
            Submit Label
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Card className="p-12 bg-zinc-900/20 border-zinc-800">
          <LoadingSpinner message="Loading your submissions..." />
        </Card>
      ) : submissions.length === 0 ? (
        <Card className="p-16 bg-zinc-900/30 border-zinc-800 text-center flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
            <FileImage className="h-8 w-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-medium text-zinc-300">No submissions yet</h3>
          <p className="text-sm text-zinc-500 mt-2 max-w-sm">
            Submit a label image and it will be checked against TTB requirements
            right away.
          </p>
          <Link href="/portal/submit" className="mt-6">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Upload className="h-4 w-4" />
              Submit your first label
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-2">
          {submissions.map((submission) => (
            <Link
              key={submission.id}
              href={`/portal/${submission.id}`}
              className="block border border-zinc-800 rounded-lg bg-zinc-950 p-4 hover:bg-zinc-900/50 transition-colors group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 rounded bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={submission.imageDataUrl}
                      alt=""
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-medium text-zinc-100 truncate">
                      {submission.fileName}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      <span className="capitalize">{submission.beverageType}</span>
                      {" • "}
                      {new Date(submission.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:block">
                    <ReviewStatusBadge status={submission.reviewStatus} />
                  </div>
                  <VerdictBadge verdict={submission.overallVerdict} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
