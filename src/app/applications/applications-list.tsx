"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApplicationStatusBadge } from "@/components/shared/status-badge";
import { applicationStatus, isPending, submissionAttribution } from "@/lib/application-status";
import { labelImageSrc } from "@/lib/blob";
import { BEVERAGE_TYPE_LABELS } from "@/lib/constants";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useResults } from "@/context/results-context";
import type { ApplicationStatus, VerificationResult } from "@/types";
import { FolderOpen, Search, Trash2, X } from "lucide-react";

const ALL = "__all__";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

function brandFor(result: VerificationResult): string {
  const field = result.fields.find((f) => f.fieldName === "brandName");
  return field?.expectedValue?.trim() || field?.extractedValue?.trim() || result.fileName;
}

function reviewerFor(result: VerificationResult): string {
  return isPending(result) ? "Unassigned" : result.agentName;
}

function dateFor(result: VerificationResult): string {
  return new Date(result.timestamp).toLocaleDateString();
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function ApplicationsList({
  initialResults,
  initialCompany,
}: {
  initialResults: VerificationResult[];
  initialCompany?: string;
}) {
  const router = useRouter();
  const { results: liveResults, isLoading, deleteResult } = useResults();
  const [pendingDelete, setPendingDelete] = useState<VerificationResult | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState(initialCompany || ALL);

  useEffect(() => {
    setCompany(initialCompany || ALL);
  }, [initialCompany]);
  const [beverageType, setBeverageType] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [reviewer, setReviewer] = useState(ALL);
  const [dateSubmitted, setDateSubmitted] = useState(ALL);

  // History and Verify write into client context immediately. Use that list
  // once it has loaded so specialist submissions are not missing here while
  // the server snapshot is stale (or a save is still in flight).
  const results = isLoading ? initialResults : liveResults;

  const filterOptions = useMemo(() => {
    return {
      companies: uniqueSorted(results.map((r) => r.companyName)),
      beverageTypes: uniqueSorted(results.map((r) => r.beverageType)),
      statuses: uniqueSorted(results.map((r) => applicationStatus(r))) as ApplicationStatus[],
      reviewers: uniqueSorted(results.map(reviewerFor)),
      dates: [...new Set(results.map(dateFor))].sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      ),
    };
  }, [results]);

  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    return results.filter((result) => {
      if (company !== ALL && result.companyName !== company) return false;
      if (beverageType !== ALL && result.beverageType !== beverageType) return false;
      if (status !== ALL && applicationStatus(result) !== status) return false;
      if (reviewer !== ALL && reviewerFor(result) !== reviewer) return false;
      if (dateSubmitted !== ALL && dateFor(result) !== dateSubmitted) return false;
      if (query) {
        const haystack = `${brandFor(result)} ${result.fileName}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [results, search, company, beverageType, status, reviewer, dateSubmitted]);

  const hasActiveFilters =
    search.trim() !== "" ||
    company !== ALL ||
    beverageType !== ALL ||
    status !== ALL ||
    reviewer !== ALL ||
    dateSubmitted !== ALL;

  const clearFilters = () => {
    setSearch("");
    setCompany(ALL);
    setBeverageType(ALL);
    setStatus(ALL);
    setReviewer(ALL);
    setDateSubmitted(ALL);
  };

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
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="relative min-w-[12rem] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand or file"
              className="bg-muted/50 pl-8"
              aria-label="Search brand or file"
            />
          </div>
          <ColumnFilter
            label="Company"
            value={company}
            onChange={setCompany}
            options={filterOptions.companies.map((value) => ({
              value,
              label: value,
            }))}
            allLabel="All companies"
          />
          <ColumnFilter
            label="Beverage type"
            value={beverageType}
            onChange={setBeverageType}
            options={filterOptions.beverageTypes.map((value) => ({
              value,
              label: BEVERAGE_TYPE_LABELS[value] ?? value,
            }))}
            allLabel="All beverage types"
          />
          <ColumnFilter
            label="Status"
            value={status}
            onChange={setStatus}
            options={filterOptions.statuses.map((value) => ({
              value,
              label: STATUS_LABELS[value],
            }))}
            allLabel="All statuses"
          />
          <ColumnFilter
            label="Reviewer"
            value={reviewer}
            onChange={setReviewer}
            options={filterOptions.reviewers.map((value) => ({
              value,
              label: value,
            }))}
            allLabel="All reviewers"
          />
          <ColumnFilter
            label="Date submitted"
            value={dateSubmitted}
            onChange={setDateSubmitted}
            options={filterOptions.dates.map((value) => ({
              value,
              label: value,
            }))}
            allLabel="All dates"
          />
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 gap-1 text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
          <p className="ml-auto text-xs text-muted-foreground">
            {hasActiveFilters
              ? `${filteredResults.length} of ${results.length}`
              : `${results.length} ${results.length === 1 ? "application" : "applications"}`}
          </p>
        </div>
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
            {filteredResults.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="py-12 text-center">
                  <p className="text-sm font-medium text-foreground">
                    No applications match these filters
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try another value, or clear the filters to see the full queue.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredResults.map((result) => (
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
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {submissionAttribution(result)}
                  </p>
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
              ))
            )}
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

function ColumnFilter({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next != null) onChange(String(next));
      }}
    >
      <SelectTrigger className="min-w-[9.5rem] bg-muted/50" aria-label={label}>
        <SelectValue>
          {value === ALL
            ? allLabel
            : options.find((option) => option.value === value)?.label ?? allLabel}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
