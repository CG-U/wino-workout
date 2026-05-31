/**
 * Custom Exercise Queries
 * CRUD operations for user-defined custom exercises
 */

import * as Crypto from "expo-crypto";
import { getDatabase } from "./db";

export interface CustomExercise {
  id: string;
  name: string;
  createdAt: number;
}

/**
 * Add a custom exercise. Returns the exercise if created, or null if it already exists.
 */
export async function addCustomExercise(
  name: string,
): Promise<CustomExercise | null> {
  const db = getDatabase();
  const trimmed = name.trim();
  if (!trimmed) return null;

  // Check if it already exists (case-insensitive due to COLLATE NOCASE)
  const existing = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM custom_exercises WHERE name = ?`,
    [trimmed],
  );
  if (existing) return null;

  const id = Crypto.randomUUID();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO custom_exercises (id, name, created_at) VALUES (?, ?, ?)`,
    [id, trimmed, now],
  );

  return { id, name: trimmed, createdAt: now };
}

/**
 * Get all custom exercise names (sorted alphabetically)
 */
export async function getAllCustomExercises(): Promise<string[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ name: string }>(
    `SELECT name FROM custom_exercises ORDER BY name ASC`,
  );
  return rows.map((r) => r.name);
}

/**
 * Delete a custom exercise by name
 */
export async function deleteCustomExercise(name: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync(`DELETE FROM custom_exercises WHERE name = ?`, [name]);
}
