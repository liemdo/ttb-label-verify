"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AgentSelector } from "@/components/auth/agent-selector";
import { ApplicantSelector } from "@/components/auth/applicant-selector";
import { Building2, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { PageLoading } from "@/components/shared/page-loading";
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

  if (isAuthenticated) {
    return <PageLoading message="Signing you in..." />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-background to-secondary/60 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo & title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-5 shadow-lg">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            TTB Label Verification
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            AI-Powered Alcohol Label Compliance Tool
          </p>
        </div>

        {/* Portal toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center bg-muted rounded-lg p-1 border border-border">
            <button
              onClick={() => setPortal("specialist")}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
                portal === "specialist"
                  ? "bg-card text-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="h-4 w-4" />
              TTB Specialist
            </button>
            <button
              onClick={() => setPortal("applicant")}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
                portal === "applicant"
                  ? "bg-card text-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Applicant
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mb-6">
          {portal === "specialist"
            ? "These are demo users. Pick a specialist to try reviewing submitted labels."
            : "These are demo companies. Pick one to try submitting a label for review."}
        </p>

        {portal === "specialist" ? <AgentSelector /> : <ApplicantSelector />}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-10">
          Alcohol and Tobacco Tax and Trade Bureau • Compliance Division •
          Prototype v1.0
        </p>
      </div>
    </div>
  );
}
