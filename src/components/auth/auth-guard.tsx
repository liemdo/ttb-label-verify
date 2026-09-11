"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { UserRole } from "@/types";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Roles permitted to view the page. Defaults to TTB staff only. */
  allow?: UserRole[];
}

export function AuthGuard({ children, allow = ["specialist"] }: AuthGuardProps) {
  const { isAuthenticated, role, homeRoute } = useAuth();
  const router = useRouter();

  const isPermitted = isAuthenticated && role !== null && allow.includes(role);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!isPermitted) {
      // Signed in, but this page belongs to the other role
      router.replace(homeRoute);
    }
  }, [isAuthenticated, isPermitted, homeRoute, router]);

  if (!isPermitted) return null;

  return <>{children}</>;
}
