/**
 * Session Database Queries
 * Queries for active workout sessions and historical performance lookup
 */

import { getDatabase } from "./db";
import { ExercisePerformance } from "./schema";

// ============================================================================
// SESSION QUERIES
// ============================================================================

/**
 * Get the last performance for a specific exercise
 * Used to show "Last time: 3x10 @ 135 lbs" during active session
 */
export async function getLastExercisePerformance(
  exerciseName: string,
): Promise<ExercisePerformance | null> {
  const db = getDatabase();

  // Find the most recent workout that included this exercise
  const exerciseRow = await db.getFirstAsync<{
    exercise_id: string;
    workout_date: string;
  }>(
    `SELECT e.id as exercise_id, w.date as workout_date
     FROM exercises e
     JOIN workouts w ON e.workout_id = w.id
     WHERE LOWER(e.name) = LOWER(?)
     ORDER BY w.date DESC, w.created_at DESC
     LIMIT 1`,
    [exerciseName],
  );

  if (!exerciseRow) return null;

  // Get all sets for this exercise
  const sets = await db.getAllAsync<{
    reps: number;
    weight: number;
  }>(
    `SELECT reps, weight FROM sets 
     WHERE exercise_id = ? 
     ORDER BY "order" ASC`,
    [exerciseRow.exercise_id],
  );

  if (sets.length === 0) return null;

  const totalVolume = sets.reduce((sum, set) => sum + set.reps * set.weight, 0);

  return {
    date: exerciseRow.workout_date,
    sets: sets.map((s) => ({ reps: s.reps, weight: s.weight })),
    totalVolume,
  };
}

/**
 * Get all previous performances for an exercise (for trend analysis)
 */
export async function getExerciseHistory(
  exerciseName: string,
  limit: number = 10,
): Promise<ExercisePerformance[]> {
  const db = getDatabase();

  // Get all workouts that included this exercise
  const exercises = await db.getAllAsync<{
    exercise_id: string;
    workout_date: string;
  }>(
    `SELECT e.id as exercise_id, w.date as workout_date
     FROM exercises e
     JOIN workouts w ON e.workout_id = w.id
     WHERE LOWER(e.name) = LOWER(?)
     ORDER BY w.date DESC, w.created_at DESC
     LIMIT ?`,
    [exerciseName, limit],
  );

  const performances: ExercisePerformance[] = [];

  for (const exercise of exercises) {
    const sets = await db.getAllAsync<{
      reps: number;
      weight: number;
    }>(
      `SELECT reps, weight FROM sets 
       WHERE exercise_id = ? 
       ORDER BY "order" ASC`,
      [exercise.exercise_id],
    );

    if (sets.length > 0) {
      const totalVolume = sets.reduce(
        (sum, set) => sum + set.reps * set.weight,
        0,
      );

      performances.push({
        date: exercise.workout_date,
        sets: sets.map((s) => ({ reps: s.reps, weight: s.weight })),
        totalVolume,
      });
    }
  }

  return performances;
}

/**
 * Get the most recently used templates
 * Used for "Recently Used" section on Home screen
 */
export async function getRecentlyUsedTemplates(
  limit: number = 5,
): Promise<
  Array<{ templateId: string; templateName: string; lastUsed: string }>
> {
  const db = getDatabase();

  const rows = await db.getAllAsync<{
    template_id: string;
    template_name: string;
    last_used: string;
  }>(
    `SELECT 
       w.template_id,
       t.name as template_name,
       MAX(w.date) as last_used
     FROM workouts w
     JOIN workout_templates t ON w.template_id = t.id
     WHERE w.template_id IS NOT NULL
     GROUP BY w.template_id
     ORDER BY last_used DESC
     LIMIT ?`,
    [limit],
  );

  return rows.map((row) => ({
    templateId: row.template_id,
    templateName: row.template_name,
    lastUsed: row.last_used,
  }));
}

/**
 * Count sessions created from a specific template
 */
export async function getTemplateUsageCount(
  templateId: string,
): Promise<number> {
  const db = getDatabase();

  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM workouts WHERE template_id = ?`,
    [templateId],
  );

  return result?.count || 0;
}

/**
 * Get most used templates for analytics
 */
export async function getMostUsedTemplates(
  limit: number = 5,
): Promise<Array<{ templateId: string; templateName: string; count: number }>> {
  const db = getDatabase();

  const rows = await db.getAllAsync<{
    template_id: string;
    template_name: string;
    usage_count: number;
  }>(
    `SELECT 
       w.template_id,
       t.name as template_name,
       COUNT(*) as usage_count
     FROM workouts w
     JOIN workout_templates t ON w.template_id = t.id
     WHERE w.template_id IS NOT NULL
     GROUP BY w.template_id
     ORDER BY usage_count DESC
     LIMIT ?`,
    [limit],
  );

  return rows.map((row) => ({
    templateId: row.template_id,
    templateName: row.template_name,
    count: row.usage_count,
  }));
}
