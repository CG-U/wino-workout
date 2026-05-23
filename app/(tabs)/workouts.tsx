/**
 * Workouts Browse Screen
 * View, edit, and delete existing workouts
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useWorkoutOperations } from "@/hooks/useWorkoutOperations";
import { WorkoutWithExercises } from "@/lib/database/schema";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const { workouts, loading } = useWorkout();
  const { loadAllWorkouts, deleteWorkoutData } = useWorkoutOperations();

  const [refreshing, setRefreshing] = useState(false);

  // Load workouts on mount
  useEffect(() => {
    loadAllWorkouts();
  }, [loadAllWorkouts]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAllWorkouts();
    } finally {
      setRefreshing(false);
    }
  };

  const handleUseAsTemplate = (workout: WorkoutWithExercises) => {
    Alert.prompt(
      "Create Template",
      "Enter a name for this template:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: async (templateName) => {
            if (!templateName || templateName.trim() === "") {
              Alert.alert("Error", "Template name cannot be empty");
              return;
            }

            try {
              // Import template creation functions
              const { createCompleteTemplate } = await import(
                "@/lib/database/templateQueries"
              );

              // Create template from workout exercises
              const templateExercises = workout.exercises.map((ex) => ({
                name: ex.name,
                notes: ex.notes || "",
              }));

              await createCompleteTemplate(
                templateName.trim(),
                "Custom",
                "",
                false,
                templateExercises,
              );

              Alert.alert(
                "Success",
                `Template "${templateName}" created successfully!`,
              );
            } catch (error) {
              console.error("Error creating template:", error);
              Alert.alert("Error", "Failed to create template");
            }
          },
        },
      ],
      "plain-text",
    );
  };

  const handleDeleteWorkout = (workout: WorkoutWithExercises) => {
    Alert.alert(
      "Delete Workout?",
      `Are you sure you want to delete the workout from ${workout.date}? This action cannot be undone.`,
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteWorkoutData(workout.id);
              Alert.alert("Success", "Workout deleted");
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to delete workout",
              );
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const renderWorkoutItem = ({
    item: workout,
  }: {
    item: WorkoutWithExercises;
  }) => {
    const date = new Date(workout.date);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return (
      <View
        style={[
          styles.workoutCard,
          {
            backgroundColor: isDark ? "#1a1a1a" : "#fff",
            borderColor: colors.border,
          },
        ]}
      >
        {/* Date and summary */}
        <View style={styles.cardContent}>
          <View style={styles.dateSection}>
            {workout.templateName && (
              <Text
                style={[
                  styles.templateName,
                  { color: colors.tint },
                ]}
              >
                {workout.templateName}
              </Text>
            )}
            <Text style={[styles.date, { color: colors.text }]}>
              {formattedDate}
            </Text>
            <Text
              style={[styles.dateSubtext, { color: isDark ? "#999" : "#666" }]}
            >
              {workout.exerciseCount} exercise
              {workout.exerciseCount !== 1 ? "s" : ""} •{" "}
              {workout.totalVolume.toFixed(1)} kg
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleUseAsTemplate(workout)}
            >
              <IconSymbol size={20} name="plus.circle.fill" color={colors.tint} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteWorkout(workout)}
            >
              <IconSymbol size={20} name="trash" color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Exercises summary */}
        {workout.exercises.length > 0 && (
          <View style={styles.exercisesSection}>
            {workout.exercises.slice(0, 3).map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseSummary}>
                <Text style={[styles.exerciseName, { color: colors.text }]}>
                  • {exercise.name}
                </Text>
                <Text
                  style={[
                    styles.exerciseStats,
                    { color: isDark ? "#999" : "#666" },
                  ]}
                >
                  {exercise.sets.length} set
                  {exercise.sets.length !== 1 ? "s" : ""} • {exercise.totalReps}{" "}
                  reps • {exercise.totalVolume.toFixed(1)} kg
                </Text>
              </View>
            ))}
            {workout.exercises.length > 3 && (
              <Text
                style={[
                  styles.moreExercises,
                  { color: isDark ? "#999" : "#666" },
                ]}
              >
                +{workout.exercises.length - 3} more
              </Text>
            )}
          </View>
        )}

        {/* Notes */}
        {workout.notes && (
          <View style={styles.notesSection}>
            <Text style={[styles.notes, { color: isDark ? "#999" : "#666" }]}>
              &ldquo;{workout.notes}&rdquo;
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol size={48} name="dumbbell" color={isDark ? "#666" : "#999"} />
      <Text style={[styles.emptyText, { color: isDark ? "#999" : "#666" }]}>
        No workouts yet
      </Text>
      <Text style={[styles.emptySubtext, { color: isDark ? "#666" : "#999" }]}>
        Start logging your workouts to track progress
      </Text>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <ThemedText type="title">Workouts</ThemedText>
        <Text style={[styles.subtitle, { color: isDark ? "#999" : "#666" }]}>
          {workouts.length} workout{workouts.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {loading && workouts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.tint}
            />
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  workoutCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  dateSection: {
    flex: 1,
  },
  templateName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateSubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  exercisesSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  exerciseSummary: {
    marginBottom: 6,
  },
  exerciseName: {
    fontSize: 13,
    fontWeight: "500",
  },
  exerciseStats: {
    fontSize: 12,
    marginTop: 2,
  },
  moreExercises: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },
  notesSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  notes: {
    fontSize: 12,
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
