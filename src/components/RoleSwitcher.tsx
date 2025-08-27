
"use client";

import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";

export default function RoleSwitcher() {
  const { role, setRole } = useAppContext();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      <Button
        onClick={() => setRole("player")}
        variant={role === "player" ? "default" : "ghost"}
        size="sm"
        className={`w-20 md:w-24 transition-all duration-300 ${role === 'player' ? 'bg-primary text-primary-foreground' : ''}`}
      >
        Player
      </Button>
      <Button
        onClick={() => setRole("coach")}
        variant={role === "coach" ? "default" : "ghost"}
        size="sm"
        className={`w-20 md:w-24 transition-all duration-300 ${role === 'coach' ? 'bg-primary text-primary-foreground' : ''}`}
      >
        Coach
      </Button>
    </div>
  );
}
