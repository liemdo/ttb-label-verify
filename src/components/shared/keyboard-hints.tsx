"use client";

import { useEffect, useRef, useState } from "react";
import { Keyboard } from "lucide-react";
import { SHORTCUT_DEFINITIONS } from "@/hooks/use-keyboard-shortcuts";

export function KeyboardHints() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent aria-expanded:bg-accent aria-expanded:text-foreground"
      >
        <Keyboard className="h-3.5 w-3.5" />
        <span>Shortcuts</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Keyboard shortcuts"
          className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md z-10"
        >
          <p className="px-0.5 mb-2 text-xs font-semibold text-foreground">
            Keyboard shortcuts
          </p>
          <div className="space-y-0.5">
            {SHORTCUT_DEFINITIONS.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between gap-3 rounded-md px-0.5 py-1 text-xs"
              >
                <span className="text-muted-foreground">{shortcut.description}</span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground text-[10px] font-mono border border-border">
                  {shortcut.key === "Escape" ? "Esc" : shortcut.key.toUpperCase()}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
