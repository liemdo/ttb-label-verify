"use client";

import { useAuth } from "@/context/auth-context";
import { KeyboardHints } from "@/components/shared/keyboard-hints";

export function Header() {
  const { agent } = useAuth();

  if (!agent) return null;

  return (
    <header className="sticky top-0 z-40 h-14 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-6 ml-64">
      <div />
      <div className="flex items-center gap-3">
        <KeyboardHints />
      </div>
    </header>
  );
}
