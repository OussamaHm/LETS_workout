
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { PlayCircle, StopCircle, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";

interface SessionTimerProps {
  date: Date;
}

const formatDuration = (seconds: number) => {
  if (seconds < 0) return "00:00:00";
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export default function SessionTimer({ date }: SessionTimerProps) {
  const { role, data, startSession, stopSession } = useAppContext();
  const dateString = format(date, "yyyy-MM-dd");
  const dayData = data[dateString];
  
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (dayData?.sessionStart && !dayData.sessionEnd) {
      // Session is active, update timer every second
      interval = setInterval(() => {
        const now = Date.now();
        const start = dayData.sessionStart || now;
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
    } else if (dayData?.sessionStart && dayData.sessionEnd) {
      // Session is finished, calculate final duration
      const duration = Math.floor((dayData.sessionEnd - dayData.sessionStart) / 1000);
      setElapsedTime(duration);
    } else {
      // No session started
      setElapsedTime(0);
    }

    return () => clearInterval(interval);
  }, [dayData]);

  if (role !== "player") {
    return null;
  }
  
  const handleStart = () => {
    startSession(dateString);
  };

  const handleStop = () => {
    stopSession(dateString);
  };

  const isSessionRunning = dayData?.sessionStart && !dayData.sessionEnd;
  const isSessionFinished = dayData?.sessionStart && dayData.sessionEnd;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 font-semibold">
            <Timer className="h-5 w-5 text-primary" />
            <h3>Session Timer</h3>
        </div>
        <div className="flex items-center justify-between gap-4">
            <div className="text-3xl font-mono text-foreground">
                {formatDuration(elapsedTime)}
            </div>
            <div className="flex gap-2">
            {!isSessionRunning && !isSessionFinished && (
                <Button onClick={handleStart} size="sm">
                    <PlayCircle className="mr-2 h-4 w-4" /> Start
                </Button>
            )}
            {isSessionRunning && (
                <Button onClick={handleStop} variant="destructive" size="sm">
                    <StopCircle className="mr-2 h-4 w-4" /> Stop
                </Button>
            )}
            </div>
        </div>
        {isSessionFinished && (
            <p className="text-sm text-muted-foreground">
                Session completed. Great work!
            </p>
        )}
    </div>
  );
}
