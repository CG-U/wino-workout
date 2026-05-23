/**
 * Workout Analytics
 * Calculate statistics and metrics from workout data
 */

import {
  ExerciseStats,
  PersonalRecord,
  WorkoutWithExercises,
} from "@/lib/database/schema";

/**
 * Get unique exercise names from all workouts, sorted alphabetically
 */
export function getUniqueExercises(workouts: WorkoutWithExercises[]): string[] {
  const exerciseSet = new Set<string>();
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      exerciseSet.add(exercise.name);
    }
  }
  return Array.from(exerciseSet).sort();
}

export interface DashboardStats {
  totalWorkouts: number;
  totalExercisesLogged: number;
  currentStreak: number;
  totalVolumeLifted: number;
  averageVolumePerWorkout: number;
  favoriteExercises: ExerciseStats[];
  personalRecords: PersonalRecord[];
  volumeByWeek: Array<{ week: string; volume: number }>;
  exerciseFrequency: Array<{ name: string; count: number }>;
}

/**
 * Calculate total number of workouts
 */
export function calculateTotalWorkouts(
  workouts: WorkoutWithExercises[],
): number {
  return workouts.length;
}

/**
 * Calculate total number of exercises logged
 */
export function calculateTotalExercisesLogged(
  workouts: WorkoutWithExercises[],
): number {
  return workouts.reduce((sum, w) => sum + w.exerciseCount, 0);
}

/**
 * Calculate current workout streak (consecutive days with at least one workout)
 */
export function calculateCurrentStreak(
  workouts: WorkoutWithExercises[],
): number {
  if (workouts.length === 0) return 0;

  // Sort by date descending
  const sorted = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let lastDate = new Date(sorted[0].date);
  lastDate.setHours(0, 0, 0, 0);

  // Check if the most recent workout is today or yesterday
  const diffDays =
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays > 1) {
    return 0; // Streak is broken
  }

  for (let i = 1; i < sorted.length; i++) {
    const currentDate = new Date(sorted[i].date);
    currentDate.setHours(0, 0, 0, 0);

    const dayDiff =
      (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDiff === 1) {
      streak++;
      lastDate = currentDate;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate total volume lifted (kg)
 */
export function calculateTotalVolume(workouts: WorkoutWithExercises[]): number {
  return workouts.reduce((sum, w) => sum + w.totalVolume, 0);
}

/**
 * Calculate favorite exercises (top exercises by frequency)
 */
export function calculateFavoriteExercises(
  workouts: WorkoutWithExercises[],
  limit: number = 5,
): ExerciseStats[] {
  const exerciseMap = new Map<
    string,
    {
      count: number;
      totalSets: number;
      totalReps: number;
      totalVolume: number;
      maxWeight: number;
      avgWeight: number;
    }
  >();

  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      const existing = exerciseMap.get(exercise.name) || {
        count: 0,
        totalSets: 0,
        totalReps: 0,
        totalVolume: 0,
        maxWeight: 0,
        avgWeight: 0,
      };

      const weights = exercise.sets.map((s) => s.weight);
      const maxWeight = Math.max(...weights);
      const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;

      exerciseMap.set(exercise.name, {
        count: existing.count + 1,
        totalSets: existing.totalSets + exercise.sets.length,
        totalReps: existing.totalReps + exercise.totalReps,
        totalVolume: existing.totalVolume + exercise.totalVolume,
        maxWeight: Math.max(existing.maxWeight, maxWeight),
        avgWeight: (existing.avgWeight + avgWeight) / 2, // Simplified average
      });
    }
  }

  const sorted = Array.from(exerciseMap.entries())
    .map(([name, stats]) => ({
      name,
      totalSets: stats.totalSets,
      totalReps: stats.totalReps,
      totalVolume: stats.totalVolume,
      maxWeight: stats.maxWeight,
      avgWeight: stats.avgWeight,
    }))
    .sort((a, b) => b.totalSets - a.totalSets)
    .slice(0, limit);

  return sorted;
}

/**
 * Calculate personal records (max weight per exercise)
 */
export function calculatePersonalRecords(
  workouts: WorkoutWithExercises[],
): PersonalRecord[] {
  const prMap = new Map<
    string,
    {
      maxWeight: number;
      reps: number;
      date: string;
    }
  >();

  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      for (const set of exercise.sets) {
        const existing = prMap.get(exercise.name);

        if (!existing || set.weight > existing.maxWeight) {
          prMap.set(exercise.name, {
            maxWeight: set.weight,
            reps: set.reps,
            date: workout.date,
          });
        }
      }
    }
  }

  return Array.from(prMap.entries())
    .map(([name, record]) => ({
      exerciseName: name,
      maxWeight: record.maxWeight,
      reps: record.reps,
      date: record.date,
    }))
    .sort((a, b) => b.maxWeight - a.maxWeight);
}

/**
 * Calculate volume lifted by week
 */
export function calculateVolumeByWeek(
  workouts: WorkoutWithExercises[],
): Array<{ week: string; volume: number }> {
  const weekMap = new Map<string, number>();

  for (const workout of workouts) {
    const date = new Date(workout.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());

    const weekKey = weekStart.toISOString().split("T")[0];
    const existing = weekMap.get(weekKey) || 0;
    weekMap.set(weekKey, existing + workout.totalVolume);
  }

  return Array.from(weekMap.entries())
    .map(([week, volume]) => ({ week, volume }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

/**
 * Calculate exercise frequency (how many times each exercise was done)
 */
export function calculateExerciseFrequency(
  workouts: WorkoutWithExercises[],
): Array<{ name: string; count: number }> {
  const frequencyMap = new Map<string, number>();

  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      const existing = frequencyMap.get(exercise.name) || 0;
      frequencyMap.set(exercise.name, existing + 1);
    }
  }

  return Array.from(frequencyMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate all dashboard statistics at once
 */
export function calculateDashboardStats(
  workouts: WorkoutWithExercises[],
): DashboardStats {
  const totalWorkouts = calculateTotalWorkouts(workouts);
  const totalExercisesLogged = calculateTotalExercisesLogged(workouts);
  const totalVolumeLifted = calculateTotalVolume(workouts);

  return {
    totalWorkouts,
    totalExercisesLogged,
    currentStreak: calculateCurrentStreak(workouts),
    totalVolumeLifted,
    averageVolumePerWorkout:
      totalWorkouts > 0 ? totalVolumeLifted / totalWorkouts : 0,
    favoriteExercises: calculateFavoriteExercises(workouts),
    personalRecords: calculatePersonalRecords(workouts),
    volumeByWeek: calculateVolumeByWeek(workouts),
    exerciseFrequency: calculateExerciseFrequency(workouts),
  };
}
