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
      console.log("✅ Initial migration completed");
    } else {
      // Future: check which migrations have been run and run pending ones
      console.log("✅ Migrations table exists");
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
      DROP TABLE IF EXISTS _prisma_migrations;
    `);

    await runMigrations(db);
    console.log("✅ Database reset successfully");
  } catch (error) {
    console.error("❌ Database reset failed:", error);
    throw error;
  }
}
