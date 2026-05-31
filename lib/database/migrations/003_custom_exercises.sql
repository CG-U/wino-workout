-- Migration 003: Custom Exercises
-- Create table for user-defined custom exercises that persist across sessions

CREATE TABLE IF NOT EXISTS custom_exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_custom_exercises_name ON custom_exercises(name);
