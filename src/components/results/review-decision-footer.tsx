"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { applicationStatus, unresolvedReviewFields } from "@/lib/application-status";
import type { ApplicationStatus, VerificationResult } from "@/types";
import { CheckCircle2, ChevronDown, XCircle } from "lucide-react";

interface ReviewDecisionFooterProps {
  result: VerificationResult;
  onDecide: (decision: ApplicationStatus) => void;
  isDeciding: ApplicationStatus | null;
}

const OVERRIDE_LABELS: Record<ApplicationStatus, string> = {
  pending: "Set to pending review",
  approved: "Approve anyway",
  rejected: "Reject",
};

export function ReviewDecisionFooter({
  result,
  onDecide,
  isDeciding,
}: ReviewDecisionFooterProps) {
  const current = applicationStatus(result);
  const blockingFields = unresolvedReviewFields(result.fields);
  const canApprove = blockingFields.length === 0;
  const primary: Exclude<ApplicationStatus, "pending"> = canApprove
    ? "approved"
    : "rejected";
  const primaryIsCurrent = current === primary;
  const overrideOptions = (
    ["pending", "approved", "rejected"] as const
  ).filter((status) => status !== primary);

  return (
    <div className="flex flex-col gap-3">
      {canApprove ? (
        <p className="text-sm text-foreground">
          All checked fields pass. This application can be approved.
        </p>
      ) : (
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {blockingFields.length}{" "}
            {blockingFields.length === 1 ? "field needs" : "fields need"}{" "}
            to be resolved to approve
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {blockingFields.map((field) => field.displayName).join(", ")}
          </p>
        </div>
      )}
      <div className="flex items-stretch gap-2">
        <Button
          type="button"
          onClick={() => onDecide(primary)}
          disabled={isDeciding !== null || primaryIsCurrent}
          className={
            canApprove
              ? "bg-emerald-600 hover:bg-emerald-700 text-white gap-2 flex-1"
              : "bg-red-600 hover:bg-red-700 text-white gap-2 flex-1"
          }
        >
          {canApprove ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {isDeciding === primary
            ? canApprove
              ? "Approving..."
              : "Rejecting..."
            : primaryIsCurrent
              ? canApprove
                ? "Approved"
                : "Rejected"
              : canApprove
                ? "Approve"
                : "Reject"}
        </Button>
        <OverrideStatusMenu
          options={overrideOptions.map((value) => ({
            value,
            label:
              value === "approved" && !canApprove
                ? OVERRIDE_LABELS.approved
                : value === "rejected"
                  ? OVERRIDE_LABELS.rejected
                  : OVERRIDE_LABELS.pending,
          }))}
          current={current}
          disabled={isDeciding !== null}
          onChange={onDecide}
        />
      </div>
    </div>
  );
}

function OverrideStatusMenu({
  options,
  current,
  disabled,
  onChange,
}: {
  options: { value: ApplicationStatus; label: string }[];
  current: ApplicationStatus;
  disabled?: boolean;
  onChange: (status: ApplicationStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ bottom: 0, right: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPos({
        bottom: window.innerHeight - rect.top + 4,
        right: window.innerWidth - rect.right,
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const timer = window.setTimeout(() => {
      window.addEventListener("pointerdown", onPointerDown);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Override status"
        title="Override status"
        className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-50 aria-expanded:bg-muted"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      {mounted &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-label="Override application status"
            style={{ bottom: pos.bottom, right: pos.right }}
            className="fixed z-50 min-w-48 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
          >
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Override status
            </p>
            {options.map((option) => {
              const selected = option.value === current;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={selected}
                  onClick={() => {
                    setOpen(false);
                    if (!selected) onChange(option.value);
                  }}
                  className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-accent disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  {option.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
