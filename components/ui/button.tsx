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
  const colors = Colors[colorScheme ?? "dark"];

  return (
    <TouchableOpacity
      style={[
        styles.primaryButton,
        {
          backgroundColor: colors.accent,
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
          size={24}
          name={icon}
          color={disabled ? "rgba(255,255,255,0.5)" : "#fff"}
        />
      )}
      <Text
        style={[
          styles.primaryButtonText,
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
  const colors = Colors[colorScheme ?? "dark"];

  return (
    <TouchableOpacity
      style={[
        styles.secondaryButton,
        {
          backgroundColor: colors.surface2,
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
          color={disabled ? colors.textTertiary : colors.textPrimary}
        />
      )}
      <Text
        style={[
          styles.secondaryButtonText,
          { color: colors.textPrimary },
          disabled && { color: colors.textTertiary },
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
  const colors = Colors[colorScheme ?? "dark"];

  return (
    <TouchableOpacity
      style={[
        styles.cardButton,
        {
          backgroundColor: colors.surface1,
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
            style={[styles.cardIcon, { backgroundColor: colors.accentSubtle }]}
          >
            <IconSymbol
              size={24}
              name={icon}
              color={iconColor || colors.accent}
            />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.cardSubtitle, { color: colors.textSecondary }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showChevron && (
        <IconSymbol
          size={20}
          name="chevron.right"
          color={colors.textTertiary}
        />
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
  const colors = Colors[colorScheme ?? "dark"];

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
        color={disabled ? colors.textTertiary : color || colors.textSecondary}
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
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonTextDisabled: {
    opacity: 0.7,
  },

  // Secondary Button
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonDisabled: {
    opacity: 0.5,
  },

  // Card Button
  cardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  cardButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
