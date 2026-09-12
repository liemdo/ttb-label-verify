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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
      {agents.map((agent) => (
        <Card
          key={agent.id}
          className="relative overflow-hidden cursor-pointer group border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 p-0"
          onClick={() => handleSelect(agent)}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 border-2 border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors">
                <AvatarFallback
                  className="text-sm font-bold text-white"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {agent.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{agent.role}</p>
                <p className="text-xs text-zinc-600 mt-1">{agent.department}</p>
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
