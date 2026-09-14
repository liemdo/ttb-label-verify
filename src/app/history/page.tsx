"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { PageLoading } from "@/components/shared/page-loading";
import { useResults } from "@/context/results-context";
import { BatchResults } from "@/components/results/batch-results";
import { Card } from "@/components/ui/card";
import { History as HistoryIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  return (
    <AuthGuard>
      <HistoryContent />
    </AuthGuard>
  );
}

function HistoryContent() {
  const { results, clearResults, isLoading } = useResults();

  if (isLoading) {
    return <PageLoading message="Loading history..." />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review History</h1>
          <p className="text-muted-foreground mt-1">Complete log of all verified labels and manual overrides</p>
        </div>
        {results.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearResults}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>

      {results.length > 0 ? (
        <BatchResults results={results} />
      ) : (
        <Card className="p-16 bg-muted/30 border-border text-center flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <HistoryIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No History</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Your verification history is empty. When you verify labels, they will appear here.
          </p>
        </Card>
      )}
    </div>
  );
}
