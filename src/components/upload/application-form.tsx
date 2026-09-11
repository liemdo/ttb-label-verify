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
import { fetchCompaniesAction, type Company } from "@/actions/companies";
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
}

export function ApplicationForm({
  defaultBeverageType,
  companyName,
  onChange,
  onCompanyChange,
}: ApplicationFormProps) {
  const [beverageType, setBeverageType] = useState<BeverageType>(defaultBeverageType);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [data, setData] = useState<ApplicationData>({});
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");

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

  const handleCompanySelect = (value: string) => {
    if (!onCompanyChange) return;
    if (value === NEW_COMPANY_VALUE) {
      setIsNewCompany(true);
      setNewCompanyName("");
      onCompanyChange("");
      return;
    }
    setIsNewCompany(false);
    setNewCompanyName("");
    onCompanyChange(value);
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
          <Building2 className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-medium text-zinc-200">Submitting Company</h3>
        </div>
        {companyLocked ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5">
            <p className="text-sm text-zinc-200">{companyName}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Labels are filed under your company account
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Company</Label>
              <Select
                value={selectValue}
                onValueChange={(value) => {
                  if (value != null) handleCompanySelect(String(value));
                }}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 w-full">
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
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">New company name</Label>
                <Input
                  placeholder="e.g. Oak Barrel Distilling Co."
                  value={newCompanyName}
                  onChange={(e) => handleNewCompanyChange(e.target.value)}
                  className="bg-zinc-900 border-zinc-800"
                  autoFocus
                />
                <p className="text-[11px] text-zinc-500">
                  This company will be saved to the database when you run
                  verification.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product details are optional: the AI reads whatever is on the label,
          and stated values simply give it something to check against. */}
      {!isManualEntry ? (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-4 text-center">
          <p className="text-sm text-zinc-300">Product information</p>
          <p className="text-xs text-zinc-500 mt-1">
            The AI reads these details straight from your label. Enter them
            yourself to have the label checked against what you expect.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={enableManualEntry}
            className="mt-4 border-zinc-700 text-zinc-200 hover:bg-zinc-800 gap-2"
          >
            <Pencil className="h-4 w-4" />
            Enter information manually
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-zinc-200">
              Product information
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={disableManualEntry}
              className="h-7 gap-1.5 px-2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
              <span className="text-xs">Clear</span>
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Beverage Type</Label>
            <Select
              value={beverageType}
              onValueChange={(v) => {
                if (v != null) handleTypeChange(String(v) as BeverageType);
              }}
            >
              <SelectTrigger className="bg-zinc-900 border-zinc-800 w-full">
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
            <p className="text-[11px] text-zinc-500">
              {getGuidelineForBeverage(beverageType).regulation} — the fields
              below follow this beverage type&apos;s requirements.
            </p>
          </div>

          <div className="space-y-4 pt-2 border-t border-zinc-800/50">
            {fields.map((field) => (
              <div key={field.field} className="space-y-1.5">
                <Label className="text-xs text-zinc-400 flex items-center gap-2">
                  {FIELD_DISPLAY_NAMES[field.field] || field.displayName}
                  {field.onlyIf === "imported" && (
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wide">
                      imports only
                    </span>
                  )}
                </Label>
                <Input
                  placeholder={placeholders[field.field] ?? ""}
                  value={data[field.field] || ""}
                  onChange={(e) => handleDataChange(field.field, e.target.value)}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
            ))}
          </div>

          <p className="text-[11px] text-zinc-500">
            Leave anything you are unsure about blank — blank fields are read
            from the label instead of being compared.
          </p>
        </div>
      )}
    </div>
  );
}
