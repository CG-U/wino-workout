/**
 * Exercise Detail Component (Redesigned)
 * Full-width exercise view with SetCards, previous performance, and add set
 */

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SessionExercise } from "@/lib/database/schema";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SetCard } from "./SetCard";

interface ExerciseDetailProps {
  exercise: SessionExercise;
  completedSets: Set<string>;
  onUpdateSet: (setId: string, field: "reps" | "weight", value: string) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: string) => void;
  onToggleSetComplete: (setId: string) => void;
}

export function ExerciseDetail({
  exercise,
  completedSets,
  onUpdateSet,
  onAddSet,
  onDeleteSet,
  onToggleSetComplete,
}: ExerciseDetailProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const totalVolume = exercise.sets.reduce((sum, s) => {
    const reps = parseFloat(s.reps) || 0;
    const weight = parseFloat(s.weight) || 0;
    return sum + reps * weight;
  }, 0);

  const completedCount = exercise.sets.filter((s) =>
    completedSets.has(s.id),
  ).length;

  const handleAddSet = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onAddSet();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      {/* Exercise Header */}
      <View style={styles.header}>
        <Text style={[styles.exerciseName, { color: colors.textPrimary }]}>
          {exercise.name}
        </Text>
        <View style={styles.headerMeta}>
          <View
            style={[styles.progressPill, { backgroundColor: colors.surface2 }]}
          >
            <Text
              style={[styles.progressText, { color: colors.textSecondary }]}
            >
              {completedCount}/{exercise.sets.length} sets
            </Text>
          </View>
          {totalVolume > 0 && (
            <View
              style={[
                styles.volumePill,
                { backgroundColor: colors.accentSubtle },
              ]}
            >
              <Text style={[styles.volumePillText, { color: colors.accent }]}>
                {totalVolume >= 1000
                  ? `${(totalVolume / 1000).toFixed(1)}t`
                  : `${totalVolume.toFixed(0)}kg`}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Previous Performance */}
      {exercise.lastPerformance && (
        <View
          style={[
            styles.lastPerformance,
            {
              backgroundColor: colors.surface2,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.lastPerformanceHeader}>
            <IconSymbol
              size={14}
              name="chart.line.uptrend.xyaxis"
              color={colors.success}
            />
            <Text
              style={[styles.lastPerformanceLabel, { color: colors.success }]}
            >
              Previous best
            </Text>
            <Text
              style={[
                styles.lastPerformanceDate,
                { color: colors.textTertiary },
              ]}
            >
              {new Date(exercise.lastPerformance.date).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              )}
            </Text>
          </View>
          <View style={styles.lastPerformanceSets}>
            {exercise.lastPerformance.sets.map((s, i) => (
              <View
                key={i}
                style={[
                  styles.lastSetChip,
                  { backgroundColor: colors.surface3 },
                ]}
              >
                <Text
                  style={[
                    styles.lastSetText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {s.weight}kg × {s.reps}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Notes */}
      {exercise.notes ? (
        <View
          style={[styles.notesContainer, { backgroundColor: colors.surface2 }]}
        >
          <IconSymbol
            size={12}
            name="note.text"
            color={colors.textTertiary}
          />
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>
            {exercise.notes}
          </Text>
        </View>
      ) : null}

      {/* Column Headers */}
      <View style={styles.columnHeaders}>
        <View style={styles.colHeaderLeft}>
          <Text style={[styles.colHeaderText, { color: colors.textTertiary }]}>
            SET
          </Text>
        </View>
        <View style={styles.colHeaderCenter}>
          <Text style={[styles.colHeaderText, { color: colors.textTertiary }]}>
            WEIGHT
          </Text>
          <Text style={[styles.colHeaderText, { color: colors.textTertiary }]}>
            REPS
          </Text>
        </View>
        <View style={styles.colHeaderRight}>
          <Text style={[styles.colHeaderText, { color: colors.textTertiary }]}>
            VOL
          </Text>
        </View>
      </View>

      {/* Set Cards */}
      {exercise.sets.map((set, index) => (
        <SetCard
          key={set.id}
          set={set}
          index={index}
          isCompleted={completedSets.has(set.id)}
          onUpdateField={(field, value) => onUpdateSet(set.id, field, value)}
          onToggleComplete={() => onToggleSetComplete(set.id)}
          onDelete={() => onDeleteSet(set.id)}
        />
      ))}

      {/* Add Set Button */}
      <TouchableOpacity
        style={[
          styles.addSetButton,
          {
            borderColor: colors.accent,
            backgroundColor: colors.accentSubtle,
          },
        ]}
        onPress={handleAddSet}
        activeOpacity={0.7}
      >
        <IconSymbol size={18} name="plus.circle.fill" color={colors.accent} />
        <Text style={[styles.addSetText, { color: colors.accent }]}>
          Add Set
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  headerMeta: {
    flexDirection: "row",
    gap: 8,
  },
  progressPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },
  volumePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  volumePillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  // Last Performance
  lastPerformance: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  lastPerformanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  lastPerformanceLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  lastPerformanceDate: {
    fontSize: 11,
    marginLeft: "auto",
  },
  lastPerformanceSets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  lastSetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  lastSetText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Notes
  notesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 13,
    flex: 1,
  },
  // Column headers
  columnHeaders: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  colHeaderLeft: {
    width: 44,
  },
  colHeaderCenter: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  colHeaderRight: {
    width: 50,
    alignItems: "center",
  },
  colHeaderText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  // Add set
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  addSetText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
