"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  /** If true, only fires when no input/textarea is focused */
  requireNoFocus?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        if (event.key.toLowerCase() === shortcut.key.toLowerCase()) {
          if (shortcut.requireNoFocus !== false && isInputFocused) {
            continue;
          }
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export const SHORTCUT_DEFINITIONS = [
  { key: "a", description: "Quick Approve" },
  { key: "r", description: "Quick Reject" },
  { key: "n", description: "Verify Another" },
  { key: "o", description: "Override first blocking field" },
  { key: "Escape", description: "Close Dialog" },
];
