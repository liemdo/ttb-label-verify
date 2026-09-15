"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { fetchCompanyByNameAction, type Company } from "@/actions/companies";
import { fetchResultsByCompanyAction } from "@/actions/results";
import { applicationStatus } from "@/lib/application-status";
import { APPLICANTS } from "@/lib/constants";
import { Building2, Calendar, FileStack, Mail, Phone, Send, User, X } from "lucide-react";
import { submissionAttribution } from "@/lib/application-status";
import type { SubmissionSource } from "@/types";

interface CompanyInfoDialogProps {
  companyName: string;
  submittedByName?: string;
  submissionSource?: SubmissionSource;
}

export function CompanyInfoDialog({
  companyName,
  submittedByName,
  submissionSource,
}: CompanyInfoDialogProps) {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const applicant = APPLICANTS.find(
    (a) => a.companyName.toLowerCase() === companyName.trim().toLowerCase()
  );
  const contactName =
    submissionSource === "specialist"
      ? applicant?.contactName
      : applicant?.contactName ?? submittedByName;

  useEffect(() => {
    if (!open || !companyName.trim()) return;

    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      fetchCompanyByNameAction(companyName),
      fetchResultsByCompanyAction(companyName),
    ])
      .then(([record, results]) => {
        if (cancelled) return;
        setCompany(record);
        setStats({
          total: results.length,
          pending: results.filter((r) => applicationStatus(r) === "pending").length,
          approved: results.filter((r) => applicationStatus(r) === "approved").length,
          rejected: results.filter((r) => applicationStatus(r) === "rejected").length,
        });
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, companyName]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="block max-w-full truncate text-left text-base font-medium text-primary hover:underline underline-offset-4"
      >
        {companyName || "Unknown"}
      </button>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close company information"
              className="absolute inset-0 bg-black/20"
              onClick={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="company-info-title"
              className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-4 shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="company-info-title"
                    className="font-heading text-base font-medium text-foreground"
                  >
                    {companyName}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Submitting company for this application
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <InfoRow icon={<Building2 className="h-4 w-4" />} label="Company">
                  {company?.name ?? companyName}
                </InfoRow>
                <InfoRow icon={<User className="h-4 w-4" />} label="Contact">
                  {company?.contactName || contactName
                    ? `${company?.contactName || contactName}${
                        company?.contactRole || applicant?.role
                          ? ` · ${company?.contactRole || applicant?.role}`
                          : ""
                      }`
                    : "Not on file"}
                </InfoRow>
                <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone">
                  {company?.contactPhone || applicant?.phone || "Not on file"}
                </InfoRow>
                <InfoRow icon={<Mail className="h-4 w-4" />} label="Email">
                  {company?.contactEmail || applicant?.email || "Not on file"}
                </InfoRow>
                <InfoRow icon={<Send className="h-4 w-4" />} label="Filed by">
                  {submissionAttribution({
                    submissionSource: submissionSource ?? "specialist",
                    submittedByName,
                  })}
                </InfoRow>
                <InfoRow icon={<Calendar className="h-4 w-4" />} label="Added">
                  {isLoading
                    ? "Loading…"
                    : company
                      ? new Date(company.createdAt).toLocaleDateString()
                      : "Not in the company directory"}
                </InfoRow>
                <InfoRow icon={<FileStack className="h-4 w-4" />} label="Applications">
                  {isLoading
                    ? "Loading…"
                    : `${stats.total} total · ${stats.pending} pending · ${stats.approved} approved · ${stats.rejected} rejected`}
                </InfoRow>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{children}</p>
      </div>
    </div>
  );
}
