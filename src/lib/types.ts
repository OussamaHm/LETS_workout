
export interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  imageUrl?: string;
}

export interface Log {
  id: string;
  exerciseId: string;
  // Snapshot of exercise details at time of logging
  exerciseName: string; 
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  // Actual performance
  actualSets: number;
  actualReps: number;
  weights: number[];
}

export interface Note {
  id: string;
  content: string;
  exerciseId?: string; // Link to the definition
  feedback?: string;
}

// Stored per day
export interface DailyLog {
  logs: Record<string, Log>;
  notes: Record<string, Note>;
  sessionStart?: number; // Unix timestamp (milliseconds)
  sessionEnd?: number;   // Unix timestamp (milliseconds)
  isOffDay?: boolean;
}
export type AppData = Record<string, DailyLog>;


// A mapping of an exercise ID to a day of the week (0=Sun, 1=Mon, ..., 6=Sat)
export interface ExerciseAssignment {
    id: string;
    exerciseId: string;
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    order: number;
}

export type Role = "coach" | "player";

// Used for import/export of just exercises and assignments
export interface PlanData {
  exercises: Exercise[];
  assignments: ExerciseAssignment[];
  dailyLogs?: AppData;
}

// Used for import/export of all player data
export interface FullAppData extends PlanData {
  playerName: string;
  dailyLogs: AppData;
}
