"use client";

import { Keyboard } from "lucide-react";
import { SHORTCUT_DEFINITIONS } from "@/hooks/use-keyboard-shortcuts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function KeyboardHints() {
  return (
    <Tooltip>
      <TooltipTrigger className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <Keyboard className="h-3.5 w-3.5" />
        <span>Shortcuts</span>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end" className="w-56">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Keyboard Shortcuts</p>
          {SHORTCUT_DEFINITIONS.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">{s.description}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono border border-zinc-600">
                {s.key === "Escape" ? "Esc" : s.key.toUpperCase()}
              </kbd>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
