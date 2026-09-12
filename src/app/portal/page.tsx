"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/context/auth-context";
import { fetchResultsByCompanyAction } from "@/actions/results";
import { ReviewStatusBadge, VerdictBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
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
import { BEVERAGE_TYPE_LABELS } from "@/lib/constants";
import type { VerificationResult } from "@/types";
import { FileImage, Upload } from "lucide-react";

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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Submissions</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
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
        <Card className="p-12 bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800">
          <LoadingSpinner message="Loading your submissions..." />
        </Card>
      ) : submissions.length === 0 ? (
        <Card className="p-16 bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 text-center flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-4">
            <FileImage className="h-8 w-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">No submissions yet</h3>
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
        <Card className="py-0 overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 w-[72px]">Label</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Beverage type</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Specialist</TableHead>
                <TableHead>Date submitted</TableHead>
                <TableHead>File</TableHead>
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
                    <div className="h-10 w-10 rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={submission.imageDataUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-100 max-w-[14rem] truncate">
                    {brandFor(submission)}
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400">
                    {BEVERAGE_TYPE_LABELS[submission.beverageType] ??
                      submission.beverageType}
                  </TableCell>
                  <TableCell>
                    <VerdictBadge verdict={submission.overallVerdict} />
                  </TableCell>
                  <TableCell>
                    <ReviewStatusBadge status={submission.reviewStatus} />
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400">
                    {new Date(submission.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-zinc-500 max-w-[12rem] truncate">
                    {submission.fileName}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
