/**
 * Log Workout Screen
 * Main screen for logging a new workout with exercises and sets
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AddButton } from "@/components/WorkoutForm/AddButton";
import {
  ExerciseCard,
  ExerciseData,
} from "@/components/WorkoutForm/ExerciseCard";
import { ExercisePickerModal } from "@/components/WorkoutForm/ExercisePickerModal";
import { Colors } from "@/constants/theme";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useWorkoutOperations } from "@/hooks/useWorkoutOperations";
import { getUniqueExercises } from "@/lib/analytics/workoutStats";
import * as Crypto from "expo-crypto";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LogWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const { loading, workouts } = useWorkout();
  const { saveWorkout } = useWorkoutOperations();

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  // Get unique exercises from history
  const uniqueExercises = useMemo(
    () => getUniqueExercises(workouts),
    [workouts],
  );

  const addExercise = () => {
    setShowExercisePicker(true);
  };

  const handleExerciseSelected = (exerciseName: string) => {
    const newExercise: ExerciseData = {
      id: Crypto.randomUUID(),
      name: exerciseName,
      notes: "",
      sets: [],
    };
    setExercises([...exercises, newExercise]);
    setShowExercisePicker(false);
  };

  const deleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter((e) => e.id !== exerciseId));
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(
      exercises.map((e) => (e.id === exerciseId ? { ...e, name } : e)),
    );
  };

  const updateExerciseNotes = (exerciseId: string, notes: string) => {
    setExercises(
      exercises.map((e) => (e.id === exerciseId ? { ...e, notes } : e)),
    );
  };

  const addSetToExercise = (exerciseId: string) => {
    setExercises(
      exercises.map((e) => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: [
              ...e.sets,
              { id: Crypto.randomUUID(), reps: "", weight: "" },
            ],
          };
        }
        return e;
      }),
    );
  };

  const updateSetReps = (exerciseId: string, setId: string, reps: string) => {
    setExercises(
      exercises.map((e) => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: e.sets.map((s) => (s.id === setId ? { ...s, reps } : s)),
          };
        }
        return e;
      }),
    );
  };

  const updateSetWeight = (
    exerciseId: string,
    setId: string,
    weight: string,
  ) => {
    setExercises(
      exercises.map((e) => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: e.sets.map((s) => (s.id === setId ? { ...s, weight } : s)),
          };
        }
        return e;
      }),
    );
  };

  const deleteSetFromExercise = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((e) => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: e.sets.filter((s) => s.id !== setId),
          };
        }
        return e;
      }),
    );
  };

  const validateForm = (): string | null => {
    if (!date) {
      return "Please select a date";
    }

    if (exercises.length === 0) {
      return "Please add at least one exercise";
    }

    for (const exercise of exercises) {
      if (!exercise.name.trim()) {
        return "All exercises must have a name";
      }

      if (exercise.sets.length === 0) {
        return `${exercise.name} must have at least one set`;
      }

      for (const set of exercise.sets) {
        const reps = parseInt(set.reps, 10);
        const weight = parseFloat(set.weight);

        if (!set.reps || isNaN(reps) || reps <= 0) {
          return `${exercise.name}: All sets must have valid reps (> 0)`;
        }

        if (!set.weight || isNaN(weight) || weight <= 0) {
          return `${exercise.name}: All sets must have valid weight (> 0)`;
        }
      }
    }

    return null;
  };

  const handleSaveWorkout = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    try {
      const exercisesData = exercises.map((e) => ({
        name: e.name,
        notes: e.notes,
        sets: e.sets.map((s) => ({
          reps: parseInt(s.reps, 10),
          weight: parseFloat(s.weight),
        })),
      }));

      await saveWorkout(date, notes, exercisesData);

      // Clear form
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setExercises([]);

      Alert.alert("Success", "Workout logged successfully!");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to save workout",
      );
    }
  };

  const handleCancel = () => {
    if (exercises.length > 0 || notes.trim()) {
      Alert.alert(
        "Discard Workout?",
        "Are you sure? Any unsaved data will be lost.",
        [
          { text: "Cancel", onPress: () => {} },
          {
            text: "Discard",
            onPress: () => {
              setDate(new Date().toISOString().split("T")[0]);
              setNotes("");
              setExercises([]);
            },
            style: "destructive",
          },
        ],
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={[styles.scrollView, { paddingTop: insets.top }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Log Workout</ThemedText>
          <Text style={[styles.subtitle, { color: isDark ? "#999" : "#666" }]}>
            Track your exercises, sets, reps, and weight
          </Text>
        </View>

        {/* Date input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Date</Text>
          <TextInput
            style={[
              styles.dateInput,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
              },
            ]}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={isDark ? "#666" : "#999"}
          />
        </View>

        {/* Notes input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Workout Notes (optional)
          </Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
              },
            ]}
            placeholder="How did you feel? Any notes?"
            placeholderTextColor={isDark ? "#666" : "#999"}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Exercises */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Exercises</Text>

          {exercises.length === 0 ? (
            <Text
              style={[styles.emptyText, { color: isDark ? "#666" : "#999" }]}
            >
              No exercises added yet
            </Text>
          ) : (
            exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exerciseNumber={index + 1}
                exercise={exercise}
                onExerciseNameChange={(name) =>
                  updateExerciseName(exercise.id, name)
                }
                onExerciseNotesChange={(notes) =>
                  updateExerciseNotes(exercise.id, notes)
                }
                onAddSet={() => addSetToExercise(exercise.id)}
                onSetRepsChange={(setId, reps) =>
                  updateSetReps(exercise.id, setId, reps)
                }
                onSetWeightChange={(setId, weight) =>
                  updateSetWeight(exercise.id, setId, weight)
                }
                onDeleteSet={(setId) =>
                  deleteSetFromExercise(exercise.id, setId)
                }
                onDeleteExercise={() => deleteExercise(exercise.id)}
              />
            ))
          )}

          <AddButton
            label="Exercise"
            onPress={addExercise}
            style={styles.addExerciseButton}
          />
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.saveButton, { opacity: loading ? 0.6 : 1 }]}
            onPress={handleSaveWorkout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Workout</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={[styles.cancelButtonText, { color: colors.tint }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Exercise Picker Modal */}
      <ExercisePickerModal
        visible={showExercisePicker}
        exercises={uniqueExercises}
        onSelect={handleExerciseSelected}
        onClose={() => setShowExercisePicker(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "500",
    textAlignVertical: "top",
  },
  emptyText: {
    fontSize: 13,
    fontStyle: "italic",
    marginVertical: 12,
  },
  addExerciseButton: {
    marginTop: 12,
  },
  actionButtonsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
