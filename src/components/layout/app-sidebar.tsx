"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useSettings } from "@/context/settings-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { KeyboardHints } from "@/components/shared/keyboard-hints";
import {
  LayoutDashboard,
  ScanSearch,
  BookOpen,
  Settings,
  LogOut,
  Shield,
  Cpu,
  Bot,
  FolderOpen,
  Building2,
  Upload,
} from "lucide-react";

const specialistNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: FolderOpen },
  { href: "/applicants", label: "Applicants", icon: Building2 },
  { href: "/verify", label: "Verify Label", icon: ScanSearch },
  { href: "/guidelines", label: "TTB Guidelines", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

const applicantNav = [
  { href: "/portal", label: "My Submissions", icon: FolderOpen },
  { href: "/portal/submit", label: "Submit Label", icon: Upload },
  { href: "/guidelines", label: "TTB Guidelines", icon: BookOpen },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { agent, applicant, isApplicant, isSpecialist, logout } = useAuth();
  const { settings } = useSettings();

  if (!agent && !applicant) return null;

  const navItems = isApplicant ? applicantNav : specialistNav;

  // "/portal" would otherwise stay highlighted while on "/portal/submit"
  const isNavActive = (href: string) =>
    href === "/portal" || href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const displayName = isApplicant ? applicant!.companyName : agent!.name;
  const displaySubtitle = isApplicant ? applicant!.contactName : agent!.role;
  const avatarColor = isApplicant ? applicant!.color : agent!.color;
  const initials = isApplicant ? applicant!.initials : agent!.initials;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col z-50">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-sm">
            <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight">TTB Label Verify</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              {isApplicant ? "Applicant Portal" : "Compliance Tool"}
            </p>
          </div>
        </div>
      </div>

      {/* OCR mode is an internal detail, so applicants don't see it */}
      {!isApplicant && (
        <div className="px-4 py-2.5 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-xs">
            {settings.ocrEngine === "openai" ? (
              <>
                <Bot className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-muted-foreground">AI Mode</span>
                <span className="text-emerald-400 font-medium">GPT-4o</span>
              </>
            ) : (
              <>
                <Cpu className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-muted-foreground">Offline Mode</span>
                <span className="text-amber-400 font-medium">Tesseract</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = isNavActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/70"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-sidebar-accent-foreground" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-3">
        <div className="relative flex items-center gap-2">
          <ThemeToggle className="flex-1" />
          {isSpecialist && <KeyboardHints />}
        </div>
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-8 w-8 border border-sidebar-border">
            <AvatarFallback
              className="text-xs font-bold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{displaySubtitle}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
