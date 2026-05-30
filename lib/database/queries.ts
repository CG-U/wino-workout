/**
 * Database Queries
 * CRUD operations for Workouts, Exercises, and Sets
 */

import * as Crypto from "expo-crypto";
import { getDatabase } from "./db";
import {
  Exercise,
  ExerciseWithSets,
  Set,
  Workout,
  WorkoutWithExercises,
} from "./schema";

// ============================================================================
// WORKOUT QUERIES
// ============================================================================

export async function createWorkout(
  date: string,
  notes: string = "",
  templateId?: string | null,
): Promise<Workout> {
  const db = getDatabase();
  const id = Crypto.randomUUID();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO workouts (id, date, notes, template_id, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, date, notes, templateId || null, now, now],
  );

  return { id, date, notes, templateId, createdAt: now, updatedAt: now };
}

export async function getWorkout(id: string): Promise<Workout | null> {
  const db = getDatabase();
  const result = await db.getFirstAsync<Workout>(
    `SELECT 
      id, date, notes, template_id as templateId, created_at as createdAt, updated_at as updatedAt
     FROM workouts WHERE id = ?`,
    [id],
  );
  return result || null;
}

export async function getAllWorkouts(): Promise<Workout[]> {
  const db = getDatabase();
  const results = await db.getAllAsync<Workout>(
    `SELECT id, date, notes, template_id as templateId, created_at as createdAt, updated_at as updatedAt
     FROM workouts ORDER BY date DESC`,
  );
  return results || [];
}

export async function getWorkoutsByDateRange(
  startDate: string,
  endDate: string,
): Promise<Workout[]> {
  const db = getDatabase();
  const results = await db.getAllAsync<Workout>(
    `SELECT id, date, notes, created_at as createdAt, updated_at as updatedAt
     FROM workouts WHERE date BETWEEN ? AND ? ORDER BY date DESC`,
    [startDate, endDate],
  );
  return results || [];
}

export async function updateWorkout(
  id: string,
  date?: string,
  notes?: string,
): Promise<Workout | null> {
  const db = getDatabase();
  const now = Date.now();
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (date !== undefined) {
    updates.push("date = ?");
    values.push(date);
  }
  if (notes !== undefined) {
    updates.push("notes = ?");
    values.push(notes);
  }

  if (updates.length === 0) {
    return getWorkout(id);
  }

  updates.push("updated_at = ?");
  values.push(now);
  values.push(id);

  await db.runAsync(
    `UPDATE workouts SET ${updates.join(", ")} WHERE id = ?`,
    values,
  );

  return getWorkout(id);
}

export async function deleteWorkout(id: string): Promise<boolean> {
  const db = getDatabase();
  const result = await db.runAsync(`DELETE FROM workouts WHERE id = ?`, [id]);
  return (result.changes || 0) > 0;
}

// ============================================================================
// EXERCISE QUERIES
// ============================================================================

export async function createExercise(
  workoutId: string,
  name: string,
  notes: string = "",
  order: number = 0,
): Promise<Exercise> {
  const db = getDatabase();
  const id = Crypto.randomUUID();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO exercises (id, workout_id, name, notes, "order", created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, workoutId, name, notes, order, now, now],
  );

  return { id, workoutId, name, notes, order, createdAt: now, updatedAt: now };
}

export async function getExercise(id: string): Promise<Exercise | null> {
  const db = getDatabase();
  const result = await db.getFirstAsync<Exercise>(
    `SELECT id, workout_id as workoutId, name, notes, "order" as sortOrder, created_at as createdAt, updated_at as updatedAt
     FROM exercises WHERE id = ?`,
    [id],
  );
  return result ? { ...result, order: result.sortOrder } : null;
}

