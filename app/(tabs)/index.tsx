/**
 * Home Screen
 * Quick start workout, recently used templates, and stats overview
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { TemplatePickerModal } from "@/components/Templates/TemplatePickerModal";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useWorkout } from "@/contexts/WorkoutContext";
import {
  getAllWorkoutTemplatesWithExercises,
} from "@/lib/database/templateQueries";
import {
  getRecentlyUsedTemplates,
} from "@/lib/database/sessionQueries";
import { WorkoutTemplateWithExercises } from "@/lib/database/schema";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];
  const { workouts } = useWorkout();

  const [templates, setTemplates] = useState<WorkoutTemplateWithExercises[]>([]);
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

  const handleTemplateSelect = (template: WorkoutTemplateWithExercises) => {
    setShowTemplatePicker(false);
    // Navigate to active session screen
    router.push({
      pathname: "/active-session",
      params: { templateId: template.id },
    });
  };

  const handleQuickStart = (templateId: string, templateName: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      handleTemplateSelect(template);
    }
  };

  // Calculate quick stats
  const totalWorkouts = workouts.length;
  const lastWorkoutDate = workouts.length > 0
    ? new Date(workouts[0].date).toLocaleDateString()
    : "Never";

  // Calculate current week volume
  const currentWeekStart = new Date();
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
  currentWeekStart.setHours(0, 0, 0, 0);

  const weekVolume = workouts
    .filter((w) => new Date(w.date) >= currentWeekStart)
    .reduce((sum, w) => sum + (w.totalVolume || 0), 0);

  return (
    <ThemedView style={styles.container}>
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
          <Text style={[styles.subtitle, { color: isDark ? "#999" : "#666" }]}>
            Start a workout or continue your journey
          </Text>
        </View>

        {/* Start Workout Button */}
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.tint }]}
          onPress={handleStartWorkout}
          activeOpacity={0.8}
        >
          <IconSymbol size={32} name="plus.circle.fill" color="#fff" />
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Stats
          </Text>
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "#fff",
                  borderColor: colors.border,
                },
              ]}
            >
              <IconSymbol size={28} name="dumbbell" color="#007AFF" />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {totalWorkouts}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? "#999" : "#666" }]}>
                Total Workouts
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "#fff",
                  borderColor: colors.border,
                },
              ]}
            >
              <IconSymbol size={28} name="calendar" color="#34C759" />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {lastWorkoutDate}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? "#999" : "#666" }]}>
                Last Workout
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "#fff",
                  borderColor: colors.border,
                },
              ]}
            >
              <IconSymbol size={28} name="chart.bar.fill" color="#FF9500" />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {weekVolume.toFixed(0)} kg
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? "#999" : "#666" }]}>
                This Week
              </Text>
            </View>
          </View>
        </View>

        {/* Recently Used Templates */}
        {recentTemplates.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recently Used
            </Text>
            {recentTemplates.map((item) => (
              <TouchableOpacity
                key={item.templateId}
                style={[
                  styles.recentCard,
                  {
                    backgroundColor: isDark ? "#1a1a1a" : "#fff",
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleQuickStart(item.templateId, item.templateName)}
                activeOpacity={0.7}
              >
                <View style={styles.recentCardContent}>
                  <View
                    style={[
                      styles.recentIcon,
                      { backgroundColor: colors.tint + "20" },
                    ]}
                  >
                    <IconSymbol size={24} name="dumbbell" color={colors.tint} />
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={[styles.recentName, { color: colors.text }]}>
                      {item.templateName}
                    </Text>
                    <Text
                      style={[styles.recentDate, { color: isDark ? "#999" : "#666" }]}
                    >
                      Last used: {new Date(item.lastUsed).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <IconSymbol size={20} name="chevron.right" color={colors.icon} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State for First Time Users */}
        {totalWorkouts === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol size={64} name="dumbbell" color={isDark ? "#666" : "#999"} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Welcome to Wino Workout!
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? "#999" : "#666" }]}>
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
    </ThemedView>
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
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 32,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
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
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recentCardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  recentDate: {
    fontSize: 13,
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
