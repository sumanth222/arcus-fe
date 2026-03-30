export interface WorkoutExercise {
  exerciseSessionId: number;
  exerciseTemplateSessionID?: number;
  exerciseName: string;
  targetWeight: number;
  repMin: number;
  repMax: number;
  sets: number;
  tempo: string;
  tip: string;
  videoUrl?: string;
}

export interface WorkoutSession {
  sessionId: number;
  level: string;
  dayNumber: number;
  exercises: WorkoutExercise[];
}

export interface LogSetResponse {
  fatigueDetected: boolean;
  suggestedRestSeconds: number;
  message: string;
  exerciseCompleted: boolean;
  nextSetWeight?: number;
  nextSetReps?: number;
}

export interface SetData {
  setNumber: number;
  targetWeight: number;
  targetReps: number;
  weight: number;
  reps: number;
  completed: boolean;
  exerciseSessionId: number;
}

export interface ExerciseView {
  exerciseSessionId: number;
  name: string;
  muscle: string;
  video: string;
  sets: SetData[];
  tempo: string;
  tip: string;
}
