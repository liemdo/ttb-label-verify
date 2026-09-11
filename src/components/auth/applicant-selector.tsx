"use client";

import { useAuth } from "@/context/auth-context";
import type { Applicant } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export function ApplicantSelector() {
  const { applicants, loginAsApplicant } = useAuth();
  const router = useRouter();

  const handleSelect = (applicant: Applicant) => {
    loginAsApplicant(applicant.id);
    router.push("/portal");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
      {applicants.map((applicant) => (
        <Card
          key={applicant.id}
          className="relative overflow-hidden cursor-pointer group border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-600 transition-all duration-200 p-0"
          onClick={() => handleSelect(applicant)}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 border-2 border-zinc-700 group-hover:border-zinc-500 transition-colors">
                <AvatarFallback
                  className="text-sm font-bold text-white"
                  style={{ backgroundColor: applicant.color }}
                >
                  {applicant.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-zinc-100 group-hover:text-white transition-colors">
                  {applicant.companyName}
                </h3>
                <p className="text-sm text-zinc-400 mt-0.5">{applicant.contactName}</p>
                <p className="text-xs text-zinc-600 mt-1">{applicant.role}</p>
              </div>
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: `linear-gradient(90deg, ${applicant.color}, transparent)`,
              }}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
