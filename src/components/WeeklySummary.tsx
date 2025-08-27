
"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { BarChart, NotepadText, TrendingUp, Weight } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";
import { Note, Log } from "@/lib/types";

interface WeeklySummaryProps {
    weekDates: Date[];
    isMounted: boolean;
}

const getValues = <T,>(obj: Record<string, T> | T[] | undefined): T[] => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    return Object.values(obj);
};

export default function WeeklySummary({ weekDates, isMounted }: WeeklySummaryProps) {
    const { data } = useAppContext();

    const summary = useMemo(() => {
        let totalSets = 0;
        let totalReps = 0;
        let totalVolume = 0;
        let totalNotes = 0;

        weekDates.forEach(date => {
            const dateString = format(date, "yyyy-MM-dd");
            const dayData = data[dateString];
            if (dayData) {
                const logs: Log[] = getValues(dayData.logs);
                logs.forEach(log => {
                    totalSets += log.actualSets;
                    totalReps += log.actualReps;
                    const logVolume = log.weights.reduce((sum, weight) => {
                         // Assuming reps per set is constant from the plan
                        return sum + (weight || 0) * log.targetReps;
                    }, 0);
                    totalVolume += logVolume;
                });

                const notes: Note[] = getValues(dayData.notes);
                totalNotes += notes.length;
            }
        });

        return { totalSets, totalReps, totalVolume, totalNotes };
    }, [data, weekDates]);

    if (!isMounted || weekDates.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                        <BarChart className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Total Sets</p>
                            <p className="text-2xl font-bold">{summary.totalSets}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Total Reps</p>
                            <p className="text-2xl font-bold">{summary.totalReps * summary.totalSets}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                        <Weight className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Total Volume (kg)</p>
                            <p className="text-2xl font-bold">{summary.totalVolume.toFixed(0)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                        <NotepadText className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Total Notes</p>
                            <p className="text-2xl font-bold">{summary.totalNotes}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
