/**
 * Standard Button Components
 * Reusable button components with consistent styling
 */

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { IconSymbol, IconSymbolName } from "./icon-symbol";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  icon?: IconSymbolName;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Primary Button - Used for main actions
 * Example: "Start Workout", "Save", "Finish"
 */
export function PrimaryButton({
  title,
  onPress,
  icon,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      style={[
        styles.primaryButton,
        {
          backgroundColor: isDark ? "#1a1a1a" : "#fff",
          borderColor: colors.border,
        },
        disabled && styles.primaryButtonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && (
        <IconSymbol
          size={32}
          name={icon}
          color={disabled ? "#999" : colors.tint}
        />
      )}
      <Text
        style={[
          styles.primaryButtonText,
          { color: colors.tint },
          disabled && styles.primaryButtonTextDisabled,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  icon?: IconSymbolName;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Secondary Button - Used for secondary actions
 * Example: "Cancel", "Skip", etc.
 */
export function SecondaryButton({
  title,
  onPress,
  icon,
  disabled = false,
  style,
}: SecondaryButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      style={[
        styles.secondaryButton,
        {
          backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
          borderColor: colors.border,
        },
        disabled && styles.secondaryButtonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && (
        <IconSymbol
          size={20}
          name={icon}
          color={disabled ? "#999" : colors.text}
        />
      )}
      <Text
        style={[
          styles.secondaryButtonText,
          { color: colors.text },
          disabled && styles.secondaryButtonTextDisabled,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

interface CardButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: IconSymbolName;
  iconColor?: string;
  showChevron?: boolean;
  style?: ViewStyle;
}

/**
 * Card Button - Used for list items and selectable cards
 * Example: Recently used templates, template picker items
 */
export function CardButton({
  title,
  subtitle,
  onPress,
  icon,
  iconColor,
  showChevron = true,
  style,
}: CardButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      style={[
        styles.cardButton,
        {
          backgroundColor: isDark ? "#1a1a1a" : "#fff",
          borderColor: colors.border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardButtonContent}>
        {icon && (
          <View
            style={[
              styles.cardIcon,
              { backgroundColor: (iconColor || colors.tint) + "20" },
            ]}
          >
            <IconSymbol
              size={24}
              name={icon}
              color={iconColor || colors.tint}
            />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.cardSubtitle, { color: isDark ? "#999" : "#666" }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showChevron && (
        <IconSymbol size={20} name="chevron.right" color={colors.icon} />
      )}
    </TouchableOpacity>
  );
}

interface IconButtonProps {
  icon: IconSymbolName;
  onPress: () => void;
  color?: string;
  size?: number;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Icon Button - Used for icon-only actions
 * Example: Delete, Edit, Close buttons
 */
export function IconButton({
  icon,
  onPress,
  color,
  size = 20,
  disabled = false,
  style,
}: IconButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      style={[styles.iconButton, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <IconSymbol
        size={size}
        name={icon}
        color={disabled ? "#999" : color || colors.text}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Primary Button
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonTextDisabled: {
    color: "#999",
  },

  // Secondary Button
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonDisabled: {
    opacity: 0.5,
  },
  secondaryButtonTextDisabled: {
    color: "#999",
  },

  // Card Button
  cardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
  },

  // Icon Button
  iconButton: {
    padding: 8,
  },
});
