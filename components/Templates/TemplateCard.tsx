/**
 * Template Card Component
 * Displays a workout template in the list with name, category, and exercise count
 */

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { WorkoutTemplateWithExercises } from "@/lib/database/schema";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TemplateCardProps {
  template: WorkoutTemplateWithExercises;
  onPress: () => void;
}

export function TemplateCard({ template, onPress }: TemplateCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  // Get category icon
  const getCategoryIcon = () => {
    switch (template.category) {
      case "PPL":
        return "figure.strengthtraining.traditional";
      case "Bro Split":
        return "dumbbell";
      case "Full Body":
        return "figure.walk";
      default:
        return "list.bullet";
    }
  };

  // Get category color
  const getCategoryColor = () => {
    switch (template.category) {
      case "PPL":
        return "#007AFF";
      case "Bro Split":
        return "#FF9500";
      case "Full Body":
        return "#34C759";
      default:
        return colors.tint;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDark ? "#1a1a1a" : "#fff",
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Left side: Icon and info */}
        <View style={styles.leftContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getCategoryColor() + "20" },
            ]}
          >
            <IconSymbol
              size={24}
              name={getCategoryIcon()}
              color={getCategoryColor()}
            />
          </View>

          <View style={styles.textContent}>
            <Text style={[styles.title, { color: colors.text }]}>
              {template.name}
            </Text>
            <Text
              style={[
                styles.exerciseCount,
                { color: isDark ? "#999" : "#666" },
              ]}
            >
              {template.exercises.length} exercise
              {template.exercises.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Right side */}
        <View style={styles.rightContent}>
          <IconSymbol size={20} name="chevron.right" color={colors.icon} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  exerciseCount: {
    fontSize: 13,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
