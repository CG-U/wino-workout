/**
 * Workout Operations Hook
 * Convenience hooks for common workout operations with DB sync
 */

import { useWorkout } from "@/contexts/WorkoutContext";
import * as queries from "@/lib/database/queries";

export function useWorkoutOperations() {
  const { dispatch } = useWorkout();

  const loadAllWorkouts = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const workouts = await queries.getAllWorkoutsWithExercises();
      dispatch({ type: "SET_WORKOUTS", payload: workouts });
    } catch (error) {
      console.error("Failed to load workouts:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to load workouts",
      });
    }
  };

  const saveWorkout = async (
    date: string,
    notes: string,
    exercisesData: Array<{
      name: string;
      notes?: string;
      sets: Array<{ reps: number; weight: number }>;
    }>,
    templateId?: string | null,
  ) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const workout = await queries.createCompleteWorkout(
        date,
        notes,
        exercisesData,
        templateId,
      );
      dispatch({ type: "ADD_WORKOUT", payload: workout });
      dispatch({ type: "SET_LOADING", payload: false });
      return workout;
    } catch (error) {
      console.error("Failed to save workout:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to save workout",
      });
      throw error;
    }
  };

  const updateWorkoutData = async (
    workoutId: string,
    date?: string,
    notes?: string,
  ) => {
    try {
      await queries.updateWorkout(workoutId, date, notes);
      const updated = await queries.getWorkoutWithExercises(workoutId);
      if (updated) {
        dispatch({ type: "UPDATE_WORKOUT", payload: updated });
      }
    } catch (error) {
      console.error("Failed to update workout:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to update workout",
      });
      throw error;
    }
  };

  const deleteWorkoutData = async (workoutId: string) => {
    try {
      await queries.deleteWorkout(workoutId);
      dispatch({ type: "DELETE_WORKOUT", payload: workoutId });
    } catch (error) {
      console.error("Failed to delete workout:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to delete workout",
      });
      throw error;
    }
  };

  const updateExerciseData = async (
    exerciseId: string,
    name?: string,
    notes?: string,
  ) => {
    try {
      await queries.updateExercise(exerciseId, name, notes);
      // Reload workouts to update context
      await loadAllWorkouts();
    } catch (error) {
      console.error("Failed to update exercise:", error);
      throw error;
    }
  };

  const deleteExerciseData = async (exerciseId: string) => {
    try {
      await queries.deleteExercise(exerciseId);
      // Reload workouts to update context
      await loadAllWorkouts();
    } catch (error) {
      console.error("Failed to delete exercise:", error);
      throw error;
    }
  };

  const updateSetData = async (
    setId: string,
    reps?: number,
    weight?: number,
  ) => {
    try {
      await queries.updateSet(setId, reps, weight);
      // Reload workouts to update context
      await loadAllWorkouts();
    } catch (error) {
      console.error("Failed to update set:", error);
      throw error;
    }
  };

  const deleteSetData = async (setId: string) => {
    try {
      await queries.deleteSet(setId);
      // Reload workouts to update context
      await loadAllWorkouts();
    } catch (error) {
      console.error("Failed to delete set:", error);
      throw error;
    }
  };

  return {
    loadAllWorkouts,
    saveWorkout,
    updateWorkoutData,
    deleteWorkoutData,
    updateExerciseData,
    deleteExerciseData,
    updateSetData,
    deleteSetData,
  };
}
