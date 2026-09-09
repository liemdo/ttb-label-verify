"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import type { VerificationResult, FieldOverride } from "@/types";
import { MANUAL_REVIEW_TIME_MS } from "@/lib/constants";

interface ResultsContextType {
  results: VerificationResult[];
  addResult: (result: VerificationResult) => void;
  addResults: (results: VerificationResult[]) => void;
  updateResult: (id: string, updates: Partial<VerificationResult>) => void;
  addOverride: (resultId: string, override: FieldOverride) => void;
  updateAgentNotes: (resultId: string, notes: string) => void;
  getResult: (id: string) => VerificationResult | undefined;
  clearResults: () => void;
  stats: {
    total: number;
    approved: number;
    rejected: number;
    needsReview: number;
    todayCount: number;
    totalTimeSavedMs: number;
  };
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

export function ResultsProvider({ children }: { children: React.ReactNode }) {
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ttb-results");
    if (stored) {
      try {
        setResults(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("ttb-results", JSON.stringify(results));
    }
  }, [results, isHydrated]);

  const addResult = useCallback((result: VerificationResult) => {
    setResults((prev) => [result, ...prev]);
  }, []);

  const addResults = useCallback((newResults: VerificationResult[]) => {
    setResults((prev) => [...newResults, ...prev]);
  }, []);

  const updateResult = useCallback(
    (id: string, updates: Partial<VerificationResult>) => {
      setResults((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    },
    []
  );

  const addOverride = useCallback(
    (resultId: string, override: FieldOverride) => {
      setResults((prev) =>
        prev.map((r) => {
          if (r.id !== resultId) return r;
          const updatedFields = r.fields.map((f) => {
            if (f.fieldName !== override.fieldName) return f;
            return { ...f, status: override.overriddenStatus, override };
          });
          const hasAnyFail = updatedFields.some(
            (f) => f.status === "fail" && f.required
          );
          const hasAnyWarning = updatedFields.some(
            (f) => f.status === "warning" && f.required
          );
          const overallVerdict = hasAnyFail
            ? "rejected"
            : hasAnyWarning
            ? "needs_review"
            : "approved";
          return {
            ...r,
            fields: updatedFields,
            overallVerdict: overallVerdict as VerificationResult["overallVerdict"],
          };
        })
      );
    },
    []
  );

  const updateAgentNotes = useCallback(
    (resultId: string, notes: string) => {
      setResults((prev) =>
        prev.map((r) => (r.id === resultId ? { ...r, agentNotes: notes } : r))
      );
    },
    []
  );

  const getResult = useCallback(
    (id: string) => results.find((r) => r.id === id),
    [results]
  );

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayResults = results.filter(
      (r) => new Date(r.timestamp).toDateString() === today
    );
    return {
      total: results.length,
      approved: results.filter((r) => r.overallVerdict === "approved").length,
      rejected: results.filter((r) => r.overallVerdict === "rejected").length,
      needsReview: results.filter((r) => r.overallVerdict === "needs_review").length,
      todayCount: todayResults.length,
      totalTimeSavedMs: todayResults.reduce(
        (sum, r) => sum + (r.timeSavedMs ?? MANUAL_REVIEW_TIME_MS),
        0
      ),
    };
  }, [results]);

  if (!isHydrated) return null;

  return (
    <ResultsContext.Provider
      value={{
        results,
        addResult,
        addResults,
        updateResult,
        addOverride,
        updateAgentNotes,
        getResult,
        clearResults,
        stats,
      }}
    >
      {children}
    </ResultsContext.Provider>
  );
}

export function useResults() {
  const context = useContext(ResultsContext);
  if (context === undefined) {
    throw new Error("useResults must be used within a ResultsProvider");
  }
  return context;
}
