"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createApplicantAction,
  type ApplicantDirectoryRow,
} from "@/actions/companies";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Plus, Search } from "lucide-react";

export function ApplicantsDirectory({
  initialApplicants,
}: {
  initialApplicants: ApplicantDirectoryRow[];
}) {
  const router = useRouter();
  const [applicants, setApplicants] = useState(initialApplicants);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return applicants;
    return applicants.filter((applicant) => {
      const haystack = [
        applicant.name,
        applicant.contactName ?? "",
        applicant.contactRole ?? "",
        applicant.contactPhone ?? "",
        applicant.contactEmail ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [applicants, search]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applicants</h1>
          <p className="text-muted-foreground mt-1">
            Companies that submit alcohol labels, with review status and contacts
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add applicant
        </Button>
      </div>

      {applicants.length === 0 ? (
        <Card className="p-16 bg-muted/30 border-border text-center flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No applicants</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Add a company so specialists can file labels on its behalf.
          </p>
        </Card>
      ) : (
        <Card className="py-0 overflow-hidden border-border bg-card">
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
            <div className="relative min-w-[12rem] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company or contact"
                className="bg-muted/50 pl-8"
                aria-label="Search company or contact"
              />
            </div>
            <p className="ml-auto text-xs text-muted-foreground">
              {search.trim()
                ? `${filtered.length} of ${applicants.length}`
                : `${applicants.length} ${
                    applicants.length === 1 ? "applicant" : "applicants"
                  }`}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Approved</TableHead>
                <TableHead className="text-right">Rejected</TableHead>
                <TableHead className="text-right">Labels</TableHead>
                <TableHead className="pr-4">Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={9} className="py-12 text-center">
                    <p className="text-sm font-medium text-foreground">
                      No applicants match this search
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try another name, or clear the search to see everyone.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((applicant) => (
                  <TableRow
                    key={applicant.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/applications?company=${encodeURIComponent(applicant.name)}`
                      )
                    }
                  >
                    <TableCell className="pl-4 font-medium text-foreground">
                      {applicant.name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-foreground">
                          {applicant.contactName ?? "Not on file"}
                        </p>
                        {applicant.contactRole && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {applicant.contactRole}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {applicant.contactPhone ?? "Not on file"}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {applicant.contactEmail ?? "Not on file"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-amber-600 dark:text-amber-400">
                      {applicant.pending}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                      {applicant.approved}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-red-500">
                      {applicant.rejected}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {applicant.total}
                    </TableCell>
                    <TableCell className="pr-4 text-muted-foreground">
                      {new Date(applicant.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <AddApplicantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(created) => {
          setApplicants((prev) =>
            [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
          );
        }}
      />
    </div>
  );
}

function AddApplicantDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (applicant: ApplicantDirectoryRow) => void;
}) {
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const reset = () => {
    setName("");
    setContactName("");
    setContactPhone("");
    setContactEmail("");
    setContactRole("");
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && isSaving) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const created = await createApplicantAction({
        name,
        contactName,
        contactPhone,
        contactEmail,
        contactRole,
      });
      onCreated(created);
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add applicant. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-muted border-border sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-foreground">Add applicant</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Save a company and its contact so labels can be filed on their behalf.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="applicant-company" className="text-xs text-muted-foreground">
                Company name
              </Label>
              <Input
                id="applicant-company"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Oak Barrel Distilling Co."
                className="bg-muted border-border"
                autoFocus
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="applicant-contact" className="text-xs text-muted-foreground">
                Contact person
              </Label>
              <Input
                id="applicant-contact"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Ruth Alvarez"
                className="bg-muted border-border"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="applicant-phone" className="text-xs text-muted-foreground">
                Phone number
              </Label>
              <Input
                id="applicant-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. (502) 555-0142"
                className="bg-muted border-border"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="applicant-email" className="text-xs text-muted-foreground">
                Email
              </Label>
              <Input
                id="applicant-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. ruth.alvarez@oakbarreldistilling.com"
                className="bg-muted border-border"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="applicant-role" className="text-xs text-muted-foreground">
                Role <span className="text-muted-foreground/80">(optional)</span>
              </Label>
              <Input
                id="applicant-role"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                placeholder="e.g. Compliance Contact"
                className="bg-muted border-border"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <DialogFooter className="border-border bg-muted/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSaving ||
                !name.trim() ||
                !contactName.trim() ||
                !contactPhone.trim() ||
                !contactEmail.trim()
              }
            >
              {isSaving ? "Saving..." : "Add applicant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
