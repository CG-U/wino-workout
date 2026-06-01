/**
 * Exercise Navigator Component
 * Free navigation list showing all exercises in the active session
 * Visual states: not started (gray), in progress (blue), complete (green)
 */

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SessionExercise } from "@/lib/database/schema";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ExerciseNavigatorProps {
  exercises: SessionExercise[];
  currentExerciseId: string | null;
  onSelectExercise: (exerciseId: string) => void;
  isCollapsed?: boolean;
}

export function ExerciseNavigator({
  exercises,
  currentExerciseId,
  onSelectExercise,
  isCollapsed = false,
}: ExerciseNavigatorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const getExerciseStatus = (exercise: SessionExercise) => {
    const validSets = exercise.sets.filter(
      (s) =>
        s.reps && s.weight && parseFloat(s.weight) > 0 && parseInt(s.reps) > 0,
    );

    if (validSets.length === 0) return "not-started";
    if (validSets.length < exercise.sets.length) return "in-progress";
    return "complete";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not-started":
        return colors.textTertiary;
      case "in-progress":
        return colors.accent;
      case "complete":
        return colors.success;
      default:
        return colors.textPrimary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return "checkmark.circle.fill";
      case "in-progress":
        return "circle.lefthalf.fill";
      default:
        return "circle";
    }
  };

  return (
    <View style={styles.container}>
      {exercises.map((exercise, index) => {
        const status = getExerciseStatus(exercise);
        const statusColor = getStatusColor(status);
        const isActive = currentExerciseId === exercise.templateExerciseId;

        if (isCollapsed) {
          // Collapsed mode: vertical layout with number + icon only
          return (
            <TouchableOpacity
              key={exercise.templateExerciseId}
              style={[
                styles.exerciseItemCollapsed,
                {
                  backgroundColor: isActive
                    ? colors.surface2
                    : "transparent",
                },
              ]}
              onPress={() => onSelectExercise(exercise.templateExerciseId)}
              activeOpacity={0.7}
              accessibilityLabel={`Exercise ${index + 1}: ${exercise.name}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[styles.exerciseNumberCollapsed, { color: statusColor }]}
              >
                {index + 1}
              </Text>
              <IconSymbol
                size={16}
                name={getStatusIcon(status)}
                color={statusColor}
              />
            </TouchableOpacity>
          );
        }

        // Expanded mode: full layout with name
        return (
          <TouchableOpacity
            key={exercise.templateExerciseId}
            style={[
              styles.exerciseItem,
              {
                backgroundColor: isActive
                  ? colors.surface2
                  : "transparent",
                borderLeftColor: statusColor,
              },
            ]}
            onPress={() => onSelectExercise(exercise.templateExerciseId)}
            activeOpacity={0.7}
            accessibilityLabel={`${exercise.name}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityHint={`Exercise ${index + 1} of ${exercises.length}, ${status}`}
          >
            <View style={styles.exerciseContent}>
              <View style={styles.exerciseInfo}>
                <Text style={[styles.exerciseNumber, { color: statusColor }]}>
                  {index + 1}
                </Text>
                <Text
                  style={[
                    styles.exerciseName,
                    { color: colors.textPrimary },
                    status === "not-started" && {
                      color: colors.textTertiary,
                    },
                  ]}
                >
                  {exercise.name}
                </Text>
              </View>
              <IconSymbol
                size={20}
                name={getStatusIcon(status)}
                color={statusColor}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  exerciseItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  exerciseItemCollapsed: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  exerciseContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exerciseInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: "700",
    marginRight: 12,
    width: 24,
  },
  exerciseNumberCollapsed: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
});
