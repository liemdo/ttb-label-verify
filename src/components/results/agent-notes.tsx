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
        <MessageSquare className="h-4 w-4 text-zinc-500" />
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Agent Notes</span>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add notes about this review — observations, nuance, or reasons for your decision..."
        className="bg-zinc-100 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-600 min-h-[80px] text-sm"
      />
      {isDirty && (
        <Button
          onClick={handleSave}
          size="sm"
          variant="outline"
          className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 gap-1.5"
        >
          <Save className="h-3 w-3" />
          Save Notes
        </Button>
      )}
    </div>
  );
}
