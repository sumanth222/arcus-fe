export interface UserProfile {

  userId: number;
  name: string;
  email: string;
  joinedAt: string;

  currentLevel: string;
  fitnessGoal: string;
  workoutSplit: string;

  bio: string | null;

  totalWorkouts: number;
  totalExerciseSessions: number;
  totalSetsSessions: number;
  totalWeightLifted: number;

  consecutiveWorkoutDays: number;

  lastWorkoutDate: string;
  lastWorkoutDay: number;
}

export interface NextWorkoutInfo {
  nextWorkoutName: string;
  nextDayNumber: number;
  lastWorkoutName: string;
  lastDayNumber: number;
  lastWorkoutDate: string;
  lastWorkoutCompleted: boolean;
  lastWorkoutTotalWeight: number;
  muscleGroups?: string[];
  previousWorkoutTotalWeight?: number;
  lastWorkoutWeightChange?: number;
  lastWorkoutWeightChangePercent?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
  email?: string;
}

export interface LoginResponse {
  userId: number | null;
  name: string;
  isNewUser: boolean;
}