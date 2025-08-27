
"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Trash2, BookPlus, MessageSquarePlus, CheckCircle2, Circle, Link as LinkIcon, MinusCircle } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import ExerciseForm from "./forms/ExerciseForm";
import LogForm from "./forms/LogForm";
import { Exercise, Log } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getDay, parseISO } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface ExerciseItemProps {
  date: string;
  exercise: Exercise;
  onAddNote: (exerciseId: string) => void;
}

const getValues = <T,>(obj: Record<string, T> | undefined): T[] => {
    if (!obj) return [];
    return Object.values(obj);
};

export default function ExerciseItem({ date, exercise, onAddNote }: ExerciseItemProps) {
  const { role, data, deleteExercise, unassignExerciseFromDay } = useAppContext();
  const dayData = data[date];
  const logs = dayData?.logs ? getValues(dayData.logs) : [];
  const log = logs.find((l) => l.exerciseId === exercise.id);
  const isLogged = !!log;
  // Create a Date object from the date string to ensure correct day calculation
  const dayOfWeek = getDay(parseISO(date + 'T00:00:00'));

  const [isExerciseFormOpen, setExerciseFormOpen] = useState(false);
  const [isLogFormOpen, setLogFormOpen] = useState(false);
  
  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Avoid triggering if a button inside the item was clicked
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    if (role === 'player') {
      setLogFormOpen(true);
    } else {
      setExerciseFormOpen(true);
    }
  };

  const handleUnassign = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    unassignExerciseFromDay(exercise.id, dayOfWeek);
  }

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // This will delete the exercise from the library and all assignments.
    // Past logs will remain.
    if(confirm("Are you sure you want to delete this exercise? This will remove it from all days of the week. Past logs will not be affected.")) {
        deleteExercise(exercise.id);
    }
  }


  return (
    <div 
      className={cn(
        "rounded-lg border p-3 text-sm transition-all cursor-pointer w-full", 
        isLogged ? "border-primary/40 bg-primary/10" : "hover:bg-muted/50"
      )}
      onClick={handleItemClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 font-medium">
            {isLogged ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
            <span className="flex-1">{exercise.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {role === "coach" && (
            <>
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleUnassign}>
                            <MinusCircle className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Remove from this day</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExerciseFormOpen(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Edit exercise definition</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete exercise (from all days)</p>
                    </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          {(role === 'player' && !isLogged) && (
             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setLogFormOpen(true)}>
                <BookPlus className="h-4 w-4 text-primary" />
             </Button>
          )}
           <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onAddNote(exercise.id); }}>
              <MessageSquarePlus className="h-4 w-4 text-accent" />
           </Button>
        </div>
      </div>
      
      {exercise.imageUrl && (
        <div className="mt-2 pl-6">
            { exercise.imageUrl.match(/\.(jpeg|jpg|gif|png)$/) != null ?
                <Image data-ai-hint="exercise fitness" src={exercise.imageUrl} alt={exercise.name} width={200} height={200} className="rounded-md object-cover"/>
                : <a href={exercise.imageUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1"><LinkIcon size={14} />Link to exercise</a>
            }
        </div>
      )}

      <div className="mt-2 pl-6 text-muted-foreground">
        Target: {exercise.targetSets} sets of {exercise.targetReps} reps
        {exercise.targetWeight != null && ` at ${exercise.targetWeight}kg`}
      </div>
      {log && (
        <div className="mt-1 pl-6 text-primary/80">
          <p className="font-semibold">Logged: {log.actualSets} sets of {log.actualReps} reps</p>
          {log.weights.length > 0 && (
            <p className="text-xs">Weights: {log.weights.join("kg, ")}kg</p>
          )}
        </div>
      )}

      {role === "coach" && (
        <ExerciseForm
          isOpen={isExerciseFormOpen}
          setIsOpen={setExerciseFormOpen}
          exercise={exercise}
          dayOfWeek={dayOfWeek}
          log={log}
        />
      )}
      {role === "player" && (
        <LogForm
            isOpen={isLogFormOpen}
            setIsOpen={setLogFormOpen}
            date={parseISO(date + 'T00:00:00')}
            exercise={exercise}
            log={log}
        />
      )}
    </div>
  );
}
