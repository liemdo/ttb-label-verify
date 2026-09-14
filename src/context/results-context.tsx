"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import type { VerificationResult, FieldOverride } from "@/types";
import { applicationStatus } from "@/lib/application-status";
import { MANUAL_REVIEW_TIME_MS } from "@/lib/constants";
import { useAuth } from "@/context/auth-context";
import { 
  fetchResultsAction, 
  saveResultAction, 
  saveResultsAction, 
  updateNotesAction, 
  updateFieldsAction, 
  clearResultsAction,
  deleteResultAction,
  updateCompanyNameAction,
} from "@/actions/results";

interface ResultsContextType {
  results: VerificationResult[];
  addResult: (result: VerificationResult) => Promise<void>;
  addResults: (results: VerificationResult[]) => Promise<void>;
  updateResult: (id: string, updates: Partial<VerificationResult>) => void;
  addOverride: (resultId: string, override: FieldOverride) => void;
  updateAgentNotes: (resultId: string, notes: string) => void;
  deleteResult: (id: string) => Promise<void>;
  updateCompanyName: (id: string, companyName: string) => Promise<void>;
  getResult: (id: string) => VerificationResult | undefined;
  clearResults: () => void;
  stats: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    todayCount: number;
    totalTimeSavedMs: number;
    todayTimeSavedMs: number;
  };
  isLoading: boolean;
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

export function ResultsProvider({ children }: { children: React.ReactNode }) {
  const { isSpecialist } = useAuth();
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Only TTB staff get the full queue; applicants load just their own
  // submissions through the portal.
  useEffect(() => {
    if (!isSpecialist) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchResultsAction()
      .then((dbResults) => {
        if (!cancelled) setResults(dbResults);
      })
      .catch((err) => {
        console.error("Failed to load results on mount", err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSpecialist]);

  const addResult = useCallback(async (result: VerificationResult) => {
    setResults((prev) => [result, ...prev]);
    try {
      await saveResultAction(result);
    } catch (error) {
      setResults((prev) => prev.filter((r) => r.id !== result.id));
      throw error;
    }
  }, []);

  const addResults = useCallback(async (newResults: VerificationResult[]) => {
    if (newResults.length === 0) return;
    const ids = new Set(newResults.map((r) => r.id));
    setResults((prev) => [...newResults, ...prev]);
    try {
      await saveResultsAction(newResults);
    } catch (error) {
      setResults((prev) => prev.filter((r) => !ids.has(r.id)));
      throw error;
    }
  }, []);

  const updateResult = useCallback(
    (id: string, updates: Partial<VerificationResult>) => {
      setResults((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
      // If we needed to update general fields, we'd have an action here.
    },
    []
  );

  const addOverride = useCallback(
    (resultId: string, override: FieldOverride) => {
      setResults((prev) => {
        let newFields: VerificationResult["fields"] = [];

        const newResults = prev.map((r) => {
          if (r.id !== resultId) return r;
          const updatedFields = r.fields.map((f) => {
            if (f.fieldName !== override.fieldName) return f;
            return { ...f, status: override.overriddenStatus, override };
          });

          newFields = updatedFields;
          return { ...r, fields: updatedFields };
        });

        if (newFields.length > 0) {
          updateFieldsAction(resultId, newFields).catch(console.error);
        }

        return newResults;
      });
    },
    []
  );

  const updateAgentNotes = useCallback(
    (resultId: string, notes: string) => {
      setResults((prev) =>
        prev.map((r) => (r.id === resultId ? { ...r, agentNotes: notes } : r))
      );
      updateNotesAction(resultId, notes).catch(console.error);
    },
    []
  );

  const deleteResult = useCallback(async (id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
    await deleteResultAction(id);
  }, []);

  const updateCompanyName = useCallback(async (id: string, companyName: string) => {
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, companyName } : r))
    );
    await updateCompanyNameAction(id, companyName);
  }, []);

  const getResult = useCallback(
    (id: string) => results.find((r) => r.id === id),
    [results]
  );

  const clearResults = useCallback(() => {
    setResults([]);
    clearResultsAction().catch(console.error);
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayResults = results.filter(
      (r) => new Date(r.timestamp).toDateString() === today
    );
    return {
      total: results.length,
      approved: results.filter((r) => applicationStatus(r) === "approved").length,
      rejected: results.filter((r) => applicationStatus(r) === "rejected").length,
      pending: results.filter((r) => applicationStatus(r) === "pending").length,
      todayCount: todayResults.length,
      // Cumulative across all reviews — used for stakeholder impact metrics
      totalTimeSavedMs: results.reduce(
        (sum, r) => sum + (r.timeSavedMs ?? MANUAL_REVIEW_TIME_MS),
        0
      ),
      todayTimeSavedMs: todayResults.reduce(
        (sum, r) => sum + (r.timeSavedMs ?? MANUAL_REVIEW_TIME_MS),
        0
      ),
    };
  }, [results]);

  return (
    <ResultsContext.Provider
      value={{
        results,
        addResult,
        addResults,
        updateResult,
        addOverride,
        updateAgentNotes,
        deleteResult,
        updateCompanyName,
        getResult,
        clearResults,
        stats,
        isLoading
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
