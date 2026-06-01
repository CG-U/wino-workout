import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { seedDefaultTemplates } from "@/constants/defaultTemplates";
import { Colors } from "@/constants/theme";
import { WorkoutProvider } from "@/contexts/WorkoutContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initializeDatabase } from "@/lib/database/db";

export const unstable_settings = {
  anchor: "(tabs)",
};

// Custom navigation themes aligned with our color system
const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.accent,
    background: Colors.dark.background,
    card: Colors.dark.surface1,
    text: Colors.dark.textPrimary,
    border: Colors.dark.border,
    notification: Colors.dark.accent,
  },
};

const AppLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.accent,
    background: Colors.light.background,
    card: Colors.light.surface1,
    text: Colors.light.textPrimary,
    border: Colors.light.border,
    notification: Colors.light.accent,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const initDb = async () => {
      try {
        await initializeDatabase();
        await seedDefaultTemplates(); // Seed default templates on first launch
        setDbReady(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);
        setDbReady(true); // Still allow app to continue, but log the error
      }
    };

    initDb();
  }, []);

  if (!dbReady) {
    return null; // Show splash screen while DB initializes
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WorkoutProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? AppDarkTheme : AppLightTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </WorkoutProvider>
    </GestureHandlerRootView>
  );
}
