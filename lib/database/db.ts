/**
 * Database Initialization
 * Handles SQLite setup, migrations, and connection
 */

import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

const MIGRATION_1 = `
-- Migrations table to track which migrations have been run
CREATE TABLE IF NOT EXISTS _prisma_migrations (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL,
  name TEXT NOT NULL,
  executedAt INTEGER NOT NULL
);

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Exercises table (belongs to a workout)
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL,
  name TEXT NOT NULL,
  notes TEXT DEFAULT '',
  "order" INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

-- Sets table (belongs to an exercise)
CREATE TABLE IF NOT EXISTS sets (
  id TEXT PRIMARY KEY,
  exercise_id TEXT NOT NULL,
  reps INTEGER NOT NULL,
  weight REAL NOT NULL,
  "order" INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_sets_exercise_id ON sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
`;

const MIGRATION_2 = `
-- Migration 002: Workout Templates
-- Create tables for workout templates and template exercises
-- Add template_id reference to workouts table

-- Create workout_templates table
CREATE TABLE IF NOT EXISTS workout_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('PPL', 'Bro Split', 'Full Body', 'Custom')),
  notes TEXT DEFAULT '',
  is_default INTEGER DEFAULT 0 CHECK(is_default IN (0, 1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create template_exercises table
CREATE TABLE IF NOT EXISTS template_exercises (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  notes TEXT DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE
);

-- Add template_id column to workouts table (nullable for backwards compatibility)
ALTER TABLE workouts ADD COLUMN template_id TEXT REFERENCES workout_templates(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_template_exercises_template_id ON template_exercises(template_id);
CREATE INDEX IF NOT EXISTS idx_workouts_template_id ON workouts(template_id);
CREATE INDEX IF NOT EXISTS idx_workout_templates_category ON workout_templates(category);
`;

const MIGRATION_3 = `
-- Migration 003: Custom Exercises
-- Create table for user-defined custom exercises that persist across sessions

CREATE TABLE IF NOT EXISTS custom_exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_custom_exercises_name ON custom_exercises(name);
`;

/**
 * Initialize the database
 * Runs migrations if needed
 */
export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync("wino_workout.db");

    // Enable foreign keys
    await db.execAsync("PRAGMA foreign_keys = ON;");

    // Run migrations
    await runMigrations(db);

    console.log("✅ Database initialized successfully");
    return db;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first.",
    );
  }
  return db;
}

/**
 * Run database migrations
 */
async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  try {
    // Check if migrations table exists
    const result = await database.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='_prisma_migrations';",
    );

    // First run - create migrations table via migration
    if (!result) {
      console.log("🔄 Running initial migration...");
      await database.execAsync(MIGRATION_1);

      // Record migration 1
      await database.runAsync(
        "INSERT INTO _prisma_migrations (id, version, name, executedAt) VALUES (?, ?, ?, ?)",
        ["migration_001", 1, "001_initial_schema", Date.now()],
      );
      console.log("✅ Migration 1 completed");
    } else {
      console.log("✅ Migrations table exists");
    }

    // Check if migration 2 has been run
    const migration2 = await database.getFirstAsync<{ version: number }>(
      "SELECT version FROM _prisma_migrations WHERE version = 2",
    );

    if (!migration2) {
      console.log("🔄 Running templates migration...");
      await database.execAsync(MIGRATION_2);

      // Record migration 2
      await database.runAsync(
        "INSERT INTO _prisma_migrations (id, version, name, executedAt) VALUES (?, ?, ?, ?)",
        ["migration_002", 2, "002_templates", Date.now()],
      );
      console.log("✅ Migration 2 completed");
    }

    // Check if migration 3 has been run
    const migration3 = await database.getFirstAsync<{ version: number }>(
      "SELECT version FROM _prisma_migrations WHERE version = 3",
    );

    if (!migration3) {
      console.log("🔄 Running custom exercises migration...");
      await database.execAsync(MIGRATION_3);

      // Record migration 3
      await database.runAsync(
        "INSERT INTO _prisma_migrations (id, version, name, executedAt) VALUES (?, ?, ?, ?)",
        ["migration_003", 3, "003_custom_exercises", Date.now()],
      );
      console.log("✅ Migration 3 completed");
    }
  } catch (error) {
    console.error("❌ Migration error:", error);
    throw error;
  }
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    try {
      await db.closeAsync();
      db = null;
      console.log("✅ Database closed");
    } catch (error) {
      console.error("❌ Error closing database:", error);
    }
  }
}

/**
 * Reset the database (development only)
 */
export async function resetDatabase(): Promise<void> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    await db.execAsync(`
      DROP TABLE IF EXISTS sets;
      DROP TABLE IF EXISTS exercises;
      DROP TABLE IF EXISTS workouts;
      DROP TABLE IF EXISTS template_exercises;
      DROP TABLE IF EXISTS workout_templates;
      DROP TABLE IF EXISTS _prisma_migrations;
    `);

    await runMigrations(db);
    console.log("✅ Database reset successfully");
  } catch (error) {
    console.error("❌ Database reset failed:", error);
    throw error;
  }
}
