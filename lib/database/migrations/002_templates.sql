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
