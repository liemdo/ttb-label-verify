"use client";

import { useAuth } from "@/context/auth-context";
import { useResults } from "@/context/results-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PageLoading } from "@/components/shared/page-loading";
import { Card } from "@/components/ui/card";
import { ApplicationStatusBadge, ApprovedByLine } from "@/components/shared/status-badge";
import { TotalTimeSaved } from "@/components/results/time-saved";
import { labelImageSrc } from "@/lib/blob";
import Link from "next/link";
import {
  ScanSearch,
  Upload,
  BookOpen,
  CheckCircle2,
  XCircle,
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
  const { results, stats, isLoading } = useResults();

  if (isLoading) {
    return <PageLoading message="Loading applications..." />;
  }

  const recentResults = results.slice(0, 8);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {agent?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
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
          label="Pending review"
          value={stats.pending}
          icon={<Clock className="h-5 w-5 text-amber-400" />}
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
          <Card className="p-5 bg-muted/50 border-border hover:border-primary/40 hover:bg-accent/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                <ScanSearch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Verify Label
                </p>
                <p className="text-xs text-muted-foreground">Single label review</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/verify?mode=batch">
          <Card className="p-5 bg-muted/50 border-border hover:border-primary/40 hover:bg-accent/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Batch Upload
                </p>
                <p className="text-xs text-muted-foreground">Process multiple labels</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/guidelines">
          <Card className="p-5 bg-muted/50 border-border hover:border-amber-500/40 hover:bg-accent/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/15 flex items-center justify-center group-hover:bg-amber-500/25 transition-colors">
                <BookOpen className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  TTB Guidelines
                </p>
                <p className="text-xs text-muted-foreground">Review requirements</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent activity */}
      {recentResults.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Activity
          </h2>
          <div className="space-y-2">
            {recentResults.map((r) => (
              <Link
                key={r.id}
                href={`/applications/${r.id}`}
                className="block"
              >
                <Card className="p-4 bg-muted/30 border-border hover:bg-accent/50 hover:border-border transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted border border-border overflow-hidden shrink-0">
                        {r.imageDataUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={labelImageSrc(r.imageDataUrl)}
                            alt={r.fileName}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-foreground">{r.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.timestamp).toLocaleString()} •{" "}
                          {r.ocrEngine === "openai" ? "AI" : "Tesseract"} •{" "}
                          {(r.processingTimeMs / 1000).toFixed(1)}s
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <ApplicationStatusBadge result={r} />
                      <ApprovedByLine result={r} />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentResults.length === 0 && (
        <Card className="p-12 bg-muted/20 border-border text-center">
          <ScanSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No labels reviewed yet</p>
          <p className="text-xs text-muted-foreground mt-1">
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
    <Card className="p-4 bg-muted/50 border-border">
      <div className="flex items-center justify-between mb-2">
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </Card>
  );
}
