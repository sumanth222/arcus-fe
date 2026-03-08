export interface UserProfile {

  userId: number;
  name: string;
  email: string;
  joinedAt: string;

  currentLevel: string;
  fitnessGoal: string;

  bio: string | null;

  totalWorkouts: number;
  totalExerciseSessions: number;
  totalSetsSessions: number;
  totalWeightLifted: number;

  consecutiveWorkoutDays: number;

  lastWorkoutDate: string;
  lastWorkoutDay: number;
  lastExerciseSessionId: number;

}