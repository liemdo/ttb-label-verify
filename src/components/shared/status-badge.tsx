"use client";

import type { ReviewStatus, VerificationStatus } from "@/types";
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
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30",
  },
  fail: {
    label: "Fail",
    variant: "destructive",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
  },
  warning: {
    label: "Warning",
    variant: "secondary",
    icon: <AlertTriangle className="h-3 w-3" />,
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30",
  },
  not_checked: {
    label: "Not Checked",
    variant: "outline",
    icon: <MinusCircle className="h-3 w-3" />,
    className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30 hover:bg-zinc-500/30",
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
  verdict: "approved" | "rejected" | "needs_review";
}

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  const config = {
    approved: {
      label: "Approved",
      className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-500/20 text-red-300 border-red-500/40",
      icon: <XCircle className="h-4 w-4" />,
    },
    needs_review: {
      label: "Needs Review",
      className: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  };

  const c = config[verdict];
  return (
    <Badge variant="outline" className={`${c.className} text-sm px-3 py-1 inline-flex items-center gap-1.5 font-semibold`}>
      {c.icon}
      {c.label}
    </Badge>
  );
}

interface ReviewStatusBadgeProps {
  status: ReviewStatus;
}

export function ReviewStatusBadge({ status }: ReviewStatusBadgeProps) {
  if (status === "reviewed") {
    return (
      <Badge
        variant="outline"
        className="bg-zinc-500/15 text-zinc-300 border-zinc-500/30 text-xs px-2 py-0.5 inline-flex items-center gap-1 font-medium"
      >
        <CheckCircle2 className="h-3 w-3" />
        Specialist reviewed
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-blue-500/15 text-blue-300 border-blue-500/40 text-xs px-2 py-0.5 inline-flex items-center gap-1 font-medium"
    >
      <Clock className="h-3 w-3" />
      Awaiting review
    </Badge>
  );
}
