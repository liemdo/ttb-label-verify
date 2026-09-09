"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AgentSelector } from "@/components/auth/agent-selector";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-zinc-950 to-indigo-950/20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo & title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-5 shadow-lg shadow-blue-500/20">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            TTB Label Verification
          </h1>
          <p className="text-zinc-400 mt-2 text-base">
            AI-Powered Alcohol Label Compliance Tool
          </p>
          <p className="text-zinc-600 mt-1 text-sm">
            Select your agent profile to sign in
          </p>
        </div>

        {/* Agent cards */}
        <AgentSelector />

        {/* Footer */}
        <p className="text-center text-xs text-zinc-700 mt-10">
          Alcohol and Tobacco Tax and Trade Bureau • Compliance Division •
          Prototype v1.0
        </p>
      </div>
    </div>
  );
}
