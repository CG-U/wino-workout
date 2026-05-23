import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { seedDefaultTemplates } from "@/constants/defaultTemplates";
import { WorkoutProvider } from "@/contexts/WorkoutContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initializeDatabase } from "@/lib/database/db";

export const unstable_settings = {
  anchor: "(tabs)",
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
    <WorkoutProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
  );
}
