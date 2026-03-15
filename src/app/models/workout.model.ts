export interface WorkoutExercise {
  exerciseSessionId: number;
  exerciseName: string;
  targetWeight: number;
  repMin: number;
  repMax: number;
  sets: number;
  tempo: string;
  tip: string;
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
}

export interface SetData {
  setNumber: number;
  targetWeight: number;
  targetReps: number;
  weight: number;
  reps: number;
  completed: boolean;
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
