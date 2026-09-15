"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

const THEME_OPTIONS = [
  {
    value: "light",
    label: "Light",
    description: "Always use light mode",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Always use dark mode",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Match your computer",
    icon: Monitor,
  },
] as const;

interface ThemeToggleProps {
  className?: string;
  menuSide?: "top" | "bottom";
}

export function ThemeToggle({ className, menuSide = "top" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const current =
    THEME_OPTIONS.find((option) => option.value === theme) ?? THEME_OPTIONS[0];
  const CurrentIcon = current.icon;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((prev) => !prev)}
        disabled={!mounted}
        className="h-8 w-full justify-start gap-2 border-border bg-background text-foreground hover:bg-accent"
        title="Choose appearance"
        aria-label="Choose appearance"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="text-xs">{mounted ? current.label : "Theme"}</span>
      </Button>

      {open && mounted && (
        <div
          role="listbox"
          aria-label="Appearance"
          className={cn(
            "absolute z-20 min-w-[12.5rem] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md",
            menuSide === "top"
              ? "bottom-full left-0 mb-2"
              : "top-full right-0 mt-2"
          )}
        >
          {THEME_OPTIONS.map((option) => {
            const selected = theme === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors",
                  selected
                    ? "bg-accent text-foreground"
                    : "text-foreground hover:bg-accent/70"
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium">{option.label}</span>
                  <span className="block text-[11px] text-muted-foreground leading-snug">
                    {option.description}
                  </span>
                </span>
                {selected && (
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
