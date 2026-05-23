/**
 * Set Input Component
 * Form fields for entering reps and weight for a single set
 */

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SetInputProps {
  setNumber: number;
  reps: string;
  weight: string;
  onRepsChange: (reps: string) => void;
  onWeightChange: (weight: string) => void;
  onDelete: () => void;
}

export function SetInput({
  setNumber,
  reps,
  weight,
  onRepsChange,
  onWeightChange,
  onDelete,
}: SetInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.setNumber}>
        <Text style={[styles.setNumberText, { color: colors.text }]}>
          Set {setNumber}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Reps</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: isDark ? "#1a1a1a" : "#fff",
              },
            ]}
            placeholder="0"
            placeholderTextColor={isDark ? "#666" : "#999"}
            keyboardType="number-pad"
            value={reps}
            onChangeText={onRepsChange}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Weight (kg)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: isDark ? "#1a1a1a" : "#fff",
              },
            ]}
            placeholder="0"
            placeholderTextColor={isDark ? "#666" : "#999"}
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={onWeightChange}
          />
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol size={20} name="trash" color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  setNumber: {
    marginBottom: 12,
  },
  setNumberText: {
    fontSize: 13,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButton: {
    padding: 8,
    marginBottom: 2,
  },
});
