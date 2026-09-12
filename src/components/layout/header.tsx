"use client";

import { useAuth } from "@/context/auth-context";
import { KeyboardHints } from "@/components/shared/keyboard-hints";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Header() {
  const { isAuthenticated, isSpecialist } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 ml-64">
      <div />
      <div className="flex items-center gap-3">
        {/* Shortcuts only apply to the specialist review workflow */}
        {isSpecialist && <KeyboardHints />}
        <ThemeToggle />
      </div>
    </header>
  );
}
