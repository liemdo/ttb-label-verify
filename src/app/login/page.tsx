"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { AgentSelector } from "@/components/auth/agent-selector";
import { ApplicantSelector } from "@/components/auth/applicant-selector";
import { Building2, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { PageLoading } from "@/components/shared/page-loading";

export default function LoginPage() {
  const { isAuthenticated, homeRoute } = useAuth();
  const router = useRouter();

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
        <ThemeToggle menuSide="bottom" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-background to-secondary/60 pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">
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

        <p className="text-center text-sm text-muted-foreground mb-6">
          Demo accounts. Pick a specialist or an applicant to continue.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="space-y-3">
            <h2 className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
              <Shield className="h-4 w-4" />
              TTB Specialist
            </h2>
            <AgentSelector />
          </section>
          <section className="space-y-3">
            <h2 className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
              <Building2 className="h-4 w-4" />
              Applicant
            </h2>
            <ApplicantSelector />
          </section>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          Alcohol and Tobacco Tax and Trade Bureau • Compliance Division •
          Prototype v1.0
        </p>
      </div>
    </div>
  );
}
