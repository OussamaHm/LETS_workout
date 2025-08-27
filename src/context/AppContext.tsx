
"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import type { Role, AppData, Exercise, Log, Note, ExerciseAssignment, FullAppData, PlanData, DailyLog } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format, getDay } from "date-fns";
import { useLocalStorage } from "@/lib/hooks";
import { initialData } from "@/lib/initial-data";

// Helper to generate unique IDs
const generateId = () => `_${Math.random().toString(36).substr(2, 9)}`;

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  
  data: AppData;
  addLog: (date: string, log: Omit<Log, 'id'>) => void;
  addNote: (date: string, note: Omit<Note, 'id' | 'feedback'>) => void;
  updateNote: (date: string, note: Note) => void;
  deleteNote: (date: string, noteId: string) => void;
  addFeedback: (date: string, noteId: string, feedback: string) => void;

  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, 'id'>) => Exercise;
  updateExercise: (exercise: Exercise) => void;
  deleteExercise: (exerciseId: string) => void;
  getExerciseById: (exerciseId: string) => Exercise | undefined;

  assignments: ExerciseAssignment[];
  assignExerciseToDay: (exerciseId: string, dayOfWeek: number) => void;
  unassignExerciseFromDay: (exerciseId: string, dayOfWeek: number) => void;
  getExercisesForDate: (date: Date) => Exercise[];
  copyDay: (from_date: Date, to_date: Date) => void;
  reorderExercises: (dayOfWeek: number, sourceIndex: number, destinationIndex: number) => void;

  startSession: (date: string) => void;
  stopSession: (date: string) => void;
  setOffDay: (date: string, isOff: boolean) => void;
  
  getFullData: () => FullAppData;
  loadImportedData: (data: FullAppData) => void;
  resetToLocalData: () => void;
  isViewingImportedData: boolean;

  getPlanData: () => PlanData;
  loadPlanData: (data: PlanData) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("player");
  
  // Local storage hooks for coach's own data
  const [localPlayerName, setLocalPlayerName] = useLocalStorage<string>("progressPadPlayerName", "Player");
  const [localData, setLocalData] = useLocalStorage<AppData>("progressPadData", initialData.dailyLogs);
  const [localExercises, setLocalExercises] = useLocalStorage<Exercise[]>("progressPadExercises", initialData.exercises);
  const [localAssignments, setLocalAssignments] = useLocalStorage<ExerciseAssignment[]>("progressPadAssignments", initialData.assignments);

  // State for potentially viewing imported data
  const [viewedData, setViewedData] = useState<FullAppData | null>(null);

  const { toast } = useToast();
  
  const isViewingImportedData = !!viewedData;

  // Determine which data set to use
  const playerName = isViewingImportedData ? viewedData.playerName : localPlayerName;
  const data = isViewingImportedData ? viewedData.dailyLogs : localData;
  const exercises = isViewingImportedData ? viewedData.exercises : localExercises;
  const assignments = isViewingImportedData ? viewedData.assignments : localAssignments;
  
  // Wrap setters to only write to local storage when not viewing imported data
  const setPlayerName = (name: string) => {
    if (!isViewingImportedData) {
      setLocalPlayerName(name);
    }
  };

  const setData = (updater: (prev: AppData) => AppData) => {
    if (isViewingImportedData) {
        setViewedData(prev => prev ? { ...prev, dailyLogs: updater(prev.dailyLogs) } : null);
    } else {
        setLocalData(updater);
    }
  };

  const setExercises = (updater: (prev: Exercise[]) => Exercise[]) => {
      if (isViewingImportedData) {
          setViewedData(prev => prev ? { ...prev, exercises: updater(prev.exercises) } : null);
      } else {
          setLocalExercises(updater);
      }
  };

  const setAssignments = (updater: (prev: ExerciseAssignment[]) => ExerciseAssignment[]) => {
      if (isViewingImportedData) {
          setViewedData(prev => prev ? { ...prev, assignments: updater(prev.assignments) } : null);
      } else {
          setLocalAssignments(updater);
      }
  };


  const addLog = useCallback((date: string, log: Omit<Log, 'id'>) => {
    setData(prevData => {
        const dayData = prevData[date] || { logs: {}, notes: {} };
        const newLogs = {...dayData.logs};
        
        const existingLogKey = Object.keys(newLogs).find(key => newLogs[key].exerciseId === log.exerciseId);

        if (existingLogKey) {
            newLogs[existingLogKey] = { ...newLogs[existingLogKey], ...log, id: existingLogKey };
        } else {
            const newLogId = generateId();
            newLogs[newLogId] = { ...log, id: newLogId };
        }
        
        return { ...prevData, [date]: {...dayData, logs: newLogs} };
    });
  }, [setData]);

  const addNote = useCallback((date: string, note: Omit<Note, 'id' | 'feedback'>) => {
    setData(prevData => {
        const dayData = { ...(prevData[date] || { logs: {}, notes: {} }) };
        const newNotes = {...dayData.notes};
        const newNoteId = generateId();
        const newNote: Note = { ...note, id: newNoteId };
        if (note.exerciseId) {
            newNote.exerciseId = note.exerciseId;
        }
        newNotes[newNoteId] = newNote;
        return { ...prevData, [date]: {...dayData, notes: newNotes} };
    });
  }, [setData]);

  const updateNote = useCallback((date: string, noteToUpdate: Note) => {
    setData(prevData => {
        const dayData = prevData[date];
        if (dayData && dayData.notes[noteToUpdate.id]) {
            const newNotes = {...dayData.notes, [noteToUpdate.id]: noteToUpdate};
            return { ...prevData, [date]: {...dayData, notes: newNotes} };
        }
        return prevData;
    });
  }, [setData]);

  const deleteNote = useCallback((date: string, noteId: string) => {
    setData(prevData => {
        const dayData = prevData[date];
        if (dayData && dayData.notes[noteId]) {
            const newNotes = {...dayData.notes};
            delete newNotes[noteId];
            return { ...prevData, [date]: {...dayData, notes: newNotes} };
        }
        return prevData;
    });
  }, [setData]);

  const addFeedback = useCallback((date: string, noteId: string, feedback: string) => {
     setData(prevData => {
        const dayData = prevData[date];
        if (dayData && dayData.notes[noteId]) {
            const newNotes = {...dayData.notes};
            newNotes[noteId] = {...newNotes[noteId], feedback};
            return { ...prevData, [date]: {...dayData, notes: newNotes} };
        }
        return prevData;
    });
  }, [setData]);

  const addExercise = useCallback((exercise: Omit<Exercise, 'id'>): Exercise => {
      const newExercise: Exercise = { ...exercise, id: generateId() };
      setExercises(prev => [...prev, newExercise]);
      return newExercise;
  }, [setExercises]);

  const updateExercise = useCallback((exerciseToUpdate: Exercise) => {
     setExercises(prev => prev.map(ex => ex.id === exerciseToUpdate.id ? exerciseToUpdate : ex));
  }, [setExercises]);
  
  const deleteExercise = useCallback((exerciseId: string) => {
      setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
      setAssignments(prev => prev.filter(a => a.exerciseId !== exerciseId));
  }, [setExercises, setAssignments]);
  
  const getExerciseById = useCallback((exerciseId: string) => {
      return exercises.find(ex => ex.id === exerciseId);
  }, [exercises]);

  const assignExerciseToDay = useCallback((exerciseId: string, dayOfWeek: number) => {
    setAssignments(prev => {
        const alreadyAssigned = prev.some(a => a.exerciseId === exerciseId && a.dayOfWeek === dayOfWeek);
        if (alreadyAssigned) return prev;

        const maxOrder = prev
            .filter(a => a.dayOfWeek === dayOfWeek)
            .reduce((max, a) => Math.max(max, a.order), -1);

        return [...prev, { id: generateId(), exerciseId, dayOfWeek, order: maxOrder + 1 }];
    });
  }, [setAssignments]);

  const unassignExerciseFromDay = useCallback((exerciseId: string, dayOfWeek: number) => {
      setAssignments(prev => prev.filter(a => !(a.exerciseId === exerciseId && a.dayOfWeek === dayOfWeek)));
  }, [setAssignments]);
  
  const getExercisesForDate = useCallback((date: Date): Exercise[] => {
    const dayOfWeek = getDay(date);
    // Get assignments for the specific day and sort them by the 'order' property
    const dailyAssignments = assignments
      .filter(a => a.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.order - b.order);
    
    // Create a map for quick lookups
    const exerciseMap = new Map(exercises.map(ex => [ex.id, ex]));

    // Map over the sorted assignments to get exercises in the correct order
    return dailyAssignments
      .map(assignment => exerciseMap.get(assignment.exerciseId))
      .filter((ex): ex is Exercise => !!ex);
  }, [assignments, exercises]);

  const copyDay = useCallback((from_date: Date, to_date: Date) => {
      const fromDayOfWeek = getDay(from_date);
      const toDayOfWeek = getDay(to_date);

      const exercisesToCopy = assignments
        .filter(a => a.dayOfWeek === fromDayOfWeek)
        .sort((a, b) => a.order - b.order);

      if (exercisesToCopy.length === 0) {
          toast({
              variant: "destructive",
              title: "Nothing to copy",
              description: "There are no exercises assigned on the selected day to copy.",
          });
          return;
      }
      
      setAssignments(prevAssignments => {
          let newAssignments = [...prevAssignments];
          const maxOrder = newAssignments
              .filter(a => a.dayOfWeek === toDayOfWeek)
              .reduce((max, a) => Math.max(max, a.order), -1);
          
          let currentOrder = maxOrder + 1;

          exercisesToCopy.forEach(assignment => {
              const alreadyExists = newAssignments.some(a => a.exerciseId === assignment.exerciseId && a.dayOfWeek === toDayOfWeek);
              if (!alreadyExists) {
                  newAssignments.push({ id: generateId(), exerciseId: assignment.exerciseId, dayOfWeek: toDayOfWeek, order: currentOrder++ });
              }
          });
          return newAssignments;
      });


      try {
          const formattedDate = format(to_date, "EEEE, MMMM do");
          toast({
              title: "Copied!",
              description: `Plan has been copied to ${formattedDate}.`,
          });
      } catch (e) {
           toast({
              title: "Copied!",
              description: `Plan has been copied to ${format(to_date, "yyyy-MM-dd")}.`,
          });
      }
  }, [assignments, toast, setAssignments]);

  const reorderExercises = useCallback((dayOfWeek: number, sourceIndex: number, destinationIndex: number) => {
    setAssignments(prev => {
        const dayAssignments = prev
            .filter(a => a.dayOfWeek === dayOfWeek)
            .sort((a, b) => a.order - b.order);
        
        const [movedItem] = dayAssignments.splice(sourceIndex, 1);
        dayAssignments.splice(destinationIndex, 0, movedItem);

        const updatedDayAssignments = dayAssignments.map((a, index) => ({
            ...a,
            order: index,
        }));

        const otherDayAssignments = prev.filter(a => a.dayOfWeek !== dayOfWeek);

        return [...otherDayAssignments, ...updatedDayAssignments];
    });
  }, [setAssignments]);

  const startSession = useCallback((date: string) => {
    setData(prevData => {
        const dayData = { ...(prevData[date] || { logs: {}, notes: {} }) };
        dayData.sessionStart = Date.now();
        dayData.sessionEnd = undefined; // Clear any previous end time
        return { ...prevData, [date]: dayData };
    });
  }, [setData]);

  const stopSession = useCallback((date: string) => {
    setData(prevData => {
        const dayData = prevData[date];
        if (dayData && dayData.sessionStart && !dayData.sessionEnd) {
            dayData.sessionEnd = Date.now();
            return { ...prevData, [date]: dayData };
        }
        return prevData;
    });
  }, [setData]);

  const setOffDay = useCallback((date: string, isOff: boolean) => {
    setData(prevData => {
      const dayData: DailyLog = prevData[date] || { logs: {}, notes: {} };
      const updatedDayData: DailyLog = { ...dayData, isOffDay: isOff };
      return { ...prevData, [date]: updatedDayData };
    });
  }, [setData]);
  
  const getFullData = useCallback((): FullAppData => {
    return {
      playerName,
      dailyLogs: data,
      exercises,
      assignments,
    };
  }, [playerName, data, exercises, assignments]);

  const loadImportedData = useCallback((importedData: FullAppData) => {
    setViewedData(importedData);
    setRole("coach");
    toast({
        title: "Player Data Loaded",
        description: `Now viewing data for ${importedData.playerName}. Your local data is safe.`
    });
  }, [toast]);
  
  const resetToLocalData = useCallback(() => {
      setViewedData(null);
      toast({
          title: "Reset Successful",
          description: "Now viewing your local data."
      })
  }, [toast]);

  const getPlanData = useCallback((): PlanData => {
    return {
      exercises,
      assignments,
      dailyLogs: data,
    };
  }, [exercises, assignments, data]);

  const loadPlanData = useCallback((planData: PlanData) => {
    if (isViewingImportedData) {
        toast({
            variant: "destructive",
            title: "Import Blocked",
            description: "You cannot import a plan while viewing another player's data. Please reset to your own data first.",
        });
        return;
    }
    setLocalExercises(planData.exercises);
    setLocalAssignments(planData.assignments);
    
    if (planData.dailyLogs) {
        setLocalData(prevLocalData => {
            const newDailyLogs = { ...prevLocalData };
            for (const date in planData.dailyLogs) {
                const importedDay = planData.dailyLogs[date];
                const existingDay = newDailyLogs[date] || { logs: {}, notes: {} };
                const newNotes = { ...existingDay.notes };
                if (importedDay.notes) {
                    Object.values(importedDay.notes).forEach(note => {
                        const noteExists = Object.values(newNotes).some(n => n.content === note.content);
                        if (!noteExists) {
                             const newNote: Note = { ...note, id: generateId() };
                             newNotes[newNote.id] = newNote;
                        }
                    });
                }
                newDailyLogs[date] = {
                    ...existingDay,
                    notes: newNotes,
                    isOffDay: importedDay.isOffDay ?? existingDay.isOffDay,
                };
            }
            return newDailyLogs;
        });
    }

    toast({
        title: "Plan Loaded",
        description: `The new workout plan has been imported successfully.`
    });
  }, [isViewingImportedData, setLocalData, setLocalAssignments, setLocalExercises, toast]);
  
  const value = useMemo(() => ({
      role,
      setRole,
      playerName,
      setPlayerName,
      data,
      addLog,
      addNote,
      updateNote,
      deleteNote,
      addFeedback,
      exercises,
      addExercise,
      updateExercise,
      deleteExercise,
      getExerciseById,
      assignments,
      assignExerciseToDay,
      unassignExerciseFromDay,
      getExercisesForDate,
      copyDay,
      reorderExercises,
      startSession,
      stopSession,
      setOffDay,
      getFullData,
      loadImportedData,
      resetToLocalData,
      isViewingImportedData,
      getPlanData,
      loadPlanData,
  }), [
      role, setRole, playerName, setPlayerName, data, addLog, addNote, updateNote, deleteNote, addFeedback,
      exercises, addExercise, updateExercise, deleteExercise, getExerciseById,
      assignments, assignExerciseToDay, unassignExerciseFromDay, getExercisesForDate, copyDay, reorderExercises,
      startSession, stopSession, setOffDay, getFullData, loadImportedData, resetToLocalData, isViewingImportedData,
      getPlanData, loadPlanData
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
