/**
 * Exercise Detail Component
 * Set logging interface with previous performance display
 */

import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SessionExercise } from "@/lib/database/schema";

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

  return (
    <View style={styles.container}>
      {/* Exercise Name */}
      <Text style={[styles.exerciseName, { color: colors.text }]}>
        {exercise.name}
      </Text>

      {/* Previous Performance */}
      {exercise.lastPerformance && (
        <View
          style={[
            styles.lastPerformanceContainer,
            {
              backgroundColor: isDark ? "#1a3a1a" : "#e8f5e9",
              borderColor: "#34C759",
            },
          ]}
        >
          <IconSymbol size={16} name="chart.line.uptrend.xyaxis" color="#34C759" />
          <View style={styles.lastPerformanceText}>
            <Text style={[styles.lastPerformanceLabel, { color: "#34C759" }]}>
              Last time:
            </Text>
            <Text style={[styles.lastPerformanceValue, { color: colors.text }]}>
              {exercise.lastPerformance.sets.map((s) => `${s.reps}×${s.weight}`).join(", ")} kg
            </Text>
            <Text style={[styles.lastPerformanceDate, { color: isDark ? "#666" : "#999" }]}>
              • {new Date(exercise.lastPerformance.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}

      {/* Sets Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { color: colors.text }]}>SET</Text>
        <Text style={[styles.tableHeaderText, { color: colors.text }]}>REPS</Text>
        <Text style={[styles.tableHeaderText, { color: colors.text }]}>WEIGHT (KG)</Text>
        <View style={styles.tableHeaderSpacer} />
      </View>

      {/* Sets */}
      {exercise.sets.map((set, index) => (
        <View
          key={set.id}
          style={[
            styles.setRow,
            {
              backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.setNumber}>
            <Text style={[styles.setNumberText, { color: colors.text }]}>
              {index + 1}
            </Text>
          </View>

          <TextInput
            style={[
              styles.setInput,
              {
                borderColor: colors.border,
                backgroundColor: isDark ? "#2a2a2a" : "#fff",
                color: colors.text,
              },
            ]}
            value={set.reps}
            onChangeText={(value) => onUpdateSet(set.id, "reps", value)}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={isDark ? "#666" : "#999"}
          />

          <TextInput
            style={[
              styles.setInput,
              {
                borderColor: colors.border,
                backgroundColor: isDark ? "#2a2a2a" : "#fff",
                color: colors.text,
              },
            ]}
            value={set.weight}
            onChangeText={(value) => onUpdateSet(set.id, "weight", value)}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={isDark ? "#666" : "#999"}
          />

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDeleteSet(set.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol size={20} name="trash" color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ))}

      {/* Add Set Button */}
      <TouchableOpacity
        style={[
          styles.addSetButton,
          {
            borderColor: colors.tint,
            backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
          },
        ]}
        onPress={onAddSet}
      >
        <IconSymbol size={20} name="plus.circle.fill" color={colors.tint} />
        <Text style={[styles.addSetText, { color: colors.tint }]}>Add Set</Text>
      </TouchableOpacity>

      {/* Notes */}
      {exercise.notes && (
        <View style={styles.notesContainer}>
          <Text style={[styles.notesLabel, { color: isDark ? "#999" : "#666" }]}>
            Notes:
          </Text>
          <Text style={[styles.notesText, { color: colors.text }]}>
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
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  tableHeaderSpacer: {
    width: 36,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  setNumber: {
    width: 32,
    alignItems: "center",
  },
  setNumberText: {
    fontSize: 16,
    fontWeight: "600",
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 4,
    textAlign: "center",
  },
  deleteButton: {
    width: 36,
    alignItems: "center",
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
