/**
 * Exercise Card Component
 * Displays a single exercise with its sets and controls to add/remove sets
 */

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AddButton } from "./AddButton";
import { SetInput } from "./SetInput";

export interface ExerciseData {
  id: string;
  name: string;
  notes: string;
  sets: SetData[];
}

export interface SetData {
  id: string;
  reps: string;
  weight: string;
}

interface ExerciseCardProps {
  exerciseNumber: number;
  exercise: ExerciseData;
  onExerciseNameChange: (name: string) => void;
  onExerciseNotesChange: (notes: string) => void;
  onAddSet: () => void;
  onSetRepsChange: (setId: string, reps: string) => void;
  onSetWeightChange: (setId: string, weight: string) => void;
  onDeleteSet: (setId: string) => void;
  onDeleteExercise: () => void;
}

export function ExerciseCard({
  exerciseNumber,
  exercise,
  onExerciseNameChange,
  onExerciseNotesChange,
  onAddSet,
  onSetRepsChange,
  onSetWeightChange,
  onDeleteSet,
  onDeleteExercise,
}: ExerciseCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#1a1a1a" : "#fff",
          borderColor: colors.border,
        },
      ]}
    >
      {/* Header with exercise number and delete button */}
      <View style={styles.header}>
        <Text style={[styles.exerciseNumber, { color: colors.text }]}>
          Exercise {exerciseNumber}
        </Text>
        <TouchableOpacity
          onPress={onDeleteExercise}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol size={20} name="trash" color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* Exercise name input */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Exercise Name
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
            },
          ]}
          placeholder="e.g., Bench Press"
          placeholderTextColor={isDark ? "#666" : "#999"}
          value={exercise.name}
          onChangeText={onExerciseNameChange}
        />
      </View>

      {/* Exercise notes input */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Notes (optional)
        </Text>
        <TextInput
          style={[
            styles.input,
            styles.notesInput,
            {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
            },
          ]}
          placeholder="Any notes about this exercise..."
          placeholderTextColor={isDark ? "#666" : "#999"}
          value={exercise.notes}
          onChangeText={onExerciseNotesChange}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Sets */}
      <View style={styles.setsContainer}>
        <Text style={[styles.setsLabel, { color: colors.text }]}>Sets</Text>
        {exercise.sets.length === 0 ? (
          <Text style={[styles.emptyText, { color: isDark ? "#666" : "#999" }]}>
            No sets added yet
          </Text>
        ) : (
          exercise.sets.map((set, index) => (
            <SetInput
              key={set.id}
              setNumber={index + 1}
              reps={set.reps}
              weight={set.weight}
              onRepsChange={(reps) => onSetRepsChange(set.id, reps)}
              onWeightChange={(weight) => onSetWeightChange(set.id, weight)}
              onDelete={() => onDeleteSet(set.id)}
            />
          ))
        )}
      </View>

      {/* Add set button */}
      <AddButton
        label="Set"
        onPress={onAddSet}
        size="small"
        style={styles.addSetButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  exerciseNumber: {
    fontSize: 16,
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  notesInput: {
    textAlignVertical: "top",
    paddingTop: 12,
  },
  setsContainer: {
    marginVertical: 12,
  },
  setsLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  emptyText: {
    fontSize: 13,
    fontStyle: "italic",
    marginVertical: 8,
  },
  addSetButton: {
    marginTop: 8,
  },
});
