"use client";

import { useState } from "react";
import type { VerificationStatus, FieldOverride } from "@/types";
import { useAuth } from "@/context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldName: string;
  fieldDisplayName: string;
  currentStatus: VerificationStatus;
  onSubmit: (override: FieldOverride) => void;
}

export function OverrideDialog({
  open,
  onOpenChange,
  fieldName,
  fieldDisplayName,
  currentStatus,
  onSubmit,
}: OverrideDialogProps) {
  const { agent } = useAuth();
  const [newStatus, setNewStatus] = useState<VerificationStatus>("pass");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!agent || reason.trim().length < 10) return;

    onSubmit({
      fieldName,
      originalStatus: currentStatus,
      overriddenStatus: newStatus,
      reason: reason.trim(),
      agentId: agent.id,
      agentName: agent.name,
      timestamp: new Date().toISOString(),
    });

    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            Override: {fieldDisplayName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-zinc-400 text-xs">Current Status</Label>
            <p className="text-sm text-zinc-300 capitalize mt-1">
              {currentStatus.replace("_", " ")}
            </p>
          </div>

          <div>
            <Label className="text-zinc-400 text-xs">New Status</Label>
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as VerificationStatus)}
            >
              <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-zinc-400 text-xs">
              Reason for Override (min. 10 characters)
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you're overriding the AI result..."
              className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-600 min-h-[80px]"
            />
            {reason.length > 0 && reason.length < 10 && (
              <p className="text-xs text-red-400 mt-1">
                {10 - reason.length} more characters required
              </p>
            )}
          </div>

          {agent && (
            <p className="text-xs text-zinc-500">
              Overriding as <span className="text-zinc-400">{agent.name}</span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-zinc-400"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={reason.trim().length < 10}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Apply Override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
