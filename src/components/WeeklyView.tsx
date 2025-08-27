
"use client";

import DayCard from "./DayCard";
import { Skeleton } from "./ui/skeleton";

interface WeeklyViewProps {
  weekDates: Date[];
  isMounted: boolean;
}

export default function WeeklyView({ weekDates, isMounted }: WeeklyViewProps) {

  if (!isMounted || weekDates.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {weekDates.map((date) => (
        <DayCard key={date.toISOString()} date={date} />
      ))}
    </div>
  );
}
