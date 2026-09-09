"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ApplicationData, BeverageType } from "@/types";
import { Switch } from "@/components/ui/switch";

interface ApplicationFormProps {
  defaultBeverageType: BeverageType;
  onChange: (data: ApplicationData, beverageType: BeverageType, skipComparison: boolean) => void;
}

export function ApplicationForm({ defaultBeverageType, onChange }: ApplicationFormProps) {
  const [beverageType, setBeverageType] = useState<BeverageType>(defaultBeverageType);
  const [skipComparison, setSkipComparison] = useState(false);
  const [data, setData] = useState<ApplicationData>({});

  const handleDataChange = (field: keyof ApplicationData, value: string) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData, beverageType, skipComparison);
  };

  const handleTypeChange = (val: BeverageType) => {
    setBeverageType(val);
    onChange(data, val, skipComparison);
  };

  const handleSkipChange = (val: boolean) => {
    setSkipComparison(val);
    onChange(data, beverageType, val);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900 border border-zinc-800">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">Comparison Mode</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Extract data only, without comparing to application fields
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-zinc-400">Extract Only</Label>
          <Switch checked={skipComparison} onCheckedChange={handleSkipChange} />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs text-zinc-400">Beverage Type</Label>
          <Select value={beverageType} onValueChange={(v) => handleTypeChange(v as BeverageType)}>
            <SelectTrigger className="mt-1.5 bg-zinc-900 border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spirits">Distilled Spirits</SelectItem>
              <SelectItem value="wine">Wine</SelectItem>
              <SelectItem value="beer">Malt Beverage (Beer)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!skipComparison && (
          <div className="space-y-4 pt-2 border-t border-zinc-800/50">
            <h3 className="text-sm font-medium text-zinc-300">Expected Application Data</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Brand Name</Label>
                <Input 
                  placeholder="e.g. OLD TOM DISTILLERY" 
                  value={data.brandName || ""}
                  onChange={(e) => handleDataChange("brandName", e.target.value)}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Class/Type</Label>
                <Input 
                  placeholder="e.g. Kentucky Straight Bourbon Whiskey" 
                  value={data.classType || ""}
                  onChange={(e) => handleDataChange("classType", e.target.value)}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Alcohol Content</Label>
                <Input 
                  placeholder="e.g. 45% Alc./Vol. (90 Proof)" 
                  value={data.alcoholContent || ""}
                  onChange={(e) => handleDataChange("alcoholContent", e.target.value)}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Net Contents</Label>
                <Input 
                  placeholder="e.g. 750 mL" 
                  value={data.netContents || ""}
                  onChange={(e) => handleDataChange("netContents", e.target.value)}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
