/**
 * Session Tab Screen (Redesigned)
 * Full-screen swipeable workout session with live timer, pill bar navigation,
 * set completion tracking, rest timer, and haptic feedback.
 */

import { ExerciseDetail } from "@/components/Session/ExerciseDetailV2";
import { ExercisePillBar } from "@/components/Session/ExercisePillBar";
import {
  RestTimerSheet,
  RestTimerSheetRef,
} from "@/components/Session/RestTimerSheet";
import { PrimaryButton } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StandardView } from "@/components/ui/standard-view";
import { Colors } from "@/constants/theme";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useWorkoutOperations } from "@/hooks/useWorkoutOperations";
import { SessionSet } from "@/lib/database/schema";
import * as Crypto from "expo-crypto";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  ViewToken,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ---------- Live Timer Hook ----------

function useLiveTimer(startedAt: number | undefined) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const update = () =>
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ---------- Progress Segments ----------

function ProgressSegments({
  exercises,
  completedSets,
  colors,
}: {
  exercises: { templateExerciseId: string; sets: SessionSet[] }[];
  completedSets: Set<string>;
  colors: (typeof Colors)["dark"];
}) {
  return (
    <View style={progressStyles.container}>
      {exercises.map((ex) => {
        const total = ex.sets.length;
        const completed = ex.sets.filter((s) => completedSets.has(s.id)).length;
        const hasAnyInput = ex.sets.some(
          (s) =>
            (s.reps && parseInt(s.reps) > 0) ||
            (s.weight && parseFloat(s.weight) > 0),
        );

        let segmentColor = colors.surface3;
        if (completed === total && total > 0) {
          segmentColor = colors.success;
        } else if (completed > 0 || hasAnyInput) {
          segmentColor = colors.accent;
        }

        return (
          <View
            key={ex.templateExerciseId}
            style={[progressStyles.segment, { backgroundColor: segmentColor }]}
          />
        );
      })}
    </View>
  );
}

// ---------- Main Screen ----------

