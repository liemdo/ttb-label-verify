"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useSettings } from "@/context/settings-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  ScanSearch,
  BookOpen,
  History,
  Settings,
  LogOut,
  Shield,
  Cpu,
  Bot,
  FolderOpen,
  Upload,
} from "lucide-react";

const specialistNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: FolderOpen },
  { href: "/verify", label: "Verify Label", icon: ScanSearch },
  { href: "/guidelines", label: "TTB Guidelines", icon: BookOpen },
  { href: "/history", label: "Review History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

const applicantNav = [
  { href: "/portal", label: "My Submissions", icon: FolderOpen },
  { href: "/portal/submit", label: "Submit Label", icon: Upload },
  { href: "/guidelines", label: "TTB Guidelines", icon: BookOpen },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { agent, applicant, isApplicant, logout } = useAuth();
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
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-50">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">TTB Label Verify</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              {isApplicant ? "Applicant Portal" : "Compliance Tool"}
            </p>
          </div>
        </div>
      </div>

      {/* OCR mode is an internal detail, so applicants don't see it */}
      {!isApplicant && (
        <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs">
            {settings.ocrEngine === "openai" ? (
              <>
                <Bot className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-zinc-500 dark:text-zinc-400">AI Mode</span>
                <span className="text-emerald-400 font-medium">GPT-4o</span>
              </>
            ) : (
              <>
                <Cpu className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-zinc-500 dark:text-zinc-400">Offline Mode</span>
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
                  ? "bg-blue-500/15 text-blue-400 font-medium"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-blue-400" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="px-3 py-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-8 w-8 border border-zinc-300 dark:border-zinc-700">
            <AvatarFallback
              className="text-xs font-bold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{displayName}</p>
            <p className="text-[11px] text-zinc-500 truncate">{displaySubtitle}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
