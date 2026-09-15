"use client";

import { useAuth } from "@/context/auth-context";
import type { Agent } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export function AgentSelector() {
  const { agents, login } = useAuth();
  const router = useRouter();

  const handleSelect = (agent: Agent) => {
    login(agent.id);
    router.push("/dashboard");
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {agents.map((agent) => (
        <Card
          key={agent.id}
          role="button"
          tabIndex={0}
          className="relative overflow-hidden cursor-pointer group border-border bg-muted/50 hover:bg-accent/50 hover:border-ring transition-all duration-200 p-0"
          onClick={() => handleSelect(agent)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleSelect(agent);
            }
          }}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 border-2 border-border group-hover:border-ring transition-colors">
                <AvatarFallback
                  className="text-sm font-bold text-white"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    {agent.name}
                  </h3>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Demo
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{agent.role}</p>
                <p className="text-xs text-muted-foreground mt-1">{agent.department}</p>
              </div>
            </div>
            {/* Gradient accent */}
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: `linear-gradient(90deg, ${agent.color}, transparent)`,
              }}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
