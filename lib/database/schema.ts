/**
 * Database Schema Types
 * Defines the structure for Workout, Exercise, and Set data
 */

export interface Workout {
  id: string;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  notes: string;
  templateId?: string | null; // Reference to workout template (if session was from template)
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

export interface Exercise {
  id: string;
  workoutId: string;
  name: string;
  notes: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Set {
  id: string;
  exerciseId: string;
  reps: number;
  weight: number;
  order: number;
  createdAt: number;
  updatedAt: number;
}

// Workout Template types
export interface WorkoutTemplate {
  id: string;
  name: string;
  category: 'PPL' | 'Bro Split' | 'Full Body' | 'Custom';
  notes: string;
  isDefault: boolean; // True for pre-installed templates
  createdAt: number;
  updatedAt: number;
}

export interface TemplateExercise {
  id: string;
  templateId: string;
  name: string;
  notes: string;
  order: number;
  createdAt: number;
}

export interface WorkoutTemplateWithExercises extends WorkoutTemplate {
  exercises: TemplateExercise[];
}

// Active Session types
export interface ActiveSession {
  templateId: string;
  templateName: string;
  startedAt: number;
  date: string; // ISO 8601 date
  notes: string;
  exercises: SessionExercise[];
}

export interface SessionExercise {
  templateExerciseId: string;
  name: string;
  notes: string;
  order: number;
  sets: SessionSet[];
  lastPerformance?: ExercisePerformance; // Historical data
}

export interface SessionSet {
  id: string; // Temporary ID for UI
  reps: string; // String for input field
  weight: string; // String for input field
}

export interface ExercisePerformance {
  date: string;
  sets: { reps: number; weight: number }[];
  totalVolume: number;
}

// View models for easier consumption
export interface WorkoutWithExercises extends Workout {
  exercises: ExerciseWithSets[];
  totalVolume: number; // Total kg across all sets
  exerciseCount: number;
  templateName?: string | null; // Name of the template if workout was from a template
}

export interface ExerciseWithSets extends Exercise {
  sets: Set[];
  totalVolume: number;
  totalReps: number;
}

export interface MigrationRecord {
  id: number;
  version: number;
  name: string;
  executedAt: number;
}

// API Response types
export interface WorkoutStats {
  totalWorkouts: number;
  totalExercisesLogged: number;
  currentStreak: number; // Consecutive days with a workout
  totalVolumeLifted: number; // All-time kg
}

export interface ExerciseStats {
  name: string;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  maxWeight: number;
  avgWeight: number;
}

export interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  reps: number;
  date: string;
}
