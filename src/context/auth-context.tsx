"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Agent } from "@/types";
import { AGENTS } from "@/lib/constants";

interface AuthContextType {
  agent: Agent | null;
  agents: Agent[];
  login: (agentId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("ttb-agent");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const found = AGENTS.find((a) => a.id === parsed.id);
        if (found) setAgent(found);
      } catch {
        // ignore invalid data
      }
    }
    setIsHydrated(true);
  }, []);

  const login = useCallback((agentId: string) => {
    const found = AGENTS.find((a) => a.id === agentId);
    if (found) {
      setAgent(found);
      sessionStorage.setItem("ttb-agent", JSON.stringify(found));
    }
  }, []);

  const logout = useCallback(() => {
    setAgent(null);
    sessionStorage.removeItem("ttb-agent");
  }, []);

  // Don't render children until hydrated to avoid flicker
  if (!isHydrated) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        agent,
        agents: AGENTS,
        login,
        logout,
        isAuthenticated: !!agent,
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
