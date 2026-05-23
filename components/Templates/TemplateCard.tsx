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
  onDelete?: () => void;
}

export function TemplateCard({
  template,
  onPress,
  onDelete,
}: TemplateCardProps) {
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
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text }]}>
                {template.name}
              </Text>
              {template.isDefault && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.tint + "20" },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: colors.tint }]}>
                    DEFAULT
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.category, { color: getCategoryColor() }]}>
                {template.category}
              </Text>
              <Text
                style={[styles.separator, { color: isDark ? "#666" : "#999" }]}
              >
                •
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
        </View>

        {/* Right side: Actions */}
        <View style={styles.rightContent}>
          {!template.isDefault && onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol size={20} name="trash" color="#FF3B30" />
            </TouchableOpacity>
          )}
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  category: {
    fontSize: 13,
    fontWeight: "600",
  },
  separator: {
    marginHorizontal: 6,
    fontSize: 12,
  },
  exerciseCount: {
    fontSize: 13,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
});
