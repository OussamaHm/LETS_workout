
"use client";

import { useState } from "react";
import { format, getDay } from "date-fns";
import { PlusCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import ExerciseItem from "./ExerciseItem";
import NoteItem from "./NoteItem";
import ExerciseForm from "./forms/ExerciseForm";
import NoteForm from "./forms/NoteForm";
import SessionTimer from "./SessionTimer";
import { Skeleton } from "./ui/skeleton";
import { Note } from "@/lib/types";


interface TodayProps {
  isMounted: boolean;
}

// Helper to convert Firebase objects to arrays
const getValues = <T,>(obj: Record<string, T> | T[] | undefined): T[] => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    return Object.values(obj);
};

export default function Today({ isMounted }: TodayProps) {
  const { role, data, getExercisesForDate } = useAppContext();
  const date = new Date();
  const dateString = format(date, "yyyy-MM-dd");
  const dayData = data[dateString];
  const exercisesForToday = getExercisesForDate(date);
  const notes: Note[] = getValues(dayData?.notes);

  const [isExerciseFormOpen, setExerciseFormOpen] = useState(false);
  const [isNoteFormOpen, setNoteFormOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | undefined>(undefined);

  const handleAddNote = (exerciseId?: string) => {
    setSelectedExerciseId(exerciseId);
    setNoteFormOpen(true);
  };
  
  if (!isMounted) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-full w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Today's Plan</CardTitle>
        <CardDescription>{format(date, "EEEE, MMMM do")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        {role === 'player' && <SessionTimer date={date} />}
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Exercises</h3>
                {exercisesForToday.length > 0 ? (
                    <ul className="space-y-2">
                    {exercisesForToday.map((exercise) => (
                        <ExerciseItem key={exercise.id} date={dateString} exercise={exercise} onAddNote={handleAddNote} />
                    ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No exercises assigned for today.</p>
                )}

                {role === 'coach' && (
                    <>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setExerciseFormOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise
                    </Button>
                    <ExerciseForm
                        isOpen={isExerciseFormOpen}
                        setIsOpen={setExerciseFormOpen}
                        dayOfWeek={getDay(date)}
                    />
                    </>
                )}
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Notes</h3>
                {notes.length > 0 ? (
                    <ul className="space-y-2">
                        {notes.map((note) => (
                            <NoteItem key={note.id} date={dateString} note={note} />
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No notes for today.</p>
                )}
                
                {(role === 'player' || role === 'coach') && (
                    <>
                        <Button size="sm" variant="outline" className="w-full" onClick={() => handleAddNote()}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add General Note
                        </Button>
                        <NoteForm
                            isOpen={isNoteFormOpen}
                            setIsOpen={setNoteFormOpen}
                            date={dateString}
                            exerciseId={selectedExerciseId}
                        />
                    </>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
