"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Save } from "lucide-react";

interface AgentNotesProps {
  notes?: string;
  onSave: (notes: string) => void;
}

export function AgentNotes({ notes: initialNotes, onSave }: AgentNotesProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (value: string) => {
    setNotes(value);
    setIsDirty(value !== (initialNotes || ""));
  };

  const handleSave = () => {
    onSave(notes);
    setIsDirty(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Agent Notes</span>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add notes about this review — observations, nuance, or reasons for your decision..."
        className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground min-h-[80px] text-sm"
      />
      {isDirty && (
        <Button
          onClick={handleSave}
          size="sm"
          variant="outline"
          className="border-border text-foreground hover:bg-accent gap-1.5"
        >
          <Save className="h-3 w-3" />
          Save Notes
        </Button>
      )}
    </div>
  );
}
