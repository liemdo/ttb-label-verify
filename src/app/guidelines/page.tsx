"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { TTB_GUIDELINES } from "@/lib/ttb-guidelines";
import { GOVERNMENT_WARNING_TEXT } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, FileText, Info } from "lucide-react";

export default function GuidelinesPage() {
  return (
    <AuthGuard>
      <GuidelinesContent />
    </AuthGuard>
  );
}

function GuidelinesContent() {
  const [activeTab, setActiveTab] = useState(Object.values(TTB_GUIDELINES)[0].beverageType);
  const activeGuideline = Object.values(TTB_GUIDELINES).find((g) => g.beverageType === activeTab)!;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">TTB Label Requirements</h1>
        <p className="text-zinc-400 mt-1">Official guidelines and formatting rules for alcohol beverage labels</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800">
        {Object.values(TTB_GUIDELINES).map((g) => (
          <button
            key={g.beverageType}
            onClick={() => setActiveTab(g.beverageType)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === g.beverageType
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-zinc-400 hover:text-zinc-300"
            }`}
          >
            {g.displayName}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Main Info */}
          <Card className="p-5 bg-zinc-900 border-zinc-800">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-zinc-200">{activeGuideline.displayName} Requirements</h3>
                <p className="text-sm text-zinc-400 mt-1">{activeGuideline.description}</p>
                <Badge variant="outline" className="mt-3 bg-zinc-800 text-zinc-300 border-zinc-700">
                  {activeGuideline.regulation}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Required Fields */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Mandatory Information
            </h3>
            <div className="space-y-3">
              {activeGuideline.requiredFields.map((field) => (
                <Card key={field.field} className="p-4 bg-zinc-900/50 border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-200">{field.displayName}</span>
                      {field.required && !field.onlyIf && (
                        <Badge variant="outline" className="text-[10px] uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Required</Badge>
                      )}
                      {field.onlyIf && (
                        <Badge variant="outline" className="text-[10px] uppercase bg-amber-500/10 text-amber-400 border-amber-500/20">
                          If {field.onlyIf}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400">{field.notes}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Gov Warning Reference */}
          <Card className="p-5 bg-zinc-950 border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <h3 className="text-sm font-bold text-zinc-200 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              Health Warning
            </h3>
            <div className="p-3 bg-zinc-900 rounded border border-zinc-800 mb-3">
              <p className="text-xs text-zinc-300 leading-relaxed font-serif">
                <strong className="font-bold">GOVERNMENT WARNING:</strong> (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.
              </p>
            </div>
            <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
              <li>Must be exactly as shown above</li>
              <li>"GOVERNMENT WARNING:" must be all caps and bold</li>
              <li>Must appear on a contrasting background</li>
            </ul>
          </Card>

          {/* Formatting Rules */}
          <Card className="p-5 bg-zinc-900 border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-zinc-400" />
              Formatting Rules
            </h3>
            <div className="space-y-4">
              {activeGuideline.formattingRules.map((rule, i) => (
                <div key={i}>
                  <p className="text-sm font-medium text-zinc-300">{rule.rule}</p>
                  <p className="text-xs text-zinc-500 mt-1">{rule.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Common Rejections */}
          <Card className="p-5 bg-red-500/5 border-red-500/20">
            <h3 className="text-sm font-semibold text-red-400 mb-3">Common Rejection Reasons</h3>
            <ul className="space-y-2">
              {activeGuideline.commonRejections.map((reason, i) => (
                <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                  <span className="text-red-500/50 mt-0.5">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
