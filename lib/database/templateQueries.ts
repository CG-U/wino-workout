/**
 * Template Database Queries
 * CRUD operations for Workout Templates and Template Exercises
 */

import * as Crypto from "expo-crypto";
import { getDatabase } from "./db";
import {
  WorkoutTemplate,
  TemplateExercise,
  WorkoutTemplateWithExercises,
} from "./schema";

// ============================================================================
// WORKOUT TEMPLATE QUERIES
// ============================================================================

export async function createWorkoutTemplate(
  name: string,
  category: "PPL" | "Bro Split" | "Full Body" | "Custom",
  notes: string = "",
  isDefault: boolean = false,
): Promise<WorkoutTemplate> {
  const db = getDatabase();
  const id = Crypto.randomUUID();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO workout_templates (id, name, category, notes, is_default, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, name, category, notes, isDefault ? 1 : 0, now, now],
  );

  return {
    id,
    name,
    category,
    notes,
    isDefault,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getWorkoutTemplate(
  id: string,
): Promise<WorkoutTemplate | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<{
    id: string;
    name: string;
    category: string;
    notes: string;
    is_default: number;
    created_at: number;
    updated_at: number;
  }>(`SELECT * FROM workout_templates WHERE id = ?`, [id]);

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    category: row.category as WorkoutTemplate["category"],
    notes: row.notes,
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllWorkoutTemplates(): Promise<WorkoutTemplate[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    category: string;
    notes: string;
    is_default: number;
    created_at: number;
    updated_at: number;
  }>(`SELECT * FROM workout_templates ORDER BY is_default DESC, created_at DESC`);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category as WorkoutTemplate["category"],
    notes: row.notes,
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function updateWorkoutTemplate(
  id: string,
  name: string,
  category: "PPL" | "Bro Split" | "Full Body" | "Custom",
  notes: string = "",
): Promise<void> {
  const db = getDatabase();
  const now = Date.now();

  await db.runAsync(
    `UPDATE workout_templates 
     SET name = ?, category = ?, notes = ?, updated_at = ?
     WHERE id = ?`,
    [name, category, notes, now, id],
  );
}

export async function deleteWorkoutTemplate(id: string): Promise<void> {
  const db = getDatabase();

  // Check if it's a default template (prevent deletion)
  const template = await getWorkoutTemplate(id);
  if (template?.isDefault) {
    throw new Error("Cannot delete default templates");
  }

  await db.runAsync(`DELETE FROM workout_templates WHERE id = ?`, [id]);
  // template_exercises will be cascade deleted due to foreign key
}

// ============================================================================
// TEMPLATE EXERCISE QUERIES
// ============================================================================

export async function createTemplateExercise(
  templateId: string,
  name: string,
  notes: string = "",
  order: number = 0,
): Promise<TemplateExercise> {
  const db = getDatabase();
  const id = Crypto.randomUUID();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO template_exercises (id, template_id, name, notes, "order", created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, templateId, name, notes, order, now],
  );

  return {
    id,
    templateId,
    name,
    notes,
    order,
    createdAt: now,
  };
}

export async function getTemplateExercises(
  templateId: string,
): Promise<TemplateExercise[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    template_id: string;
    name: string;
    notes: string;
    order: number;
    created_at: number;
  }>(
    `SELECT * FROM template_exercises WHERE template_id = ? ORDER BY "order" ASC`,
    [templateId],
  );

  return rows.map((row) => ({
    id: row.id,
    templateId: row.template_id,
    name: row.name,
    notes: row.notes,
    order: row.order,
    createdAt: row.created_at,
  }));
}

export async function updateTemplateExercise(
  id: string,
  name: string,
  notes: string = "",
  order: number = 0,
): Promise<void> {
  const db = getDatabase();

  await db.runAsync(
    `UPDATE template_exercises 
     SET name = ?, notes = ?, "order" = ?
     WHERE id = ?`,
    [name, notes, order, id],
  );
}

export async function deleteTemplateExercise(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync(`DELETE FROM template_exercises WHERE id = ?`, [id]);
}

export async function reorderTemplateExercises(
  exercises: { id: string; order: number }[],
): Promise<void> {
  const db = getDatabase();

  await db.withTransactionAsync(async () => {
    for (const exercise of exercises) {
      await db.runAsync(
        `UPDATE template_exercises SET "order" = ? WHERE id = ?`,
        [exercise.order, exercise.id],
      );
    }
  });
}

// ============================================================================
// COMPOSITE QUERIES
// ============================================================================

export async function getWorkoutTemplateWithExercises(
  id: string,
): Promise<WorkoutTemplateWithExercises | null> {
  const template = await getWorkoutTemplate(id);
  if (!template) return null;

  const exercises = await getTemplateExercises(id);

  return {
    ...template,
    exercises,
  };
}

export async function getAllWorkoutTemplatesWithExercises(): Promise<
  WorkoutTemplateWithExercises[]
> {
  const templates = await getAllWorkoutTemplates();

  const templatesWithExercises = await Promise.all(
    templates.map(async (template) => {
      const exercises = await getTemplateExercises(template.id);
      return {
        ...template,
        exercises,
      };
    }),
  );

  return templatesWithExercises;
}

export async function createCompleteTemplate(
  name: string,
  category: "PPL" | "Bro Split" | "Full Body" | "Custom",
  notes: string,
  exercises: { name: string; notes?: string }[],
  isDefault: boolean = false,
): Promise<WorkoutTemplateWithExercises> {
  const db = getDatabase();

  let createdTemplate: WorkoutTemplate;
  const createdExercises: TemplateExercise[] = [];

  await db.withTransactionAsync(async () => {
    // Create template
    createdTemplate = await createWorkoutTemplate(
      name,
      category,
      notes,
      isDefault,
    );

    // Create exercises
    for (let i = 0; i < exercises.length; i++) {
      const exercise = await createTemplateExercise(
        createdTemplate.id,
        exercises[i].name,
        exercises[i].notes || "",
        i,
      );
      createdExercises.push(exercise);
    }
  });

  return {
    ...createdTemplate!,
    exercises: createdExercises,
  };
}