export async function getExercisesByWorkout(
  workoutId: string,
): Promise<Exercise[]> {
  const db = getDatabase();
  const results = await db.getAllAsync<Exercise>(
    `SELECT id, workout_id as workoutId, name, notes, "order" as sortOrder, created_at as createdAt, updated_at as updatedAt
     FROM exercises WHERE workout_id = ? ORDER BY "order" ASC`,
    [workoutId],
  );
  return results ? results.map((r) => ({ ...r, order: r.sortOrder })) : [];
}

export async function updateExercise(
  id: string,
  name?: string,
  notes?: string,
  order?: number,
): Promise<Exercise | null> {
  const db = getDatabase();
  const now = Date.now();
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (name !== undefined) {
    updates.push("name = ?");
    values.push(name);
  }
  if (notes !== undefined) {
    updates.push("notes = ?");
    values.push(notes);
  }
  if (order !== undefined) {
    updates.push('"order" = ?');
    values.push(order);
  }

  if (updates.length === 0) {
    return getExercise(id);
  }

  updates.push("updated_at = ?");
  values.push(now);
  values.push(id);

  await db.runAsync(
    `UPDATE exercises SET ${updates.join(", ")} WHERE id = ?`,
    values,
  );

  return getExercise(id);
}

export async function deleteExercise(id: string): Promise<boolean> {
  const db = getDatabase();
  const result = await db.runAsync(`DELETE FROM exercises WHERE id = ?`, [id]);
  return (result.changes || 0) > 0;
}

// ============================================================================
// SET QUERIES
// ============================================================================

