/**
 * Add Button Component
 * Styled button for adding exercises or sets
 */

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface AddButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: "small" | "medium" | "large";
}

export function AddButton({
  label,
  onPress,
  style,
  textStyle,
  size = "medium",
}: AddButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  const sizeStyles = {
    small: {
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    medium: {
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    large: {
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { borderColor: colors.accent, backgroundColor: colors.accentSubtle },
        sizeStyles[size],
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.buttonText,
          { color: colors.accent },
          size === "small" && styles.smallText,
          textStyle,
        ]}
      >
        + {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  smallText: {
    fontSize: 12,
  },
});
