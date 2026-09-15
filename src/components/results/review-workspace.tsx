"use client";

import type { ReactNode } from "react";

export function ReviewWorkspace({
  title,
  subtitle,
  leading,
  trailing,
  children,
}: {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      data-detail-workspace
      className="h-full min-h-0 overflow-hidden flex flex-col gap-4 p-6 max-w-[90rem] mx-auto"
    >
      <div className="flex items-center gap-4 shrink-0">
        {leading}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle ? (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          ) : null}
        </div>
        {trailing}
      </div>
      {children}
    </div>
  );
}
