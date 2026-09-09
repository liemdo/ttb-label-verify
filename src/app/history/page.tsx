"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
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
  const { results, clearResults } = useResults();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Review History</h1>
          <p className="text-zinc-400 mt-1">Complete log of all verified labels and manual overrides</p>
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
        <Card className="p-16 bg-zinc-900/30 border-zinc-800 text-center flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
            <HistoryIcon className="h-8 w-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-medium text-zinc-300">No History</h3>
          <p className="text-sm text-zinc-500 mt-2 max-w-sm">
            Your verification history is empty. When you verify labels, they will appear here.
          </p>
        </Card>
      )}
    </div>
  );
}
