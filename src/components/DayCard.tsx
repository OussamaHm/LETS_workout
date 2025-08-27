
"use client";

import { useState, useMemo } from "react";
import { format, addDays, getDay, isToday } from "date-fns";
import { PlusCircle, Copy, Timer, Bed, GripVertical } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import ExerciseItem from "./ExerciseItem";
import NoteItem from "./NoteItem";
import ExerciseForm from "./forms/ExerciseForm";
import NoteForm from "./forms/NoteForm";
import { cn } from "@/lib/utils";
import { Note } from "@/lib/types";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./ui/tooltip";

// Helper to convert Firebase objects to arrays
const getValues = <T,>(obj: Record<string, T> | T[] | undefined): T[] => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    return Object.values(obj);
};

const formatDuration = (seconds: number) => {
    if (seconds < 0) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || (h === 0 && m === 0)) parts.push(`${s}s`);
    
    return parts.join(' ');
};

export default function DayCard({ date }: { date: Date }) {
  const { role, data, copyDay, getExercisesForDate, setOffDay, reorderExercises } = useAppContext();
  const dateString = format(date, "yyyy-MM-dd");
  const dayData = data[dateString];
  const isOffDay = dayData?.isOffDay ?? false;
  
  const exercisesForDay = getExercisesForDate(date);
  const notes: Note[] = getValues(dayData?.notes);

  const [isExerciseFormOpen, setExerciseFormOpen] = useState(false);
  const [isNoteFormOpen, setNoteFormOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | undefined>(undefined);

  const handleAddNote = (exerciseId?: string) => {
    setSelectedExerciseId(exerciseId);
    setNoteFormOpen(true);
  };
  
  const handleCopyDay = () => {
    const nextWeekSameDay = addDays(date, 7);
    copyDay(date, nextWeekSameDay);
  };

  const handleToggleOffDay = () => {
    setOffDay(dateString, !isOffDay);
  };

  const isTodayDate = isToday(date);
  
  const sessionDuration = useMemo(() => {
    if (dayData?.sessionStart && dayData.sessionEnd) {
      const durationSeconds = Math.floor((dayData.sessionEnd - dayData.sessionStart) / 1000);
      return formatDuration(durationSeconds);
    }
    return null;
  }, [dayData]);

  return (
    <Card className={cn("flex flex-col", isTodayDate && "bg-primary/5", isOffDay && "bg-muted/60")}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{format(date, "EEEE")}</CardTitle>
                <CardDescription>{format(date, "MMMM do")}</CardDescription>
            </div>
             {role === 'coach' && (
                <div className="flex items-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleToggleOffDay}>
                                    <Bed className={cn("h-4 w-4", isOffDay && "text-primary")} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Toggle Rest Day</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                             <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyDay} disabled={isOffDay}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Copy exercises to next week</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {sessionDuration && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground border-b pb-4">
                <Timer className="h-4 w-4 text-primary" />
                <span>Session Duration:</span>
                <span className="font-semibold text-foreground">{sessionDuration}</span>
            </div>
        )}

        {isOffDay ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                <Bed className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-semibold text-muted-foreground">Rest Day</h3>
            </div>
        ) : (
            <>
                <div className="flex-1 space-y-4">
                  <h3 className="font-semibold text-foreground">Exercises</h3>
                  
                  {/* <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={`exercises-${dateString}`} isDropDisabled={role !== 'coach'}>
                      {(provided) => ( */}
                        <ul /* {...provided.droppableProps} ref={provided.innerRef} */ className="space-y-2">
                          {exercisesForDay.length > 0 ? (
                            exercisesForDay.map((exercise, index) => (
                              // <Draggable key={exercise.id} draggableId={exercise.id} index={index} isDragDisabled={role !== 'coach'}>
                              //   {(provided, snapshot) => (
                                  <li
                                    // ref={provided.innerRef}
                                    // {...provided.draggableProps}
                                    // {...provided.dragHandleProps}
                                    // style={{
                                    //   ...provided.draggableProps.style,
                                    //   userSelect: 'none',
                                    //   opacity: snapshot.isDragging ? 0.8 : 1,
                                    // }}
                                    key={exercise.id}
                                    className="flex items-center gap-2"
                                  >
                                    {role === 'coach' && <GripVertical className="h-4 w-4 text-muted-foreground" />}
                                    <div className="flex-1">
                                      <ExerciseItem key={exercise.id} date={dateString} exercise={exercise} onAddNote={handleAddNote} />
                                    </div>
                                  </li>
                                // )}
                              // </Draggable>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No exercises assigned for today.</p>
                          )}
                          {/* {provided.placeholder} */}
                        </ul>
                      {/* )}
                    </Droppable>
                  </DragDropContext> */}

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

                <div className="flex-1 space-y-4">
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
            </>
        )}
      </CardContent>
    </Card>
  );
}

    