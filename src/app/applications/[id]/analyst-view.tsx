"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VerificationCard } from "@/components/results/verification-card";
import { OverrideDialog } from "@/components/results/override-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateNotesAction,
  updateFieldsAction,
  updateCompanyNameAction,
  updateReviewStatusAction,
} from "@/actions/results";
import {
  ensureCompanyAction,
  fetchCompaniesAction,
  type Company,
} from "@/actions/companies";
import { useResults } from "@/context/results-context";
import { useAuth } from "@/context/auth-context";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { ReviewStatusBadge } from "@/components/shared/status-badge";
import type { FieldOverride, VerificationResult } from "@/types";
import { Building2, CheckCircle2, Plus, Trash2 } from "lucide-react";

const NEW_COMPANY_VALUE = "__new__";

export function AnalystView({ initialResult }: { initialResult: VerificationResult }) {
  const router = useRouter();
  const { agent } = useAuth();
  const { deleteResult } = useResults();
  const [result, setResult] = useState(initialResult);
  const [overrideField, setOverrideField] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSigningOff, setIsSigningOff] = useState(false);

  useEffect(() => {
    fetchCompaniesAction().then(setCompanies).catch(console.error);
  }, []);

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

    const hasAnyFail = newFields.some((f) => f.status === "fail" && f.required);
    const hasAnyWarning = newFields.some((f) => f.status === "warning" && f.required);
    const overallVerdict = (
      hasAnyFail ? "rejected" : hasAnyWarning ? "needs_review" : "approved"
    ) as VerificationResult["overallVerdict"];

    try {
      await updateFieldsAction(result.id, newFields, overallVerdict);
      setResult((prev) => ({
        ...prev,
        fields: newFields,
        overallVerdict,
      }));
      setOverrideField(null);
    } catch (err) {
      console.error(err);
      alert("Failed to override field. Please try again.");
    }
  };

  const saveCompany = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === result.companyName) return;

    setIsSavingCompany(true);
    try {
      const company = await ensureCompanyAction(trimmed);
      await updateCompanyNameAction(result.id, company.name);
      setResult((prev) => ({ ...prev, companyName: company.name }));
      setCompanies((prev) => {
        if (prev.some((c) => c.id === company.id)) return prev;
        return [...prev, company].sort((a, b) => a.name.localeCompare(b.name));
      });
      setIsNewCompany(false);
      setNewCompanyName("");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save company. Please try again.");
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleCompanySelect = async (value: string) => {
    if (value === NEW_COMPANY_VALUE) {
      setIsNewCompany(true);
      setNewCompanyName("");
      return;
    }
    setIsNewCompany(false);
    await saveCompany(value);
  };

  const handleSignOff = async () => {
    if (!agent) return;

    setIsSigningOff(true);
    try {
      await updateReviewStatusAction(result.id, "reviewed", {
        agentId: agent.id,
        agentName: agent.name,
      });
      setResult((prev) => ({
        ...prev,
        reviewStatus: "reviewed",
        agentId: agent.id,
        agentName: agent.name,
      }));
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to sign off on this application. Please try again.");
    } finally {
      setIsSigningOff(false);
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

  const activeField = result.fields.find((f) => f.fieldName === overrideField);
  const selectValue = isNewCompany
    ? NEW_COMPANY_VALUE
    : companies.some((c) => c.name === result.companyName)
      ? result.companyName
      : result.companyName && result.companyName !== "Unknown"
        ? result.companyName
        : "";

  return (
    <>
      {result.submissionSource === "applicant" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-blue-500/25 bg-blue-500/5 p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-zinc-200">
                Submitted through the applicant portal
              </p>
              <ReviewStatusBadge status={result.reviewStatus} />
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {result.submittedByName
                ? `Filed by ${result.submittedByName} at ${result.companyName}.`
                : `Filed by ${result.companyName}.`}{" "}
              {result.reviewStatus === "awaiting_review"
                ? "Automated checks have run; sign off to confirm your review."
                : `Reviewed by ${result.agentName}.`}
            </p>
          </div>
          {result.reviewStatus === "awaiting_review" && (
            <Button
              type="button"
              onClick={handleSignOff}
              disabled={isSigningOff}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSigningOff ? "Signing off..." : "Sign Off Review"}
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-zinc-400" />
            <Label className="text-sm text-zinc-300">Submitting Company</Label>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Select
              value={selectValue}
              onValueChange={(value) => {
                if (value != null) handleCompanySelect(String(value));
              }}
              disabled={isSavingCompany}
            >
              <SelectTrigger className="bg-zinc-900 border-zinc-800 w-full min-w-0 sm:min-w-[28rem] sm:max-w-2xl">
                <SelectValue placeholder={result.companyName || "Select company"} />
              </SelectTrigger>
              <SelectContent className="min-w-[var(--anchor-width)]">
                {!companies.some((c) => c.name === result.companyName) &&
                  result.companyName &&
                  result.companyName !== "Unknown" && (
                    <SelectItem value={result.companyName}>
                      {result.companyName}
                    </SelectItem>
                  )}
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.name}>
                    {company.name}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_COMPANY_VALUE}>
                  <span className="flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Add new company
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            {isNewCompany && (
              <div className="flex gap-2 flex-1 min-w-0">
                <Input
                  placeholder="New company name"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800"
                  disabled={isSavingCompany}
                />
                <Button
                  type="button"
                  onClick={() => saveCompany(newCompanyName)}
                  disabled={!newCompanyName.trim() || isSavingCompany}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                >
                  Save
                </Button>
              </div>
            )}
          </div>
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

      <VerificationCard
        result={result}
        onUpdateNotes={handleUpdateNotes}
        onOverrideField={setOverrideField}
      />

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
    </>
  );
}
