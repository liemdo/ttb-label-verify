"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplicationData, BeverageType } from "@/types";
import { fetchCompaniesAction, type Company, type CompanyContactInput } from "@/actions/companies";
import { getGuidelineForBeverage } from "@/lib/ttb-guidelines";
import {
  BEVERAGE_TYPE_LABELS,
  FIELD_DISPLAY_NAMES,
  FIELD_PLACEHOLDERS,
} from "@/lib/constants";
import { Building2, Pencil, Plus, X } from "lucide-react";

const NEW_COMPANY_VALUE = "__new__";

/** The warning statement is fixed text, so there is nothing to state up front. */
const NON_ENTERABLE_FIELDS = new Set(["governmentWarning"]);

function fieldsForBeverage(beverageType: BeverageType) {
  return getGuidelineForBeverage(beverageType).requiredFields.filter(
    (f) => !NON_ENTERABLE_FIELDS.has(f.field)
  );
}

interface ApplicationFormProps {
  defaultBeverageType: BeverageType;
  companyName: string;
  onChange: (
    data: ApplicationData,
    beverageType: BeverageType,
    skipComparison: boolean
  ) => void;
  /** Omit to lock the company, as when an applicant submits their own label. */
  onCompanyChange?: (companyName: string) => void;
  onNewCompanyContactChange?: (contact: CompanyContactInput | null) => void;
  /** Open the application fields so the label is matched to the form by default. */
  compareByDefault?: boolean;
}

export function ApplicationForm({
  defaultBeverageType,
  companyName,
  onChange,
  onCompanyChange,
  onNewCompanyContactChange,
  compareByDefault = false,
}: ApplicationFormProps) {
  const [beverageType, setBeverageType] = useState<BeverageType>(defaultBeverageType);
  const [isManualEntry, setIsManualEntry] = useState(compareByDefault);
  const [data, setData] = useState<ApplicationData>({});
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");

  const companyLocked = !onCompanyChange;

  useEffect(() => {
    if (companyLocked) return;
    fetchCompaniesAction().then(setCompanies).catch(console.error);
  }, [companyLocked]);

  const fields = useMemo(() => fieldsForBeverage(beverageType), [beverageType]);
  const placeholders = FIELD_PLACEHOLDERS[beverageType] ?? {};

  const handleDataChange = (field: string, value: string) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData, beverageType, false);
  };

  const handleTypeChange = (value: BeverageType) => {
    // Drop values for fields the new beverage type doesn't have
    const allowed = new Set(fieldsForBeverage(value).map((f) => f.field));
    const pruned: ApplicationData = {};
    for (const [key, val] of Object.entries(data)) {
      if (allowed.has(key) && val) pruned[key] = val;
    }

    setBeverageType(value);
    setData(pruned);
    onChange(pruned, value, false);
  };

  const enableManualEntry = () => {
    setIsManualEntry(true);
    onChange(data, beverageType, false);
  };

  const disableManualEntry = () => {
    setIsManualEntry(false);
    setData({});
    onChange({}, beverageType, true);
  };

  const emitNewContact = (
    contactName: string,
    contactPhone: string,
    contactEmail: string
  ) => {
    onNewCompanyContactChange?.({ contactName, contactPhone, contactEmail });
  };

  const handleCompanySelect = (value: string) => {
    if (!onCompanyChange) return;
    if (value === NEW_COMPANY_VALUE) {
      setIsNewCompany(true);
      setNewCompanyName("");
      setNewContactName("");
      setNewContactPhone("");
      setNewContactEmail("");
      onCompanyChange("");
      emitNewContact("", "", "");
      return;
    }
    setIsNewCompany(false);
    setNewCompanyName("");
    setNewContactName("");
    setNewContactPhone("");
    setNewContactEmail("");
    onCompanyChange(value);
    onNewCompanyContactChange?.(null);
  };

  const handleNewCompanyChange = (value: string) => {
    setNewCompanyName(value);
    onCompanyChange?.(value);
  };

  const selectValue = isNewCompany
    ? NEW_COMPANY_VALUE
    : companyName && companies.some((c) => c.name === companyName)
      ? companyName
      : "";

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Submitting Company</h3>
        </div>
        {companyLocked ? (
          <div className="rounded-lg border border-border bg-muted px-3 py-2.5">
            <p className="text-sm text-foreground">{companyName}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Labels are filed under your company account
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Company</Label>
              <Select
                value={selectValue}
                onValueChange={(value) => {
                  if (value != null) handleCompanySelect(String(value));
                }}
              >
                <SelectTrigger className="bg-muted border-border w-full">
                  <SelectValue placeholder="Select or add a company" />
                </SelectTrigger>
                <SelectContent>
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
            </div>
            {isNewCompany && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">New company name</Label>
                  <Input
                    placeholder="e.g. Oak Barrel Distilling Co."
                    value={newCompanyName}
                    onChange={(e) => handleNewCompanyChange(e.target.value)}
                    className="bg-muted border-border"
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Contact person</Label>
                  <Input
                    placeholder="e.g. Ruth Alvarez"
                    value={newContactName}
                    onChange={(e) => {
                      setNewContactName(e.target.value);
                      emitNewContact(e.target.value, newContactPhone, newContactEmail);
                    }}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Phone number</Label>
                  <Input
                    type="tel"
                    placeholder="e.g. (502) 555-0142"
                    value={newContactPhone}
                    onChange={(e) => {
                      setNewContactPhone(e.target.value);
                      emitNewContact(newContactName, e.target.value, newContactEmail);
                    }}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input
                    type="email"
                    placeholder="e.g. ruth.alvarez@oakbarreldistilling.com"
                    value={newContactEmail}
                    onChange={(e) => {
                      setNewContactEmail(e.target.value);
                      emitNewContact(newContactName, newContactPhone, e.target.value);
                    }}
                    className="bg-muted border-border"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  This company and contact will be saved when you run verification.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {!isManualEntry ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-center">
          <p className="text-sm text-foreground">Product information</p>
          <p className="text-xs text-muted-foreground mt-1">
            Matching is skipped. Enter the application values to check the
            label against the form.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={enableManualEntry}
            className="mt-4 border-border text-foreground hover:bg-accent gap-2"
          >
            <Pencil className="h-4 w-4" />
            Enter application data
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-foreground">
              Application data
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={disableManualEntry}
              className="h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              <span className="text-xs">Skip comparison</span>
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Beverage Type</Label>
            <Select
              value={beverageType}
              onValueChange={(v) => {
                if (v != null) handleTypeChange(String(v) as BeverageType);
              }}
            >
              <SelectTrigger className="bg-muted border-border w-full">
                <SelectValue>{BEVERAGE_TYPE_LABELS[beverageType]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BEVERAGE_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              {getGuidelineForBeverage(beverageType).regulation} — the fields
              below follow this beverage type&apos;s requirements.
            </p>
          </div>

          <div className="space-y-4 pt-2 border-t border-border/50">
            {fields.map((field) => (
              <div key={field.field} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  {FIELD_DISPLAY_NAMES[field.field] || field.displayName}
                  {field.required && !field.onlyIf && (
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      required
                    </span>
                  )}
                  {field.onlyIf === "imported" && (
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      imports only
                    </span>
                  )}
                </Label>
                <Input
                  placeholder={placeholders[field.field] ?? ""}
                  value={data[field.field] || ""}
                  onChange={(e) => handleDataChange(field.field, e.target.value)}
                  className="bg-muted border-border"
                />
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Enter what is on the application so we can match it to the label.
            Country of origin is only required for imports. Skip comparison if
            you do not have application data.
          </p>
        </div>
      )}
    </div>
  );
}
