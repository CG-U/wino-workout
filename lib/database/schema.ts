/**
 * Database Schema Types
 * Defines the structure for Workout, Exercise, and Set data
 */

export interface Workout {
  id: string;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  notes: string;
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

// View models for easier consumption
export interface WorkoutWithExercises extends Workout {
  exercises: ExerciseWithSets[];
  totalVolume: number; // Total kg across all sets
  exerciseCount: number;
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
