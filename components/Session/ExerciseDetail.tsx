/**
 * Exercise Detail Component
 * Set logging interface with previous performance display
 */

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SessionExercise } from "@/lib/database/schema";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ExerciseDetailProps {
  exercise: SessionExercise;
  onUpdateSet: (setId: string, field: "reps" | "weight", value: string) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: string) => void;
}

export function ExerciseDetail({
  exercise,
  onUpdateSet,
  onAddSet,
  onDeleteSet,
}: ExerciseDetailProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const handleIncrement = (
    setId: string,
    field: "reps" | "weight",
    currentValue: string,
  ) => {
    const current = parseFloat(currentValue) || 0;
    const increment = field === "reps" ? 1 : 2.5;
    const newValue = Math.max(field === "reps" ? 1 : 0, current + increment);
    onUpdateSet(setId, field, newValue.toString());
  };

  const handleDecrement = (
    setId: string,
    field: "reps" | "weight",
    currentValue: string,
  ) => {
    const current = parseFloat(currentValue) || 0;
    const decrement = field === "reps" ? 1 : 2.5;
    const floor = field === "reps" ? 1 : 0;
    const newValue = Math.max(floor, current - decrement);
    onUpdateSet(setId, field, newValue.toString());
  };

  return (
    <View style={styles.container}>
      {/* Exercise Name */}
      <Text style={[styles.exerciseName, { color: colors.textPrimary }]}>
        {exercise.name}
      </Text>

      {/* Previous Performance */}
      {exercise.lastPerformance && (
        <View
          style={[
            styles.lastPerformanceContainer,
            {
              backgroundColor: colors.successSubtle,
              borderColor: colors.success,
            },
          ]}
        >
          <IconSymbol
            size={16}
            name="chart.line.uptrend.xyaxis"
            color={colors.success}
          />
          <View style={styles.lastPerformanceText}>
            <Text
              style={[styles.lastPerformanceLabel, { color: colors.success }]}
            >
              Last time:
            </Text>
            <Text
              style={[
                styles.lastPerformanceValue,
                { color: colors.textPrimary },
              ]}
            >
              {exercise.lastPerformance.sets
                .map((s) => `${s.reps}×${s.weight}`)
                .join(", ")}{" "}
              kg
            </Text>
            <Text
              style={[
                styles.lastPerformanceDate,
                { color: colors.textTertiary },
              ]}
            >
              • {new Date(exercise.lastPerformance.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}

      {/* Sets Table Header */}
      <View style={styles.tableHeader}>
        <View style={styles.tableHeaderSetColumn}>
          <Text
            style={[styles.tableHeaderText, { color: colors.textSecondary }]}
          >
            SET
          </Text>
        </View>
        <View style={styles.tableHeaderInputColumn}>
          <Text
            style={[styles.tableHeaderText, { color: colors.textSecondary }]}
          >
            REPS
          </Text>
        </View>
        <View style={styles.tableHeaderInputColumn}>
          <Text
            style={[styles.tableHeaderText, { color: colors.textSecondary }]}
          >
            WEIGHT (KG)
          </Text>
        </View>
        <View style={styles.tableHeaderActionsColumn}>
          <Text
            style={[styles.tableHeaderText, { color: colors.textSecondary }]}
          >
            VOLUME
          </Text>
        </View>
      </View>

      {/* Sets */}
      {exercise.sets.map((set, index) => (
        <View
          key={set.id}
          style={[
            styles.setRowContainer,
            {
              backgroundColor: colors.surface1,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.setRow}>
            {/* Set Number - Centered */}
            <View style={styles.setNumberColumn}>
              <Text
                style={[styles.setNumberText, { color: colors.textPrimary }]}
              >
                {index + 1}
              </Text>
            </View>

            {/* Reps Column */}
            <View style={styles.inputColumn}>
              <TextInput
                style={[
                  styles.setInput,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface2,
                    color: colors.textPrimary,
                  },
                ]}
                value={set.reps}
                onChangeText={(value) => onUpdateSet(set.id, "reps", value)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
              />
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={[
                    styles.stepperSquareButton,
                    {
                      backgroundColor: colors.surface2,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleDecrement(set.id, "reps", set.reps)}
                  accessibilityLabel="Decrease reps"
                  accessibilityRole="button"
                >
                  <IconSymbol size={18} name="minus" color={colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.stepperSquareButton,
                    {
                      backgroundColor: colors.surface2,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleIncrement(set.id, "reps", set.reps)}
                  accessibilityLabel="Increase reps"
                  accessibilityRole="button"
                >
                  <IconSymbol size={18} name="plus" color={colors.accent} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Weight Column */}
            <View style={styles.inputColumn}>
              <TextInput
                style={[
                  styles.setInput,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface2,
                    color: colors.textPrimary,
                  },
                ]}
                value={set.weight}
                onChangeText={(value) => onUpdateSet(set.id, "weight", value)}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
              />
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={[
                    styles.stepperSquareButton,
                    {
                      backgroundColor: colors.surface2,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleDecrement(set.id, "weight", set.weight)}
                  accessibilityLabel="Decrease weight"
                  accessibilityRole="button"
                >
                  <IconSymbol size={18} name="minus" color={colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.stepperSquareButton,
                    {
                      backgroundColor: colors.surface2,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleIncrement(set.id, "weight", set.weight)}
                  accessibilityLabel="Increase weight"
                  accessibilityRole="button"
                >
                  <IconSymbol size={18} name="plus" color={colors.accent} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons Column */}
            <View style={styles.actionsColumn}>
              {/* Volume Display */}
              <View style={styles.volumeDisplay}>
                <Text
                  style={[styles.volumeText, { color: colors.textPrimary }]}
                >
                  {set.reps && set.weight
                    ? `${(parseFloat(set.reps) * parseFloat(set.weight)).toFixed(1)}`
                    : "—"}
                </Text>
                <Text
                  style={[styles.volumeLabel, { color: colors.textTertiary }]}
                >
                  kg
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  {
                    backgroundColor: colors.destructiveSubtle,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => onDeleteSet(set.id)}
                accessibilityLabel="Delete set"
                accessibilityRole="button"
              >
                <IconSymbol size={18} name="trash" color={colors.destructive} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
        onPress={onAddSet}
      >
        <IconSymbol size={20} name="plus.circle.fill" color={colors.accent} />
        <Text style={[styles.addSetText, { color: colors.accent }]}>
          Add Set
        </Text>
      </TouchableOpacity>

      {/* Notes */}
      {exercise.notes && (
        <View style={styles.notesContainer}>
          <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
            Notes:
          </Text>
          <Text style={[styles.notesText, { color: colors.textPrimary }]}>
            {exercise.notes}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  lastPerformanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  lastPerformanceText: {
    flex: 1,
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  lastPerformanceLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginRight: 6,
  },
  lastPerformanceValue: {
    fontSize: 13,
    fontWeight: "600",
    marginRight: 6,
  },
  lastPerformanceDate: {
    fontSize: 12,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 8,
  },
  tableHeaderSetColumn: {
    width: 32,
    alignItems: "center",
  },
  tableHeaderInputColumn: {
    flex: 1,
    alignItems: "center",
  },
  tableHeaderActionsColumn: {
    width: 60,
    alignItems: "center",
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  setRowContainer: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    padding: 12,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  setNumberColumn: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  setNumberText: {
    fontSize: 18,
    fontWeight: "700",
  },
  inputColumn: {
    flex: 1,
    gap: 8,
  },
  setInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  stepperRow: {
    flexDirection: "row",
    gap: 8,
  },
  stepperSquareButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  actionsColumn: {
    width: 60,
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  volumeDisplay: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  volumeText: {
    fontSize: 16,
    fontWeight: "700",
  },
  volumeLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    marginTop: 8,
  },
  addSetText: {
    fontSize: 15,
    fontWeight: "600",
  },
  notesContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 193, 7, 0.1)",
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
