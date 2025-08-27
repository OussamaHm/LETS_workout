
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

interface WeekNavigatorProps {
    onPreviousWeek: () => void;
    onNextWeek: () => void;
    onCurrentWeek: () => void;
    weekRangeLabel: string;
    isMounted: boolean;
}

export default function WeekNavigator({ onPreviousWeek, onNextWeek, onCurrentWeek, weekRangeLabel, isMounted }: WeekNavigatorProps) {
    if (!isMounted) {
        return (
             <div className="flex items-center justify-center gap-4">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex flex-col items-center space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-md" />
            </div>
        )
    }
    
    return (
        <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="icon" onClick={onPreviousWeek}>
                <ChevronLeft />
            </Button>
            <div className="flex flex-col items-center">
                 <h2 className="text-lg font-semibold">{weekRangeLabel}</h2>
                <Button variant="link" size="sm" onClick={onCurrentWeek}>
                    Go to Current Week
                </Button>
            </div>
            <Button variant="outline" size="icon" onClick={onNextWeek}>
                <ChevronRight />
            </Button>
        </div>
    );
}
