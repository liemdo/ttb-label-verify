"use client";

import { useAuth } from "@/context/auth-context";
import { useResults } from "@/context/results-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Card } from "@/components/ui/card";
import { VerdictBadge } from "@/components/shared/status-badge";
import { TotalTimeSaved } from "@/components/results/time-saved";
import Link from "next/link";
import {
  ScanSearch,
  Upload,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { agent } = useAuth();
  const { results, stats } = useResults();

  const recentResults = results.slice(0, 8);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {agent?.name?.split(" ")[0]}
        </h1>
        <p className="text-zinc-400 mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Reviewed Today"
          value={stats.todayCount}
          icon={<Clock className="h-5 w-5 text-blue-400" />}
          color="blue"
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
          color="emerald"
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={<XCircle className="h-5 w-5 text-red-400" />}
          color="red"
        />
        <StatCard
          label="Needs Review"
          value={stats.needsReview}
          icon={<AlertTriangle className="h-5 w-5 text-amber-400" />}
          color="amber"
        />
      </div>

      {/* Time saved — cumulative impact for stakeholders */}
      {stats.total > 0 && (
        <Card className="bg-emerald-500/5 border-emerald-500/20 p-5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 text-emerald-400" />
            </div>
            <TotalTimeSaved
              totalMs={stats.totalTimeSavedMs}
              labelCount={stats.total}
              todayMs={stats.todayTimeSavedMs}
              variant="banner"
            />
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/verify">
          <Card className="p-5 bg-zinc-900/50 border-zinc-800 hover:border-blue-500/40 hover:bg-zinc-800/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/15 flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
                <ScanSearch className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  Verify Label
                </p>
                <p className="text-xs text-zinc-500">Single label review</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/verify?mode=batch">
          <Card className="p-5 bg-zinc-900/50 border-zinc-800 hover:border-indigo-500/40 hover:bg-zinc-800/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/15 flex items-center justify-center group-hover:bg-indigo-500/25 transition-colors">
                <Upload className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  Batch Upload
                </p>
                <p className="text-xs text-zinc-500">Process multiple labels</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/guidelines">
          <Card className="p-5 bg-zinc-900/50 border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-800/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/15 flex items-center justify-center group-hover:bg-amber-500/25 transition-colors">
                <BookOpen className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  TTB Guidelines
                </p>
                <p className="text-xs text-zinc-500">Review requirements</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent activity */}
      {recentResults.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-200 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-2">
            {recentResults.map((r) => (
              <Link
                key={r.id}
                href={`/applications/${r.id}`}
                className="block"
              >
                <Card className="p-4 bg-zinc-900/30 border-zinc-800 hover:bg-zinc-800/30 hover:border-zinc-700 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0">
                        {r.imageDataUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.imageDataUrl}
                            alt={r.fileName}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-zinc-200">{r.fileName}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(r.timestamp).toLocaleString()} •{" "}
                          {r.ocrEngine === "openai" ? "AI" : "Tesseract"} •{" "}
                          {(r.processingTimeMs / 1000).toFixed(1)}s
                        </p>
                      </div>
                    </div>
                    <VerdictBadge verdict={r.overallVerdict} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentResults.length === 0 && (
        <Card className="p-12 bg-zinc-900/20 border-zinc-800 text-center">
          <ScanSearch className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No labels reviewed yet</p>
          <p className="text-xs text-zinc-600 mt-1">
            Start by verifying your first label
          </p>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="p-4 bg-zinc-900/50 border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        {icon}
      </div>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </Card>
  );
}
