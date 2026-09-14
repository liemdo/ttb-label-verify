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
    if (!agent) return;

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
      <DialogContent className="bg-muted border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Override: {fieldDisplayName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-muted-foreground text-xs">Current Status</Label>
            <p className="text-sm text-foreground capitalize mt-1">
              {currentStatus.replace("_", " ")}
            </p>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">New Status</Label>
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as VerificationStatus)}
            >
              <SelectTrigger className="mt-1 bg-muted border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-muted border-border">
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">
              Reason for Override <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optionally explain why you're overriding the AI result..."
              className="mt-1 bg-muted border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
            />
          </div>

          {agent && (
            <p className="text-xs text-muted-foreground">
              Overriding as <span className="text-muted-foreground">{agent.name}</span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!agent}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Apply Override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
