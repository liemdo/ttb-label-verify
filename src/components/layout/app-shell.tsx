"use client";

import { useAuth } from "@/context/auth-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main
          className={`flex-1 min-h-0 overflow-y-auto bg-background relative ${
            isAuthenticated ? "ml-64" : ""
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-background to-background pointer-events-none dark:from-zinc-900/40" />
          <div className="relative z-10 h-full min-h-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
