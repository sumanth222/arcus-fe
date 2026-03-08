export interface WorkoutExercise {
  exerciseSessionId: number;
  exerciseName: string;
  targetWeight: number;
  repMin: number;
  repMax: number;
  sets: number;
  tempo: string;
}

export interface WorkoutSession {
  sessionId: number;
  level: string;
  exercises: WorkoutExercise[];
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
}
