/**
 * Home Screen
 * Quick start workout, recently used templates, and stats overview
 */

import { TemplatePickerModal } from "@/components/Templates/TemplatePickerModal";
import { ThemedText } from "@/components/themed-text";
import { CardButton, PrimaryButton } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StandardView } from "@/components/ui/standard-view";
import { Colors } from "@/constants/theme";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  ActiveSession,
  SessionExercise,
  WorkoutTemplateWithExercises,
} from "@/lib/database/schema";
import {
  getLastExercisePerformance,
  getRecentlyUsedTemplates,
} from "@/lib/database/sessionQueries";
import { getAllWorkoutTemplatesWithExercises } from "@/lib/database/templateQueries";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];
  const { workouts, dispatch } = useWorkout();

  const [templates, setTemplates] = useState<WorkoutTemplateWithExercises[]>(
    [],
  );
  const [recentTemplates, setRecentTemplates] = useState<
    { templateId: string; templateName: string; lastUsed: string }[]
  >([]);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  useEffect(() => {
    loadData();
  }, [workouts]);

  const loadData = async () => {
    try {
      const [allTemplates, recent] = await Promise.all([
        getAllWorkoutTemplatesWithExercises(),
        getRecentlyUsedTemplates(3),
      ]);
      setTemplates(allTemplates);
      setRecentTemplates(recent);
    } catch (error) {
      console.error("Error loading home data:", error);
    }
  };

  const handleStartWorkout = () => {
    setShowTemplatePicker(true);
  };

  const handleTemplateSelect = async (
    template: WorkoutTemplateWithExercises,
  ) => {
    setShowTemplatePicker(false);

    try {
      // Initialize session exercises with previous performance
      const sessionExercises: SessionExercise[] = await Promise.all(
        template.exercises.map(async (te) => {
          const lastPerformance = await getLastExercisePerformance(te.name);
          return {
            templateExerciseId: te.id,
            name: te.name,
            notes: te.notes,
            order: te.order,
            sets: [],
            lastPerformance: lastPerformance || undefined,
          };
        }),
      );

      // Create active session
      const session: ActiveSession = {
        templateId: template.id,
        templateName: template.name,
        startedAt: Date.now(),
        date: new Date().toISOString().split("T")[0],
        notes: "",
        exercises: sessionExercises,
      };

      // Dispatch START_SESSION
      dispatch({ type: "START_SESSION", payload: session });

      // Navigate to session tab
      router.push("/(tabs)/session");
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  const handleQuickStart = (templateId: string, templateName: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      handleTemplateSelect(template);
    }
  };

  // Calculate quick stats
  const totalWorkouts = workouts.length;
  const lastWorkoutDate =
    workouts.length > 0
      ? new Date(workouts[0].date).toLocaleDateString()
      : "Never";

  // Calculate current week volume
  const currentWeekStart = new Date();
  currentWeekStart.setDate(
    currentWeekStart.getDate() - currentWeekStart.getDay(),
  );
  currentWeekStart.setHours(0, 0, 0, 0);

  const weekVolume = workouts
    .filter((w) => new Date(w.date) >= currentWeekStart)
    .reduce((sum, w) => sum + (w.totalVolume || 0), 0);

  return (
    <StandardView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Ready to Train?</ThemedText>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Start a workout or continue your journey
          </Text>
        </View>

        {/* Start Workout Button */}
        <PrimaryButton
          title="Start Workout"
          icon="plus.circle.fill"
          onPress={handleStartWorkout}
          style={styles.startButton}
        />

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Quick Stats
          </Text>
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surface1,
                  borderColor: colors.border,
                },
              ]}
            >
              <IconSymbol size={28} name="dumbbell" color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {totalWorkouts}
              </Text>
              <Text
                style={[styles.statLabel, { color: colors.textSecondary }]}
              >
                Total Workouts
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surface1,
                  borderColor: colors.border,
                },
              ]}
            >
              <IconSymbol size={28} name="calendar" color={colors.success} />
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {lastWorkoutDate}
              </Text>
              <Text
                style={[styles.statLabel, { color: colors.textSecondary }]}
              >
                Last Workout
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surface1,
                  borderColor: colors.border,
                },
              ]}
            >
              <IconSymbol size={28} name="chart.bar.fill" color={colors.warning} />
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {weekVolume.toFixed(0)} kg
              </Text>
              <Text
                style={[styles.statLabel, { color: colors.textSecondary }]}
              >
                This Week
              </Text>
            </View>
          </View>
        </View>

        {/* Recently Used Templates */}
        {recentTemplates.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Recently Used
            </Text>
            {recentTemplates.map((item) => (
              <CardButton
                key={item.templateId}
                title={item.templateName}
                subtitle={`Last used: ${new Date(item.lastUsed).toLocaleDateString()}`}
                icon="dumbbell"
                onPress={() =>
                  handleQuickStart(item.templateId, item.templateName)
                }
              />
            ))}
          </View>
        )}

        {/* Empty State for First Time Users */}
        {totalWorkouts === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol
              size={64}
              name="dumbbell"
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Welcome to Wino Workout!
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: colors.textSecondary },
              ]}
            >
              Tap &quot;Start Workout&quot; above to begin your fitness journey.
              We&apos;ve got {templates.length} templates ready for you!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Template Picker Modal */}
      <TemplatePickerModal
        visible={showTemplatePicker}
        templates={templates}
        onSelect={handleTemplateSelect}
        onClose={() => setShowTemplatePicker(false)}
      />
    </StandardView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // Horizontal padding is provided by StandardView
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  startButton: {
    marginBottom: 32,
  },
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  recentSection: {
    marginBottom: 32,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
