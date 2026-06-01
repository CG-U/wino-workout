/**
 * Session Tab Screen
 * Shows the active workout session or empty state
 */

import { ExerciseDetail } from "@/components/Session/ExerciseDetail";
import { ExerciseNavigator } from "@/components/Session/ExerciseNavigator";
import { PrimaryButton } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StandardView } from "@/components/ui/standard-view";
import { Colors } from "@/constants/theme";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useWorkoutOperations } from "@/hooks/useWorkoutOperations";
import { SessionSet } from "@/lib/database/schema";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const { activeSession, dispatch } = useWorkout();
  const { saveWorkout } = useWorkoutOperations();

  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(
    null,
  );
  const [isNavigatorCollapsed, setIsNavigatorCollapsed] = useState(false);

  useEffect(() => {
    // Set initial exercise when session starts
    if (
      activeSession &&
      activeSession.exercises.length > 0 &&
      !currentExerciseId
    ) {
      setCurrentExerciseId(activeSession.exercises[0].templateExerciseId);
    }
  }, [activeSession, currentExerciseId]);

  const handleSelectExercise = (exerciseId: string) => {
    setCurrentExerciseId(exerciseId);
  };

  const toggleNavigator = () => {
    setIsNavigatorCollapsed((prev) => !prev);
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight",
    value: string,
  ) => {
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.templateExerciseId === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, [field]: value } : s,
          ),
        };
      }
      return ex;
    });

    dispatch({
      type: "UPDATE_SESSION",
      payload: { ...activeSession, exercises: updatedExercises },
    });
  };

  const handleAddSet = (exerciseId: string) => {
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.templateExerciseId === exerciseId) {
        // Get the last set to copy values from
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: SessionSet = {
          id: Crypto.randomUUID(),
          reps: lastSet?.reps || "",
          weight: lastSet?.weight || "",
        };
        return {
          ...ex,
          sets: [...ex.sets, newSet],
        };
      }
      return ex;
    });

    dispatch({
      type: "UPDATE_SESSION",
      payload: { ...activeSession, exercises: updatedExercises },
    });
  };

  const handleDeleteSet = (exerciseId: string, setId: string) => {
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.templateExerciseId === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter((s) => s.id !== setId),
        };
      }
      return ex;
    });

    dispatch({
      type: "UPDATE_SESSION",
      payload: { ...activeSession, exercises: updatedExercises },
    });
  };

  const handleFinishWorkout = () => {
    if (!activeSession) return;

    // Validate at least one exercise has been logged
    const loggedExercises = activeSession.exercises.filter((ex) =>
      ex.sets.some(
        (s) =>
          s.reps &&
          s.weight &&
          parseFloat(s.weight) > 0 &&
          parseInt(s.reps) > 0,
      ),
    );

    if (loggedExercises.length === 0) {
      Alert.alert(
        "No Exercises Logged",
        "Please log at least one exercise before finishing.",
      );
      return;
    }

    Alert.alert(
      "Finish Workout",
      `Log ${loggedExercises.length} exercise${loggedExercises.length !== 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Finish",
          style: "default",
          onPress: async () => {
            try {
              const date = new Date().toISOString().split("T")[0];
              const exercisesData = loggedExercises.map((ex) => ({
                name: ex.name,
                notes: ex.notes,
                sets: ex.sets
                  .filter((s) => s.reps && s.weight)
                  .map((s) => ({
                    reps: parseInt(s.reps, 10),
                    weight: parseFloat(s.weight),
                  })),
              }));

              await saveWorkout(
                date,
                "",
                exercisesData,
                activeSession.templateId,
              );

              // End session
              dispatch({ type: "END_SESSION" });

              Alert.alert("Success", "Workout logged successfully!", [
                {
                  text: "OK",
                  onPress: () => router.push("/(tabs)"),
                },
              ]);
            } catch (error) {
              console.error("Error saving workout:", error);
              Alert.alert("Error", "Failed to save workout");
            }
          },
        },
      ],
    );
  };

  const handleCancelWorkout = () => {
    Alert.alert("Cancel Workout", "Are you sure? All progress will be lost.", [
      { text: "Keep Going", style: "cancel" },
      {
        text: "Cancel Workout",
        style: "destructive",
        onPress: () => {
          dispatch({ type: "END_SESSION" });
          router.push("/(tabs)");
        },
      },
    ]);
  };

  // Empty state when no active session
  if (!activeSession) {
    return (
      <StandardView style={styles.container}>
        <View
          style={[styles.emptyStateContainer, { paddingTop: insets.top + 20 }]}
        >
          <IconSymbol
            size={80}
            name="figure.strengthtraining.traditional"
            color={colors.textTertiary}
          />
          <Text
            style={[styles.emptyTitle, { color: colors.textSecondary }]}
          >
            No Active Session
          </Text>
          <Text
            style={[styles.emptySubtitle, { color: colors.textTertiary }]}
          >
            Start a workout from the Home tab to begin tracking
          </Text>
          <PrimaryButton
            title="Go to Home"
            icon="house.fill"
            onPress={() => router.push("/(tabs)")}
            style={styles.startButton}
          />
        </View>
      </StandardView>
    );
  }

  // Active session UI
  const currentExercise = activeSession.exercises.find(
    (ex) => ex.templateExerciseId === currentExerciseId,
  );

  const completedExercises = activeSession.exercises.filter((ex) =>
    ex.sets.some(
      (s) =>
        s.reps && s.weight && parseFloat(s.weight) > 0 && parseInt(s.reps) > 0,
    ),
  ).length;

  const duration = Math.floor(
    (Date.now() - activeSession.startedAt) / 1000 / 60,
  ); // minutes

  return (
    <StandardView style={styles.container} padded={false}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: colors.surface1,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={toggleNavigator}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.hamburgerButton}
              accessibilityLabel="Toggle exercise list"
              accessibilityHint="Shows or hides the exercise navigation panel"
              accessibilityRole="button"
            >
              <IconSymbol
                size={24}
                name="line.3.horizontal"
                color={colors.tint}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancelWorkout}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.cancelText, { color: colors.destructive }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={[styles.templateName, { color: colors.textPrimary }]}>
              {activeSession.templateName}
            </Text>
            {/* 
            
            Storing this feature for now

            <Text
              style={[styles.progress, { color: isDark ? "#999" : "#666" }]}
            >
              {completedExercises} of {activeSession.exercises.length} exercises
              • {duration} min
            </Text> */}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleFinishWorkout}
              style={[styles.finishButton, { backgroundColor: colors.success }]}
            >
              <Text style={styles.finishButtonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Exercise Navigator - Left Side */}
        <View
          style={[
            styles.navigator,
            isNavigatorCollapsed && styles.navigatorCollapsed,
            { borderRightColor: colors.border },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <ExerciseNavigator
              exercises={activeSession.exercises}
              currentExerciseId={currentExerciseId}
              onSelectExercise={handleSelectExercise}
              isCollapsed={isNavigatorCollapsed}
            />
          </ScrollView>
        </View>

        {/* Exercise Detail - Right Side */}
        <View style={styles.detail}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {currentExercise ? (
              <ExerciseDetail
                exercise={currentExercise}
                onUpdateSet={(setId, field, value) =>
                  handleUpdateSet(
                    currentExercise.templateExerciseId,
                    setId,
                    field,
                    value,
                  )
                }
                onAddSet={() =>
                  handleAddSet(currentExercise.templateExerciseId)
                }
                onDeleteSet={(setId) =>
                  handleDeleteSet(currentExercise.templateExerciseId, setId)
                }
              />
            ) : (
              <View style={styles.exerciseEmptyState}>
                <IconSymbol
                  size={64}
                  name="dumbbell"
                  color={colors.textTertiary}
                />
                <Text
                  style={[
                    styles.exerciseEmptyText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Select an exercise to begin
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </StandardView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  startButton: {
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  // Active session styles
  header: {
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerLeft: {
    minWidth: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hamburgerButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    minWidth: 70,
    alignItems: "flex-end",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  templateName: {
    fontSize: 18,
    fontWeight: "700",
  },
  progress: {
    fontSize: 12,
    marginTop: 2,
  },
  finishButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  navigator: {
    width: "35%",
    borderRightWidth: 1,
    paddingVertical: 12,
  },
  navigatorCollapsed: {
    width: "10%",
  },
  detail: {
    flex: 1,
  },
  exerciseEmptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  exerciseEmptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
