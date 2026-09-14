"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Agent, Applicant, UserRole } from "@/types";
import { AGENTS, APPLICANTS } from "@/lib/constants";
import { PageLoading } from "@/components/shared/page-loading";

const SESSION_KEY = "ttb-session";

interface StoredSession {
  role: UserRole;
  id: string;
}

interface AuthContextType {
  /** Set only when a TTB specialist is signed in. */
  agent: Agent | null;
  /** Set only when a company applicant is signed in. */
  applicant: Applicant | null;
  agents: Agent[];
  applicants: Applicant[];
  role: UserRole | null;
  isSpecialist: boolean;
  isApplicant: boolean;
  login: (agentId: string) => void;
  loginAsApplicant: (applicantId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  /** Landing route for whoever is signed in. */
  homeRoute: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredSession;
        if (parsed.role === "applicant") {
          const found = APPLICANTS.find((a) => a.id === parsed.id);
          if (found) setApplicant(found);
        } else {
          const found = AGENTS.find((a) => a.id === parsed.id);
          if (found) setAgent(found);
        }
      } catch {
        // ignore invalid data
      }
    }
    setIsHydrated(true);
  }, []);

  const login = useCallback((agentId: string) => {
    const found = AGENTS.find((a) => a.id === agentId);
    if (found) {
      setApplicant(null);
      setAgent(found);
      const session: StoredSession = { role: "specialist", id: found.id };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  }, []);

  const loginAsApplicant = useCallback((applicantId: string) => {
    const found = APPLICANTS.find((a) => a.id === applicantId);
    if (found) {
      setAgent(null);
      setApplicant(found);
      const session: StoredSession = { role: "applicant", id: found.id };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  }, []);

  const logout = useCallback(() => {
    setAgent(null);
    setApplicant(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  if (!isHydrated) {
    return <PageLoading message="Loading..." />;
  }

  const role: UserRole | null = agent ? "specialist" : applicant ? "applicant" : null;

  return (
    <AuthContext.Provider
      value={{
        agent,
        applicant,
        agents: AGENTS,
        applicants: APPLICANTS,
        role,
        isSpecialist: role === "specialist",
        isApplicant: role === "applicant",
        login,
        loginAsApplicant,
        logout,
        isAuthenticated: role !== null,
        homeRoute: role === "applicant" ? "/portal" : "/dashboard",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
