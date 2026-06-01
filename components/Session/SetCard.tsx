/**
 * SetCard Component
 * Individual set card with large tactile inputs, completion toggle, and haptics
 */

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SessionSet } from "@/lib/database/schema";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import {
  LayoutAnimation,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

interface SetCardProps {
  set: SessionSet;
  index: number;
  isCompleted: boolean;
  onUpdateField: (field: "reps" | "weight", value: string) => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

export function SetCard({
  set,
  index,
  isCompleted,
  onUpdateField,
  onToggleComplete,
  onDelete,
}: SetCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const volume =
    set.reps && set.weight
      ? (parseFloat(set.reps) * parseFloat(set.weight)).toFixed(0)
      : null;

  const handleIncrement = useCallback(
    (field: "reps" | "weight") => {
      const current = parseFloat(set[field]) || 0;
      const increment = field === "reps" ? 1 : 2.5;
      const newValue = current + increment;
      onUpdateField(field, newValue.toString());
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [set, onUpdateField],
  );

  const handleDecrement = useCallback(
    (field: "reps" | "weight") => {
      const current = parseFloat(set[field]) || 0;
      const decrement = field === "reps" ? 1 : 2.5;
      const floor = field === "reps" ? 1 : 0;
      const newValue = Math.max(floor, current - decrement);
      onUpdateField(field, newValue.toString());
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [set, onUpdateField],
  );

  const handleComplete = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggleComplete();
    if (!isCompleted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const renderRightActions = () => (
    <TouchableOpacity
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        onDelete();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
      style={[styles.deleteSwipe, { backgroundColor: colors.destructive }]}
    >
      <IconSymbol size={20} name="trash" color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: isCompleted ? colors.successSubtle : colors.surface1,
            borderColor: isCompleted ? colors.success : colors.border,
          },
        ]}
      >
        {/* Set Number & Complete Toggle */}
        <View style={styles.leftSection}>
          <TouchableOpacity
            onPress={handleComplete}
            style={[
              styles.completeButton,
              {
                backgroundColor: isCompleted
                  ? colors.success
                  : colors.surface3,
                borderColor: isCompleted ? colors.success : colors.border,
              },
            ]}
          >
            {isCompleted ? (
              <IconSymbol size={16} name="checkmark" color="#FFFFFF" />
            ) : (
              <Text
                style={[styles.setNumber, { color: colors.textSecondary }]}
              >
                {index + 1}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <View style={styles.inputsSection}>
          {/* Weight Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textTertiary }]}>
              KG
            </Text>
            <View style={styles.inputRow}>
              <TouchableOpacity
                onPress={() => handleDecrement("weight")}
                style={[
                  styles.stepper,
                  { backgroundColor: colors.surface2, borderColor: colors.border },
                ]}
                disabled={isCompleted}
              >
                <IconSymbol
                  size={14}
                  name="minus"
                  color={isCompleted ? colors.textTertiary : colors.accent}
                />
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isCompleted
                      ? "transparent"
                      : colors.surface2,
                    borderColor: isCompleted
                      ? colors.success
                      : colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                value={set.weight}
                onChangeText={(v) => onUpdateField("weight", v)}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                editable={!isCompleted}
              />
              <TouchableOpacity
                onPress={() => handleIncrement("weight")}
                style={[
                  styles.stepper,
                  { backgroundColor: colors.surface2, borderColor: colors.border },
                ]}
                disabled={isCompleted}
              >
                <IconSymbol
                  size={14}
                  name="plus"
                  color={isCompleted ? colors.textTertiary : colors.accent}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Reps Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textTertiary }]}>
              REPS
            </Text>
            <View style={styles.inputRow}>
              <TouchableOpacity
                onPress={() => handleDecrement("reps")}
                style={[
                  styles.stepper,
                  { backgroundColor: colors.surface2, borderColor: colors.border },
                ]}
                disabled={isCompleted}
              >
                <IconSymbol
                  size={14}
                  name="minus"
                  color={isCompleted ? colors.textTertiary : colors.accent}
                />
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isCompleted
                      ? "transparent"
                      : colors.surface2,
                    borderColor: isCompleted
                      ? colors.success
                      : colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                value={set.reps}
                onChangeText={(v) => onUpdateField("reps", v)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                editable={!isCompleted}
              />
              <TouchableOpacity
                onPress={() => handleIncrement("reps")}
                style={[
                  styles.stepper,
                  { backgroundColor: colors.surface2, borderColor: colors.border },
                ]}
                disabled={isCompleted}
              >
                <IconSymbol
                  size={14}
                  name="plus"
                  color={isCompleted ? colors.textTertiary : colors.accent}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Volume */}
        <View style={styles.volumeSection}>
          {volume ? (
            <>
              <Text
                style={[styles.volumeValue, { color: colors.textPrimary }]}
              >
                {volume}
              </Text>
              <Text
                style={[styles.volumeUnit, { color: colors.textTertiary }]}
              >
                kg
              </Text>
            </>
          ) : (
            <Text style={[styles.volumeDash, { color: colors.textTertiary }]}>
              —
            </Text>
          )}
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  leftSection: {
    marginRight: 12,
  },
  completeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  setNumber: {
    fontSize: 13,
    fontWeight: "700",
  },
  inputsSection: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stepper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  volumeSection: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    marginLeft: 8,
  },
  volumeValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  volumeUnit: {
    fontSize: 10,
    fontWeight: "500",
  },
  volumeDash: {
    fontSize: 18,
  },
  deleteSwipe: {
    width: 60,
    borderRadius: 14,
    marginBottom: 8,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
