
"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Save, User } from "lucide-react";
import { Skeleton } from './ui/skeleton';

export default function PlayerName() {
  const { playerName, setPlayerName, role } = useAppContext();
  const [name, setName] = useState(playerName);
  const [isEditing, setIsEditing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setName(playerName);
  }, [playerName]);

  const handleSave = () => {
    setPlayerName(name);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setName(playerName);
      setIsEditing(false);
    }
  }

  if (!isMounted) {
    return (
        <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    );
  }
  
  if (role === 'coach') {
    return (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{playerName}</span>
        </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-9 w-32"
          autoFocus
        />
        <Button size="icon" className="h-9 w-9" onClick={handleSave}>
          <Save />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{name}</span>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
        <Edit />
      </Button>
    </div>
  );
}
