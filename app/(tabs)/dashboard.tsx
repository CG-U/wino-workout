/**
 * Dashboard Screen
 * Comprehensive analytics and progress metrics
 */

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StandardView } from "@/components/ui/standard-view";
import { Colors } from "@/constants/theme";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { calculateDashboardStats } from "@/lib/analytics/workoutStats";
import React, { useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const { workouts } = useWorkout();

  // Calculate all stats
  const stats = useMemo(() => calculateDashboardStats(workouts), [workouts]);

  const StatCard = ({
    icon,
    label,
    value,
    unit = "",
  }: {
    icon: "dumbbell" | "chart.line.uptrend.xyaxis" | "flame" | "figure.walk";
    label: string;
    value: string | number;
    unit?: string;
  }) => (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.surface1,
          borderColor: colors.border,
        },
      ]}
    >
      <IconSymbol size={24} name={icon} color={colors.accent} />
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <View style={styles.statValue}>
        <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{value}</Text>
        {unit && (
          <Text style={[styles.statUnit, { color: colors.textSecondary }]}>
            {unit}
          </Text>
        )}
      </View>
    </View>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
  );

  return (
    <StandardView style={styles.container} padded={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 16,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Dashboard</ThemedText>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your workout progress and stats
          </Text>
        </View>

        {workouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              size={48}
              name="chart.bar.fill"
              color={colors.textTertiary}
            />
            <Text
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              No data yet
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.textTertiary }]}
            >
              Log some workouts to see your progress
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Stats */}
            <View style={styles.statsGrid}>
              <StatCard
                icon="dumbbell"
                label="Total Workouts"
                value={stats.totalWorkouts}
              />
              <StatCard
                icon="chart.line.uptrend.xyaxis"
                label="Exercises Logged"
                value={stats.totalExercisesLogged}
              />
              <StatCard
                icon="flame"
                label="Current Streak"
                value={stats.currentStreak}
                unit="days"
              />
              <StatCard
                icon="figure.walk"
                label="Total Volume"
                value={stats.totalVolumeLifted.toFixed(0)}
                unit="kg"
              />
            </View>

            {/* Average Stats */}
            <View style={styles.section}>
              <SectionTitle title="Averages" />
              <View
                style={[
                  styles.infoCard,
                  {
                    backgroundColor: colors.surface1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Avg. Volume per Workout
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                    {stats.averageVolumePerWorkout.toFixed(1)} kg
                  </Text>
                </View>
              </View>
            </View>

            {/* Top Exercises */}
            {stats.favoriteExercises.length > 0 && (
              <View style={styles.section}>
                <SectionTitle title="Top Exercises" />
                {stats.favoriteExercises.map((exercise, index) => (
                  <View
                    key={exercise.name}
                    style={[
                      styles.exerciseItem,
                      {
                        backgroundColor: colors.surface1,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.exerciseRank}>
                      <Text style={[styles.rankBadge, { color: "#fff" }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text
                        style={[styles.exerciseName, { color: colors.textPrimary }]}
                      >
                        {exercise.name}
                      </Text>
                      <Text
                        style={[
                          styles.exerciseStats,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {exercise.totalSets} sets • {exercise.totalReps} reps •{" "}
                        {exercise.totalVolume.toFixed(0)} kg
                      </Text>
                    </View>
                    <View style={styles.exerciseMaxWeight}>
                      <Text
                        style={[
                          styles.maxWeightLabel,
                          { color: colors.textTertiary },
                        ]}
                      >
                        Max
                      </Text>
                      <Text style={[styles.maxWeight, { color: colors.accent }]}>
                        {exercise.maxWeight.toFixed(1)} kg
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Personal Records */}
            {stats.personalRecords.length > 0 && (
              <View style={styles.section}>
                <SectionTitle title="Personal Records" />
                {stats.personalRecords.slice(0, 5).map((pr) => (
                  <View
                    key={pr.exerciseName}
                    style={[
                      styles.prItem,
                      {
                        backgroundColor: colors.surface1,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.prContent}>
                      <Text style={[styles.prName, { color: colors.textPrimary }]}>
                        {pr.exerciseName}
                      </Text>
                      <Text
                        style={[
                          styles.prDate,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {new Date(pr.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.prValue}>
                      <Text style={[styles.prNumber, { color: colors.accent }]}>
                        {pr.maxWeight.toFixed(1)} kg
                      </Text>
                      <Text
                        style={[
                          styles.prReps,
                          { color: colors.textSecondary },
                        ]}
                      >
                        × {pr.reps}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Exercise Frequency */}
            {stats.exerciseFrequency.length > 0 && (
              <View style={styles.section}>
                <SectionTitle title="Most Frequently Done" />
                {stats.exerciseFrequency.slice(0, 5).map((item, index) => (
                  <View
                    key={item.name}
                    style={[
                      styles.frequencyItem,
                      {
                        backgroundColor: colors.surface1,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.frequencyName, { color: colors.textPrimary }]}
                    >
                      {item.name}
                    </Text>
                    <View style={styles.frequencyBar}>
                      <View
                        style={[
                          styles.frequencyBarFill,
                          {
                            width: `${(item.count / stats.exerciseFrequency[0].count) * 100}%`,
                            backgroundColor: colors.accent,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.frequencyCount,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.count}x
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Volume by Week Chart */}
            {stats.volumeByWeek.length > 0 && (
              <View style={styles.section}>
                <SectionTitle title="Volume by Week" />
                <View
                  style={[
                    styles.weekCard,
                    {
                      backgroundColor: colors.surface1,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <BarChart
                    data={{
                      labels: stats.volumeByWeek.slice(-8).map((week) =>
                        new Date(week.week).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        }),
                      ),
                      datasets: [
                        {
                          data: stats.volumeByWeek
                            .slice(-8)
                            .map((w) => w.volume),
                        },
                      ],
                    }}
                    width={screenWidth - 48}
                    height={180}
                    yAxisLabel=""
                    yAxisSuffix=" kg"
                    chartConfig={{
                      backgroundColor: colors.surface1,
                      backgroundGradientFrom: colors.surface1,
                      backgroundGradientTo: colors.surface1,
                      decimalPlaces: 0,
                      color: (opacity = 1) => colors.accent,
                      labelColor: (opacity = 1) => colors.textSecondary,
                      style: {
                        borderRadius: 12,
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: "",
                        stroke: colors.border,
                        strokeWidth: 1,
                      },
                      propsForLabels: {
                        fontSize: 10,
                      },
                    }}
                    style={{
                      marginVertical: 8,
                      borderRadius: 12,
                    }}
                    showValuesOnTopOfBars
                    fromZero
                  />
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
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
  header: {
    paddingBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    width: (screenWidth - 40) / 2 - 6,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
    textTransform: "uppercase",
    textAlign: "center",
  },
  statValue: {
    marginTop: 6,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  statUnit: {
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  exerciseRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  rankBadge: {
    fontWeight: "700",
    fontSize: 14,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: "600",
  },
  exerciseStats: {
    fontSize: 12,
    marginTop: 2,
  },
  exerciseMaxWeight: {
    alignItems: "flex-end",
  },
  maxWeightLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  maxWeight: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  prItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  prContent: {
    flex: 1,
  },
  prName: {
    fontSize: 14,
    fontWeight: "600",
  },
  prDate: {
    fontSize: 12,
    marginTop: 2,
  },
  prValue: {
    alignItems: "flex-end",
  },
  prNumber: {
    fontSize: 16,
    fontWeight: "700",
  },
  prReps: {
    fontSize: 12,
    marginTop: 2,
  },
  frequencyItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  frequencyName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  frequencyBar: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  frequencyBarFill: {
    height: "100%",
  },
  frequencyCount: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },
  weekCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
});
