import type { ApplicationStatus, VerificationStatus } from "@/types";
import { applicationReviewerName, applicationStatus } from "@/lib/application-status";
import type { VerificationResult } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, MinusCircle, PenLine, Clock } from "lucide-react";

const statusConfig: Record<
  VerificationStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; className: string }
> = {
  pass: {
    label: "Pass",
    variant: "default",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30",
  },
  fail: {
    label: "Fail",
    variant: "destructive",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30 hover:bg-red-500/30",
  },
  warning: {
    label: "Warning",
    variant: "secondary",
    icon: <AlertTriangle className="h-3 w-3" />,
    className: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/30",
  },
  not_checked: {
    label: "Not Checked",
    variant: "outline",
    icon: <MinusCircle className="h-3 w-3" />,
    className: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  },
};

interface StatusBadgeProps {
  status: VerificationStatus;
  overridden?: boolean;
  size?: "sm" | "md";
}

export function StatusBadge({ status, overridden, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={`${config.className} ${size === "sm" ? "text-xs px-1.5 py-0" : "text-xs px-2 py-0.5"} inline-flex items-center gap-1 font-medium`}
    >
      {overridden ? <PenLine className="h-3 w-3" /> : config.icon}
      {config.label}
      {overridden && <span className="text-[10px] opacity-70">(overridden)</span>}
    </Badge>
  );
}

interface VerdictBadgeProps {
  verdict: ApplicationStatus | "needs_review";
}

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  const status: ApplicationStatus = verdict === "needs_review" ? "pending" : verdict;
  const config = {
    pending: {
      label: "Pending review",
      className: "bg-primary/15 text-primary border-primary/40",
      icon: <Clock className="h-4 w-4" />,
    },
    approved: {
      label: "Approved",
      className: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40",
      icon: <XCircle className="h-4 w-4" />,
    },
  };

  const c = config[status];
  return (
    <Badge variant="outline" className={`${c.className} text-sm px-3 py-1 inline-flex items-center gap-1.5 font-semibold`}>
      {c.icon}
      {c.label}
    </Badge>
  );
}

export function ApplicationStatusBadge({
  result,
}: {
  result: Pick<VerificationResult, "overallVerdict" | "reviewStatus">;
}) {
  return <VerdictBadge verdict={applicationStatus(result)} />;
}

export function ApprovedByLine({
  result,
  className = "",
}: {
  result: Pick<VerificationResult, "overallVerdict" | "reviewStatus" | "agentName">;
  className?: string;
}) {
  const status = applicationStatus(result);
  if (status !== "approved" && status !== "rejected") return null;
  const name = applicationReviewerName(result.agentName);
  if (!name) return null;

  return (
    <p className={`text-xs text-muted-foreground ${className}`.trim()}>
      {status === "approved" ? "Approved" : "Rejected"} by{" "}
      <span className="font-medium text-foreground">{name}</span>
    </p>
  );
}
