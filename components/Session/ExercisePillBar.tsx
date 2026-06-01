/**
 * Exercise Pill Bar
 * Horizontal scrollable pill navigation for exercises with status indicators
 */

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SessionExercise } from "@/lib/database/schema";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface ExercisePillBarProps {
  exercises: SessionExercise[];
  currentIndex: number;
  onSelectExercise: (index: number) => void;
}

type ExerciseStatus = "not-started" | "in-progress" | "complete";

function getExerciseStatus(exercise: SessionExercise): ExerciseStatus {
  const validSets = exercise.sets.filter(
    (s) =>
      s.reps && s.weight && parseFloat(s.weight) > 0 && parseInt(s.reps) > 0,
  );
  if (validSets.length === 0) return "not-started";
  if (validSets.length < exercise.sets.length) return "in-progress";
  return "complete";
}

function ExercisePill({
  exercise,
  index,
  isActive,
  onPress,
  colors,
}: {
  exercise: SessionExercise;
  index: number;
  isActive: boolean;
  onPress: () => void;
  colors: (typeof Colors)["dark"];
}) {
  const status = getExerciseStatus(exercise);
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.05 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [isActive, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getStatusDotColor = () => {
    switch (status) {
      case "complete":
        return colors.success;
      case "in-progress":
        return colors.accent;
      default:
        return colors.textTertiary;
    }
  };

  const getBgColor = () => {
    if (isActive) return colors.accentSubtle;
    if (status === "complete") return colors.successSubtle;
    return colors.surface2;
  };

  const getBorderColor = () => {
    if (isActive) return colors.accent;
    if (status === "complete") return colors.success;
    return "transparent";
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.pill,
          {
            backgroundColor: getBgColor(),
            borderColor: getBorderColor(),
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={[styles.statusDot, { backgroundColor: getStatusDotColor() }]}
        />
        <Text
          style={[
            styles.pillText,
            {
              color: isActive ? colors.accent : colors.textPrimary,
              fontWeight: isActive ? "700" : "500",
            },
          ]}
          numberOfLines={1}
        >
          {exercise.name}
        </Text>
        <Text
          style={[
            styles.pillIndex,
            { color: isActive ? colors.accent : colors.textTertiary },
          ]}
        >
          {index + 1}/{exercise.sets.length}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ExercisePillBar({
  exercises,
  currentIndex,
  onSelectExercise,
}: ExercisePillBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];
  const scrollRef = useRef<ScrollView>(null);
  const pillWidths = useRef<number[]>([]);

  // Auto-scroll to active pill
  useEffect(() => {
    if (scrollRef.current && currentIndex >= 0) {
      // Approximate scroll position
      const offset = Math.max(0, currentIndex * 130 - 60);
      scrollRef.current.scrollTo({ x: offset, animated: true });
    }
  }, [currentIndex]);

  const handlePress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectExercise(index);
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {exercises.map((exercise, index) => (
          <ExercisePill
            key={exercise.templateExerciseId}
            exercise={exercise}
            index={index}
            isActive={index === currentIndex}
            onPress={() => handlePress(index)}
            colors={colors}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pillText: {
    fontSize: 13,
    maxWidth: 100,
  },
  pillIndex: {
    fontSize: 11,
    fontWeight: "600",
  },
});
