/**
 * Active Session Screen
 * Active workout session with free navigation between exercises
 * Shows progress, allows logging sets, and can finish or cancel session
 */

import { ExerciseDetail } from "@/components/Session/ExerciseDetail";
import { ExerciseNavigator } from "@/components/Session/ExerciseNavigator";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useWorkoutOperations } from "@/hooks/useWorkoutOperations";
import { SessionExercise, SessionSet } from "@/lib/database/schema";
import { getLastExercisePerformance } from "@/lib/database/sessionQueries";
import { getWorkoutTemplateWithExercises } from "@/lib/database/templateQueries";
import * as Crypto from "expo-crypto";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function ActiveSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const templateId = params.templateId as string;

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const { saveWorkout } = useWorkoutOperations();

  const [templateName, setTemplateName] = useState("");
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(
    null,
  );
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const loadSession = async () => {
    try {
      const template = await getWorkoutTemplateWithExercises(templateId);
      if (!template) {
        Alert.alert("Error", "Template not found");
        router.back();
        return;
      }

      setTemplateName(template.name);

      // Initialize session exercises with previous performance
      const sessionExercises: SessionExercise[] = await Promise.all(
        template.exercises.map(async (te) => {
          const lastPerformance = await getLastExercisePerformance(te.name);
          return {
            templateExerciseId: te.id,
            name: te.name,
            notes: te.notes,
            order: te.order,
            sets: [], // Start with no sets, user will add them
            lastPerformance: lastPerformance || undefined,
          };
        }),
      );

      setExercises(sessionExercises);
      if (sessionExercises.length > 0) {
        setCurrentExerciseId(sessionExercises[0].templateExerciseId);
      }
    } catch (error) {
      console.error("Error loading session:", error);
      Alert.alert("Error", "Failed to load workout session");
      router.back();
    }
  };

  const handleSelectExercise = (exerciseId: string) => {
    setCurrentExerciseId(exerciseId);
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight",
    value: string,
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.templateExerciseId === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((s) =>
              s.id === setId ? { ...s, [field]: value } : s,
            ),
          };
        }
        return ex;
      }),
    );
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.templateExerciseId === exerciseId) {
          const newSet: SessionSet = {
            id: Crypto.randomUUID(),
            reps: "",
            weight: "",
          };
          return {
            ...ex,
            sets: [...ex.sets, newSet],
          };
        }
        return ex;
      }),
    );
  };

  const handleDeleteSet = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.templateExerciseId === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.filter((s) => s.id !== setId),
          };
        }
        return ex;
      }),
    );
  };

  const handleFinishWorkout = () => {
    // Validate at least one exercise has been logged
    const loggedExercises = exercises.filter((ex) =>
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

              await saveWorkout(date, "", exercisesData, templateId);

              Alert.alert("Success", "Workout logged successfully!", [
                {
                  text: "OK",
                  onPress: () => router.replace("/(tabs)/"),
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
        onPress: () => router.replace("/(tabs)/"),
      },
    ]);
  };

  const currentExercise = exercises.find(
    (ex) => ex.templateExerciseId === currentExerciseId,
  );

  const completedExercises = exercises.filter((ex) =>
    ex.sets.some(
      (s) =>
        s.reps && s.weight && parseFloat(s.weight) > 0 && parseInt(s.reps) > 0,
    ),
  ).length;

  const duration = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: isDark ? "#1a1a1a" : "#fff",
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={handleCancelWorkout}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.cancelText, { color: "#FF3B30" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={[styles.templateName, { color: colors.text }]}>
              {templateName}
            </Text>
            <Text
              style={[styles.progress, { color: isDark ? "#999" : "#666" }]}
            >
              {completedExercises} of {exercises.length} exercises • {duration}{" "}
              min
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleFinishWorkout}
              style={[styles.finishButton, { backgroundColor: "#34C759" }]}
            >
              <Text style={styles.finishButtonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Exercise Navigator - Left Side */}
        <View style={[styles.navigator, { borderRightColor: colors.border }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ExerciseNavigator
              exercises={exercises}
              currentExerciseId={currentExerciseId}
              onSelectExercise={handleSelectExercise}
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
              <View style={styles.emptyState}>
                <IconSymbol
                  size={64}
                  name="dumbbell"
                  color={isDark ? "#666" : "#999"}
                />
                <Text
                  style={[
                    styles.emptyText,
                    { color: isDark ? "#999" : "#666" },
                  ]}
                >
                  Select an exercise to begin
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  detail: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
