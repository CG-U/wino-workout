/**
 * Workout Context
 * Global state management for workout data
 */

import { WorkoutWithExercises } from "@/lib/database/schema";
import React, { createContext, ReactNode, useContext, useReducer } from "react";

export interface WorkoutContextType {
  workouts: WorkoutWithExercises[];
  loading: boolean;
  error: string | null;
  dispatch: React.Dispatch<WorkoutAction>;
}

export type WorkoutAction =
  | { type: "SET_WORKOUTS"; payload: WorkoutWithExercises[] }
  | { type: "ADD_WORKOUT"; payload: WorkoutWithExercises }
  | { type: "UPDATE_WORKOUT"; payload: WorkoutWithExercises }
  | { type: "DELETE_WORKOUT"; payload: string } // workout id
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" };

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const initialState: Omit<WorkoutContextType, "dispatch"> = {
  workouts: [],
  loading: false,
  error: null,
};

function workoutReducer(
  state: Omit<WorkoutContextType, "dispatch">,
  action: WorkoutAction,
): Omit<WorkoutContextType, "dispatch"> {
  switch (action.type) {
    case "SET_WORKOUTS":
      return {
        ...state,
        workouts: action.payload,
        loading: false,
        error: null,
      };

    case "ADD_WORKOUT":
      return {
        ...state,
        workouts: [action.payload, ...state.workouts],
        error: null,
      };

    case "UPDATE_WORKOUT": {
      const updatedWorkouts = state.workouts.map((w) =>
        w.id === action.payload.id ? action.payload : w,
      );
      return {
        ...state,
        workouts: updatedWorkouts,
        error: null,
      };
    }

    case "DELETE_WORKOUT":
      return {
        ...state,
        workouts: state.workouts.filter((w) => w.id !== action.payload),
        error: null,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

interface WorkoutProviderProps {
  children: ReactNode;
}

export function WorkoutProvider({ children }: WorkoutProviderProps) {
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  const value: WorkoutContextType = {
    workouts: state.workouts,
    loading: state.loading,
    error: state.error,
    dispatch,
  };

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  );
}

/**
 * Hook to use the Workout context
 */
export function useWorkout(): WorkoutContextType {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
