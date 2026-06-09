export interface UserProfile {

  userId: number;
  name: string;
  email: string;
  joinedAt: string;

  age?: number | null;
  gender?: string | null;

  heightCm: number | null;
  weightKg: number | null;

  currentLevel: string;
  fitnessGoal: string;
  workoutSplit: string;
  workoutLocation?: string;

  daysPerWeek?: number | null;
  workoutDuration?: number | null;
  equipment?: string | null;
  weakMuscleGroups?: string | null;
  injuries?: string | null;
  additionalNotes?: string | null;

  status?: 'PENDING_REVIEW' | 'ACTIVE';

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
  username?: string;   // returned by Google login flow
}