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
          className="relative overflow-hidden cursor-pointer group border-border bg-muted/50 hover:bg-accent/50 hover:border-ring transition-all duration-200 p-0"
          onClick={() => handleSelect(applicant)}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 border-2 border-border group-hover:border-ring transition-colors">
                <AvatarFallback
                  className="text-sm font-bold text-white"
                  style={{ backgroundColor: applicant.color }}
                >
                  {applicant.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    {applicant.companyName}
                  </h3>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Demo
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{applicant.contactName}</p>
                <p className="text-xs text-muted-foreground mt-1">{applicant.role}</p>
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
