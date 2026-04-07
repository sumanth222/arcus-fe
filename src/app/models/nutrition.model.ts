export interface NutritionTarget {
  userId: number;
  proteinTargetGrams: number;
  calorieTargetMin: number;
  calorieTargetMax: number;
  weightKg: number;
  fitnessGoal: string;
  summary: string;
}

export interface NutritionInsight {
  id: number;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS';
  createdAt: string;
}

export interface PostWorkoutNutrition {
  proteinRecommendation: number;
  carbLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  foodSuggestions: string[];
}

export interface FoodSuggestion {
  name: string;
  proteinGrams: number;
  caloriesKcal: number;
  category?: string;
  servingSize?: string;
}

export interface QuickNutritionOption {
  comboName: string;
  totalProteinGrams: number;
  totalCaloriesKcal: number;
  items: FoodSuggestion[];
}
