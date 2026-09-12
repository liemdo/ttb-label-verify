"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AgentSelector } from "@/components/auth/agent-selector";
import { ApplicantSelector } from "@/components/auth/applicant-selector";
import { Building2, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { UserRole } from "@/types";

export default function LoginPage() {
  const { isAuthenticated, homeRoute } = useAuth();
  const router = useRouter();
  const [portal, setPortal] = useState<UserRole>("specialist");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(homeRoute);
    }
  }, [isAuthenticated, homeRoute, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/70 via-background to-indigo-100/40 pointer-events-none dark:from-blue-950/30 dark:via-zinc-950 dark:to-indigo-950/20" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo & title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-5 shadow-lg shadow-blue-500/20">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            TTB Label Verification
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-base">
            AI-Powered Alcohol Label Compliance Tool
          </p>
        </div>

        {/* Portal toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center bg-zinc-50 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setPortal("specialist")}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
                portal === "specialist"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <Shield className="h-4 w-4" />
              TTB Specialist
            </button>
            <button
              onClick={() => setPortal("applicant")}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
                portal === "applicant"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Applicant
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-600 mb-6">
          {portal === "specialist"
            ? "Select your agent profile to review submitted labels"
            : "Select your company to submit a label for review"}
        </p>

        {portal === "specialist" ? <AgentSelector /> : <ApplicantSelector />}

        {/* Footer */}
        <p className="text-center text-xs text-zinc-700 mt-10">
          Alcohol and Tobacco Tax and Trade Bureau • Compliance Division •
          Prototype v1.0
        </p>
      </div>
    </div>
  );
}
