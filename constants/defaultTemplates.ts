/**
 * Default Workout Templates
 * Pre-installed templates for Push/Pull/Legs, Bro Split, and Full Body
 */

import { createCompleteTemplate } from "../lib/database/templateQueries";

export interface DefaultTemplate {
  name: string;
  category: "PPL" | "Bro Split" | "Full Body";
  notes: string;
  exercises: { name: string; notes?: string }[];
}

// Push/Pull/Legs Split (3 templates)
export const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  // PPL Day 1: Push
  {
    name: "Push Day",
    category: "PPL",
    notes: "Chest, shoulders, and triceps workout",
    exercises: [
      { name: "Bench Press", notes: "Compound chest exercise" },
      { name: "Incline Bench Press", notes: "Upper chest focus" },
      { name: "Overhead Press", notes: "Shoulder compound" },
      { name: "Lateral Raise", notes: "Medial deltoid isolation" },
      { name: "Tricep Pushdown", notes: "Tricep isolation" },
      { name: "Skull Crushers", notes: "Tricep compound" },
    ],
  },

  // PPL Day 2: Pull
  {
    name: "Pull Day",
    category: "PPL",
    notes: "Back and biceps workout",
    exercises: [
      { name: "Deadlift", notes: "Full back compound" },
      { name: "Pull-ups", notes: "Lat focus" },
      { name: "Barbell Row", notes: "Mid-back thickness" },
      { name: "Face Pulls", notes: "Rear delts and upper back" },
      { name: "Bicep Curls", notes: "Bicep isolation" },
      { name: "Hammer Curls", notes: "Brachialis and bicep" },
    ],
  },

  // PPL Day 3: Legs
  {
    name: "Leg Day",
    category: "PPL",
    notes: "Quads, hamstrings, glutes, and calves",
    exercises: [
      { name: "Squat", notes: "Quad and glute compound" },
      { name: "Romanian Deadlift", notes: "Hamstring and glute focus" },
      { name: "Leg Press", notes: "Quad volume" },
      { name: "Leg Curl", notes: "Hamstring isolation" },
      { name: "Leg Extension", notes: "Quad isolation" },
      { name: "Calf Raise", notes: "Calf development" },
    ],
  },

  // Bro Split Day 1: Chest
  {
    name: "Chest Day",
    category: "Bro Split",
    notes: "Comprehensive chest workout",
    exercises: [
      { name: "Bench Press", notes: "Heavy compound" },
      { name: "Incline Dumbbell Press", notes: "Upper chest" },
      { name: "Decline Bench Press", notes: "Lower chest" },
      { name: "Chest Fly", notes: "Chest stretch and squeeze" },
      { name: "Push-ups", notes: "Burnout finisher" },
    ],
  },

  // Bro Split Day 2: Back
  {
    name: "Back Day",
    category: "Bro Split",
    notes: "Complete back development",
    exercises: [
      { name: "Deadlift", notes: "Overall back mass" },
      { name: "Pull-ups", notes: "Lat width" },
      { name: "Barbell Row", notes: "Mid-back thickness" },
      { name: "T-Bar Row", notes: "Lower lat focus" },
      { name: "Lat Pulldown", notes: "Lat pump" },
      { name: "Face Pulls", notes: "Rear delts" },
    ],
  },

  // Bro Split Day 3: Shoulders
  {
    name: "Shoulder Day",
    category: "Bro Split",
    notes: "All three deltoid heads",
    exercises: [
      { name: "Overhead Press", notes: "Compound shoulder builder" },
      { name: "Shoulder Press", notes: "Dumbbell variation" },
      { name: "Lateral Raise", notes: "Medial delt isolation" },
      { name: "Front Raise", notes: "Anterior delt" },
      { name: "Face Pulls", notes: "Rear delts" },
      { name: "Shrugs", notes: "Trap development" },
    ],
  },

  // Bro Split Day 4: Arms
  {
    name: "Arm Day",
    category: "Bro Split",
    notes: "Biceps and triceps superset focus",
    exercises: [
      { name: "Bicep Curls", notes: "Bicep mass builder" },
      { name: "Tricep Dips", notes: "Tricep compound" },
      { name: "Hammer Curls", notes: "Brachialis focus" },
      { name: "Tricep Pushdown", notes: "Tricep isolation" },
      { name: "Preacher Curls", notes: "Bicep peak" },
      { name: "Skull Crushers", notes: "Long head tricep" },
    ],
  },

  // Bro Split Day 5: Legs
  {
    name: "Leg Day (Bro Split)",
    category: "Bro Split",
    notes: "Complete lower body workout",
    exercises: [
      { name: "Squat", notes: "Quad compound" },
      { name: "Romanian Deadlift", notes: "Hamstring builder" },
      { name: "Leg Press", notes: "Quad volume" },
      { name: "Leg Curl", notes: "Hamstring isolation" },
      { name: "Bulgarian Split Squat", notes: "Unilateral leg work" },
      { name: "Calf Raise", notes: "Calf development" },
    ],
  },

  // Full Body
  {
    name: "Full Body Workout",
    category: "Full Body",
    notes: "Efficient full body compound movements",
    exercises: [
      { name: "Squat", notes: "Lower body compound" },
      { name: "Bench Press", notes: "Upper body push" },
      { name: "Deadlift", notes: "Posterior chain" },
      { name: "Overhead Press", notes: "Shoulder compound" },
      { name: "Barbell Row", notes: "Back compound" },
      { name: "Pull-ups", notes: "Lat development" },
      { name: "Bicep Curls", notes: "Arm isolation" },
      { name: "Tricep Pushdown", notes: "Arm isolation" },
    ],
  },
];

/**
 * Seed default templates into the database
 * Only inserts if no default templates exist yet
 */
export async function seedDefaultTemplates(): Promise<void> {
  try {
    console.log("🌱 Checking for default templates...");

    // Check if defaults already exist (check for any template with is_default = 1)
    const { getAllWorkoutTemplates } =
      await import("../lib/database/templateQueries");
    const existing = await getAllWorkoutTemplates();
    const hasDefaults = existing.some((t) => t.isDefault);

    if (hasDefaults) {
      console.log("✅ Default templates already exist, skipping seed");
      return;
    }

    console.log("🌱 Seeding default templates...");

    for (const template of DEFAULT_TEMPLATES) {
      await createCompleteTemplate(
        template.name,
        template.category,
        template.notes,
        template.exercises,
        true, // isDefault = true
      );
    }

    console.log(`✅ Seeded ${DEFAULT_TEMPLATES.length} default templates`);
  } catch (error) {
    console.error("❌ Error seeding default templates:", error);
    throw error;
  }
}