export default function SessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const { activeSession, dispatch } = useWorkout();
  const { saveWorkout } = useWorkoutOperations();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList>(null);
  const restTimerRef = useRef<RestTimerSheetRef>(null);

  const elapsedTime = useLiveTimer(activeSession?.startedAt);

  // Sync FlatList when pill bar is tapped
  const scrollToIndex = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  }, []);

  // Track visible exercise on swipe
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // ---------- Set Operations ----------

  const handleUpdateSet = useCallback(
    (
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
    },
    [activeSession, dispatch],
  );

  const handleAddSet = useCallback(
    (exerciseId: string) => {
      if (!activeSession) return;
      const updatedExercises = activeSession.exercises.map((ex) => {
        if (ex.templateExerciseId === exerciseId) {
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet: SessionSet = {
            id: Crypto.randomUUID(),
            reps: lastSet?.reps || "",
            weight: lastSet?.weight || "",
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }
        return ex;
      });
      dispatch({
        type: "UPDATE_SESSION",
        payload: { ...activeSession, exercises: updatedExercises },
      });
    },
    [activeSession, dispatch],
  );

  const handleDeleteSet = useCallback(
    (exerciseId: string, setId: string) => {
      if (!activeSession) return;
      const updatedExercises = activeSession.exercises.map((ex) => {
        if (ex.templateExerciseId === exerciseId) {
          return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
        }
        return ex;
      });
      dispatch({
        type: "UPDATE_SESSION",
        payload: { ...activeSession, exercises: updatedExercises },
      });
      // Remove from completed if it was there
      setCompletedSets((prev) => {
        const next = new Set(prev);
        next.delete(setId);
        return next;
      });
    },
    [activeSession, dispatch],
  );

  const handleToggleSetComplete = useCallback((setId: string) => {
    setCompletedSets((prev) => {
      const next = new Set(prev);
      if (next.has(setId)) {
        next.delete(setId);
      } else {
        next.add(setId);
        // Open rest timer when completing a set
        restTimerRef.current?.open(90);
      }
      return next;
    });
  }, []);

  // ---------- Workout Actions ----------

  const handleFinishWorkout = useCallback(() => {
    if (!activeSession) return;

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
      `Log ${loggedExercises.length} exercise${loggedExercises.length !== 1 ? "s" : ""} (${elapsedTime})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Finish",
          style: "default",
          onPress: async () => {
            try {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
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

              dispatch({ type: "END_SESSION" });
              Alert.alert("Workout Complete!", "Great session. Keep it up.", [
                { text: "OK", onPress: () => router.push("/(tabs)") },
              ]);
            } catch (error) {
              console.error("Error saving workout:", error);
              Alert.alert("Error", "Failed to save workout");
            }
          },
        },
      ],
    );
  }, [activeSession, dispatch, elapsedTime, router, saveWorkout]);

  const handleCancelWorkout = useCallback(() => {
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
  }, [dispatch, router]);

  // ---------- Empty State ----------

  if (!activeSession) {
    return (
      <StandardView style={styles.container}>
        <View
          style={[styles.emptyStateContainer, { paddingTop: insets.top + 40 }]}
        >
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <IconSymbol
              size={80}
              name="figure.strengthtraining.traditional"
              color={colors.textTertiary}
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No Active Session
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text
              style={[styles.emptySubtitle, { color: colors.textTertiary }]}
            >
              Start a workout from the Home tab or pick a template to begin
              tracking your sets
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <PrimaryButton
              title="Go to Home"
              icon="house.fill"
              onPress={() => router.push("/(tabs)")}
              style={styles.startButton}
            />
          </Animated.View>
        </View>
      </StandardView>
    );
  }

  // ---------- Active Session ----------

  const totalSets = activeSession.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0,
  );
  const totalCompletedSets = activeSession.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => completedSets.has(s.id)).length,
    0,
  );

  const renderExercisePage = ({
    item: exercise,
  }: {
    item: (typeof activeSession.exercises)[number];
    index: number;
  }) => (
    <View style={{ width: SCREEN_WIDTH }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <ExerciseDetail
          exercise={exercise}
          completedSets={completedSets}
          onUpdateSet={(
            setId: string,
            field: "reps" | "weight",
            value: string,
          ) =>
            handleUpdateSet(exercise.templateExerciseId, setId, field, value)
          }
          onAddSet={() => handleAddSet(exercise.templateExerciseId)}
          onDeleteSet={(setId: string) =>
            handleDeleteSet(exercise.templateExerciseId, setId)
          }
          onToggleSetComplete={handleToggleSetComplete}
        />
      </ScrollView>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[
            styles.header,
            {
              paddingTop: insets.top + 8,
              backgroundColor: colors.surface1,
              borderBottomColor: colors.border,
            },
          ]}
        >
          {/* Top row: Cancel — Template Name — Finish */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={handleCancelWorkout}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.cancelButton}
            >
              <IconSymbol size={18} name="xmark" color={colors.destructive} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text
                style={[styles.templateName, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {activeSession.templateName}
              </Text>
              <View style={styles.timerRow}>
                <IconSymbol
                  size={12}
                  name="clock"
                  color={colors.textTertiary}
                />
                <Text
                  style={[styles.timerText, { color: colors.textSecondary }]}
                >
                  {elapsedTime}
                </Text>
                <Text style={[styles.dot, { color: colors.textTertiary }]}>
                  ·
                </Text>
                <Text
                  style={[styles.setsCount, { color: colors.textSecondary }]}
                >
                  {totalCompletedSets}/{totalSets} sets
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleFinishWorkout}
              style={[styles.finishButton, { backgroundColor: colors.success }]}
            >
              <IconSymbol size={14} name="checkmark" color="#FFFFFF" />
              <Text style={styles.finishButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Segments */}
          <ProgressSegments
            exercises={activeSession.exercises}
            completedSets={completedSets}
            colors={colors}
          />
        </Animated.View>

        {/* Exercise Pill Bar */}
        <ExercisePillBar
          exercises={activeSession.exercises}
          currentIndex={currentIndex}
          onSelectExercise={scrollToIndex}
        />

        {/* Paged Exercise View */}
        <KeyboardAvoidingView
          style={styles.flexOne}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={insets.top + 140}
        >
          <FlatList
            ref={flatListRef}
            data={activeSession.exercises}
            renderItem={renderExercisePage}
            keyExtractor={(item) => item.templateExerciseId}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            initialScrollIndex={0}
          />
        </KeyboardAvoidingView>

        {/* Rest Timer Bottom Sheet */}
        <RestTimerSheet ref={restTimerRef} />
      </View>
    </GestureHandlerRootView>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  // Empty state
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  startButton: {
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  // Header
  header: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  templateName: {
    fontSize: 17,
    fontWeight: "700",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  timerText: {
    fontSize: 13,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  dot: {
    fontSize: 13,
  },
  setsCount: {
    fontSize: 13,
    fontWeight: "500",
  },
  finishButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});

const progressStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 4,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});