export async function createSet(
  exerciseId: string,
  reps: number,
  weight: number,
  order: number = 0,
): Promise<Set> {
  const db = getDatabase();
  const id = Crypto.randomUUID();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO sets (id, exercise_id, reps, weight, "order", created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, exerciseId, reps, weight, order, now, now],
  );

  return {
    id,
    exerciseId,
    reps,
    weight,
    order,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getSet(id: string): Promise<Set | null> {
  const db = getDatabase();
  const result = await db.getFirstAsync<Set>(
    `SELECT id, exercise_id as exerciseId, reps, weight, "order" as sortOrder, created_at as createdAt, updated_at as updatedAt
     FROM sets WHERE id = ?`,
    [id],
  );
  return result ? { ...result, order: result.sortOrder } : null;
}

export async function getSetsByExercise(exerciseId: string): Promise<Set[]> {
  const db = getDatabase();
  const results = await db.getAllAsync<Set>(
    `SELECT id, exercise_id as exerciseId, reps, weight, "order" as sortOrder, created_at as createdAt, updated_at as updatedAt
     FROM sets WHERE exercise_id = ? ORDER BY "order" ASC`,
    [exerciseId],
  );
  return results ? results.map((r) => ({ ...r, order: r.sortOrder })) : [];
}

export async function updateSet(
  id: string,
  reps?: number,
  weight?: number,
  order?: number,
): Promise<Set | null> {
  const db = getDatabase();
  const now = Date.now();
  const updates: string[] = [];
  const values: (number | string)[] = [];

  if (reps !== undefined) {
    updates.push("reps = ?");
    values.push(reps);
  }
  if (weight !== undefined) {
    updates.push("weight = ?");
    values.push(weight);
  }
  if (order !== undefined) {
    updates.push('"order" = ?');
    values.push(order);
  }

  if (updates.length === 0) {
    return getSet(id);
  }

  updates.push("updated_at = ?");
  values.push(now);
  values.push(id);

  await db.runAsync(
    `UPDATE sets SET ${updates.join(", ")} WHERE id = ?`,
    values,
  );

  return getSet(id);
}

export async function deleteSet(id: string): Promise<boolean> {
  const db = getDatabase();
  const result = await db.runAsync(`DELETE FROM sets WHERE id = ?`, [id]);
  return (result.changes || 0) > 0;
}

// ============================================================================
// COMPOSITE QUERIES (Workouts with all relations)
// ============================================================================

export async function getWorkoutWithExercises(
  id: string,
): Promise<WorkoutWithExercises | null> {
  const workout = await getWorkout(id);
  if (!workout) return null;

  // Fetch template name if workout has template_id
  let templateName: string | null = null;
  if (workout.templateId) {
    const db = getDatabase();
    const templateResult = await db.getFirstAsync<{ name: string }>(
      `SELECT name FROM workout_templates WHERE id = ?`,
      [workout.templateId],
    );
    templateName = templateResult?.name || null;
  }

  const exercises = await getExercisesByWorkout(id);
  const exercisesWithSets: ExerciseWithSets[] = [];
  let totalVolume = 0;

  for (const exercise of exercises) {
    const sets = await getSetsByExercise(exercise.id);
    const exerciseTotalVolume = sets.reduce(
      (sum, set) => sum + set.reps * set.weight,
      0,
    );
    const exerciseTotalReps = sets.reduce((sum, set) => sum + set.reps, 0);
    totalVolume += exerciseTotalVolume;

    exercisesWithSets.push({
      ...exercise,
      sets,
      totalVolume: exerciseTotalVolume,
      totalReps: exerciseTotalReps,
    });
  }

  return {
    ...workout,
    exercises: exercisesWithSets,
    totalVolume,
    exerciseCount: exercises.length,
    templateName,
  };
}

export async function getAllWorkoutsWithExercises(): Promise<
  WorkoutWithExercises[]
> {
  const workouts = await getAllWorkouts();
  const result: WorkoutWithExercises[] = [];

  for (const workout of workouts) {
    const fullWorkout = await getWorkoutWithExercises(workout.id);
    if (fullWorkout) {
      result.push(fullWorkout);
    }
  }

  return result;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Create a complete workout with exercises and sets in a transaction
 */
export async function createCompleteWorkout(
  date: string,
  notes: string,
  exercisesData: Array<{
    name: string;
    notes?: string;
    sets: Array<{ reps: number; weight: number }>;
  }>,
  templateId?: string | null,
): Promise<WorkoutWithExercises> {
  const db = getDatabase();

  try {
    // Start transaction
    await db.execAsync("BEGIN TRANSACTION");

    // Create workout
    const workout = await createWorkout(date, notes, templateId);

    // Create exercises and sets
    const exercisesWithSets: ExerciseWithSets[] = [];
    let totalVolume = 0;

    for (let exIndex = 0; exIndex < exercisesData.length; exIndex++) {
      const exData = exercisesData[exIndex];
      const exercise = await createExercise(
        workout.id,
        exData.name,
        exData.notes || "",
        exIndex,
      );

      const sets: Set[] = [];
      let exerciseTotalVolume = 0;
      let exerciseTotalReps = 0;

      for (let setIndex = 0; setIndex < exData.sets.length; setIndex++) {
        const setData = exData.sets[setIndex];
        const set = await createSet(
          exercise.id,
          setData.reps,
          setData.weight,
          setIndex,
        );
        sets.push(set);
        exerciseTotalVolume += set.reps * set.weight;
        exerciseTotalReps += set.reps;
      }

      totalVolume += exerciseTotalVolume;
      exercisesWithSets.push({
        ...exercise,
        sets,
        totalVolume: exerciseTotalVolume,
        totalReps: exerciseTotalReps,
      });
    }

    // Commit transaction
    await db.execAsync("COMMIT");

    // Fetch template name if workout has template_id
    let templateName: string | null = null;
    if (workout.templateId) {
      const templateResult = await db.getFirstAsync<{ name: string }>(
        `SELECT name FROM workout_templates WHERE id = ?`,
        [workout.templateId],
      );
      templateName = templateResult?.name || null;
    }

    return {
      ...workout,
      exercises: exercisesWithSets,
      totalVolume,
      exerciseCount: exercisesWithSets.length,
      templateName,
    };
  } catch (error) {
    // Rollback transaction on error
    await db.execAsync("ROLLBACK");
    throw error;
  }
}
