
"use client";

import WeeklyView from "@/components/WeeklyView";
import WeeklySummary from "@/components/WeeklySummary";
import { useWeek } from "@/lib/hooks";
import WeekNavigator from "@/components/layout/WeekNavigator";

export default function WeeklyPage() {
  const { 
    weekDates, 
    goToNextWeek, 
    goToPreviousWeek, 
    goToCurrentWeek,
    getWeekRangeLabel,
    isMounted,
  } = useWeek();
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <WeekNavigator 
            onNextWeek={goToNextWeek}
            onPreviousWeek={goToPreviousWeek}
            onCurrentWeek={goToCurrentWeek}
            weekRangeLabel={getWeekRangeLabel()}
            isMounted={isMounted}
        />
        <WeeklySummary weekDates={weekDates} isMounted={isMounted} />
        <WeeklyView weekDates={weekDates} isMounted={isMounted} />
      </div>
    </div>
  );
}
