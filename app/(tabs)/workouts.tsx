/**
 * Workouts History Screen
 * Rich history view with time grouping, expandable cards, heatmap, filters, and swipe actions
 */

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StandardView } from "@/components/ui/standard-view";
import { Colors } from "@/constants/theme";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useWorkoutOperations } from "@/hooks/useWorkoutOperations";
import {
  ExerciseWithSets,
  Set as WorkoutSet,
  WorkoutWithExercises,
} from "@/lib/database/schema";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  LayoutAnimation,
  Platform,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ---------- Helpers ----------

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "1 month ago";
  return `${Math.floor(diffDays / 30)} months ago`;
}

function getSectionTitle(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 7) return "This Week";
  if (diffDays < 14) return "Last Week";

  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function getBestSet(sets: WorkoutSet[]): WorkoutSet | null {
  if (sets.length === 0) return null;
  return sets.reduce((best, s) =>
    s.weight * s.reps > best.weight * best.reps ? s : best,
  );
}

function getCategoryColor(
  templateName: string | null | undefined,
  colors: (typeof Colors)["dark"],
): string {
  if (!templateName) return colors.textTertiary;
  const lower = templateName.toLowerCase();
  if (lower.includes("push")) return colors.accent;
  if (lower.includes("pull")) return colors.success;
  if (lower.includes("leg")) return colors.warning;
  if (lower.includes("upper")) return colors.accent;
  if (lower.includes("lower")) return colors.warning;
  if (lower.includes("full")) return colors.success;
  return colors.accent;
}

// ---------- Calendar Heatmap ----------

function CalendarHeatmap({
  workouts,
  colors,
}: {
  workouts: WorkoutWithExercises[];
  colors: (typeof Colors)["dark"];
}) {
  const weeks = 4;
  const days = weeks * 7;

  const workoutDates = useMemo(() => {
    const set = new Set<string>();
    for (const w of workouts) {
      set.add(w.date.split("T")[0]);
    }
    return set;
  }, [workouts]);

  const cells = useMemo(() => {
    const result: { date: string; hasWorkout: boolean }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      result.push({ date: dateStr, hasWorkout: workoutDates.has(dateStr) });
    }
    return result;
  }, [workoutDates, days]);

  const grid: { date: string; hasWorkout: boolean }[][] = [];
  for (let w = 0; w < weeks; w++) {
    grid.push(cells.slice(w * 7, (w + 1) * 7));
  }

  const workoutCount = cells.filter((c) => c.hasWorkout).length;

  return (
    <View
      style={[
        heatmapStyles.container,
        { backgroundColor: colors.surface1, borderColor: colors.border },
      ]}
    >
      <View style={heatmapStyles.header}>
        <Text style={[heatmapStyles.title, { color: colors.textSecondary }]}>
          Last 4 Weeks
        </Text>
        <Text style={[heatmapStyles.count, { color: colors.textPrimary }]}>
          {workoutCount} workout{workoutCount !== 1 ? "s" : ""}
        </Text>
      </View>
      <View style={heatmapStyles.grid}>
        {grid.map((week, wi) => (
          <View key={wi} style={heatmapStyles.row}>
            {week.map((cell, di) => (
              <View
                key={`${wi}-${di}`}
                style={[
                  heatmapStyles.cell,
                  {
                    backgroundColor: cell.hasWorkout
                      ? colors.accent
                      : colors.surface3,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={heatmapStyles.legend}>
        <Text
          style={[heatmapStyles.legendText, { color: colors.textTertiary }]}
        >
          Less
        </Text>
        <View
          style={[heatmapStyles.cell, { backgroundColor: colors.surface3 }]}
        />
        <View
          style={[
            heatmapStyles.cell,
            { backgroundColor: colors.accent, opacity: 0.5 },
          ]}
        />
        <View
          style={[heatmapStyles.cell, { backgroundColor: colors.accent }]}
        />
        <Text
          style={[heatmapStyles.legendText, { color: colors.textTertiary }]}
        >
          More
        </Text>
      </View>
    </View>
  );
}

// ---------- Workout Card ----------

function WorkoutCard({
  workout,
  colors,
  expanded,
  onToggle,
  onDelete,
  averageVolume,
}: {
  workout: WorkoutWithExercises;
  colors: (typeof Colors)["dark"];
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  averageVolume: number;
}) {
  const date = new Date(workout.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const relativeTime = getRelativeTime(workout.date);
  const accentColor = getCategoryColor(workout.templateName, colors);

  const volumeDiff =
    averageVolume > 0
      ? ((workout.totalVolume - averageVolume) / averageVolume) * 100
      : 0;
  const volumeUp = volumeDiff > 5;
  const volumeDown = volumeDiff < -5;

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        onPress={onDelete}
        style={[
          swipeStyles.deleteAction,
          { backgroundColor: colors.destructive },
        ]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <IconSymbol size={22} name="trash" color="#FFFFFF" />
          <Text style={swipeStyles.deleteText}>Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        style={[
          styles.workoutCard,
          { backgroundColor: colors.surface1, borderColor: colors.border },
        ]}
      >
        {/* Left accent strip */}
        <View
          style={[styles.accentStrip, { backgroundColor: accentColor }]}
        />

        <View style={styles.cardInner}>
          {/* Header row */}
          <View style={styles.cardHeader}>
            <View style={styles.dateSection}>
              {workout.templateName && (
                <Text style={[styles.templateName, { color: accentColor }]}>
                  {workout.templateName}
                </Text>
              )}
              <View style={styles.dateRow}>
                <Text style={[styles.date, { color: colors.textPrimary }]}>
                  {formattedDate}
                </Text>
                <Text
                  style={[styles.relativeTime, { color: colors.textTertiary }]}
                >
                  {relativeTime}
                </Text>
              </View>
            </View>

            {/* Volume badge */}
            <View style={styles.volumeBadge}>
              <Text style={[styles.volumeText, { color: colors.textPrimary }]}>
                {workout.totalVolume >= 1000
                  ? `${(workout.totalVolume / 1000).toFixed(1)}t`
                  : `${workout.totalVolume.toFixed(0)}kg`}
              </Text>
              {(volumeUp || volumeDown) && (
                <View
                  style={[
                    styles.volumeIndicator,
                    {
                      backgroundColor: volumeUp
                        ? colors.successSubtle
                        : colors.destructiveSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.volumeIndicatorText,
                      {
                        color: volumeUp
                          ? colors.success
                          : colors.destructive,
                      },
                    ]}
                  >
                    {volumeUp ? "↑" : "↓"}
                    {Math.abs(volumeDiff).toFixed(0)}%
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Summary stats */}
          <View style={styles.summaryRow}>
            <View
              style={[styles.statPill, { backgroundColor: colors.surface2 }]}
            >
              <Text
                style={[
                  styles.statPillText,
                  { color: colors.textSecondary },
                ]}
              >
                {workout.exerciseCount} exercise
                {workout.exerciseCount !== 1 ? "s" : ""}
              </Text>
            </View>
            <View
              style={[styles.statPill, { backgroundColor: colors.surface2 }]}
            >
              <Text
                style={[
                  styles.statPillText,
                  { color: colors.textSecondary },
                ]}
              >
                {workout.exercises.reduce(
                  (sum, e) => sum + e.sets.length,
                  0,
                )}{" "}
                sets
              </Text>
            </View>
            <IconSymbol
              size={16}
              name={expanded ? "chevron.up" : "chevron.down"}
              color={colors.textTertiary}
            />
          </View>

          {/* Expanded exercise details */}
          {expanded && (
            <View style={styles.expandedSection}>
              {workout.exercises.map((exercise) => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  colors={colors}
                />
              ))}
              {workout.notes ? (
                <View
                  style={[
                    styles.notesSection,
                    { borderTopColor: colors.border },
                  ]}
                >
                  <Text
                    style={[styles.notes, { color: colors.textSecondary }]}
                  >
                    &ldquo;{workout.notes}&rdquo;
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

// ---------- Exercise Row (inside expanded card) ----------

function ExerciseRow({
  exercise,
  colors,
}: {
  exercise: ExerciseWithSets;
  colors: (typeof Colors)["dark"];
}) {
  const bestSet = getBestSet(exercise.sets);

  return (
    <View style={styles.exerciseRow}>
      <View style={styles.exerciseHeader}>
        <Text style={[styles.exerciseName, { color: colors.textPrimary }]}>
          {exercise.name}
        </Text>
        {bestSet && (
          <View
            style={[
              styles.bestSetBadge,
              { backgroundColor: colors.accentSubtle },
            ]}
          >
            <Text style={[styles.bestSetText, { color: colors.accent }]}>
              ★ {bestSet.weight}kg × {bestSet.reps}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.setsGrid}>
        {exercise.sets.map((set) => (
          <View
            key={set.id}
            style={[
              styles.setChip,
              {
                backgroundColor:
                  bestSet && set.id === bestSet.id
                    ? colors.accentSubtle
                    : colors.surface2,
              },
            ]}
          >
            <Text
              style={[
                styles.setChipText,
                {
                  color:
                    bestSet && set.id === bestSet.id
                      ? colors.accent
                      : colors.textSecondary,
                },
              ]}
            >
              {set.weight}kg × {set.reps}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------- Main Screen ----------

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const { workouts, loading } = useWorkout();
  const { loadAllWorkouts, deleteWorkoutData } = useWorkoutOperations();

  const [refreshing, setRefreshing] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortNewest, setSortNewest] = useState(true);

  useEffect(() => {
    loadAllWorkouts();
  }, [loadAllWorkouts]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAllWorkouts();
    } finally {
      setRefreshing(false);
    }
  };

  const toggleExpand = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleDeleteWorkout = useCallback(
    (workout: WorkoutWithExercises) => {
      Alert.alert(
        "Delete Workout?",
        `Delete the workout from ${new Date(workout.date).toLocaleDateString()}? This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteWorkoutData(workout.id);
              } catch (error) {
                Alert.alert(
                  "Error",
                  error instanceof Error
                    ? error.message
                    : "Failed to delete workout",
                );
              }
            },
          },
        ],
      );
    },
    [deleteWorkoutData],
  );

  // Average volume of last 5 workouts (for comparison indicator)
  const averageVolume = useMemo(() => {
    if (workouts.length === 0) return 0;
    const recent = workouts.slice(0, Math.min(5, workouts.length));
    return recent.reduce((sum, w) => sum + w.totalVolume, 0) / recent.length;
  }, [workouts]);

  // Filter workouts
  const filteredWorkouts = useMemo(() => {
    let result = [...workouts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (w) =>
          w.exercises.some((e) => e.name.toLowerCase().includes(q)) ||
          (w.templateName && w.templateName.toLowerCase().includes(q)),
      );
    }

    if (!sortNewest) {
      result.reverse();
    }

    return result;
  }, [workouts, searchQuery, sortNewest]);

  // Group into sections
  const sections = useMemo(() => {
    const map = new Map<string, WorkoutWithExercises[]>();

    for (const workout of filteredWorkouts) {
      const title = getSectionTitle(workout.date);
      if (!map.has(title)) {
        map.set(title, []);
      }
      map.get(title)!.push(workout);
    }

    return Array.from(map.entries()).map(([title, data]) => ({
      title,
      data,
    }));
  }, [filteredWorkouts]);

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string; data: WorkoutWithExercises[] };
  }) => (
    <View
      style={[styles.sectionHeader, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {section.title}
      </Text>
      <Text style={[styles.sectionCount, { color: colors.textTertiary }]}>
        {section.data.length}
      </Text>
    </View>
  );

  const renderWorkoutItem = ({
    item: workout,
  }: {
    item: WorkoutWithExercises;
  }) => (
    <WorkoutCard
      workout={workout}
      colors={colors}
      expanded={expandedIds.has(workout.id)}
      onToggle={() => toggleExpand(workout.id)}
      onDelete={() => handleDeleteWorkout(workout)}
      averageVolume={averageVolume}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol size={48} name="dumbbell" color={colors.textTertiary} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No workouts yet
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
        Start logging your workouts to track progress
      </Text>
    </View>
  );

  const renderListHeader = () => (
    <View>
      {/* Calendar Heatmap */}
      {workouts.length > 0 && (
        <CalendarHeatmap workouts={workouts} colors={colors} />
      )}

      {/* Search & Filter Bar */}
      <View style={styles.filterBar}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.surface2, borderColor: colors.border },
          ]}
        >
          <IconSymbol
            size={16}
            name="magnifyingglass"
            color={colors.textTertiary}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search exercises or templates..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <IconSymbol
                size={16}
                name="xmark.circle.fill"
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: colors.surface2 }]}
          onPress={() => setSortNewest((prev) => !prev)}
        >
          <IconSymbol
            size={16}
            name={sortNewest ? "arrow.down" : "arrow.up"}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Results info */}
      {searchQuery.trim().length > 0 && (
        <Text style={[styles.filterInfo, { color: colors.textTertiary }]}>
          {filteredWorkouts.length} result
          {filteredWorkouts.length !== 1 ? "s" : ""}
        </Text>
      )}
    </View>
  );

  return (
    <StandardView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <ThemedText type="title">Workouts</ThemedText>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {workouts.length} workout{workouts.length !== 1 ? "s" : ""} logged
        </Text>
      </View>

      {loading && workouts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderWorkoutItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmpty}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.tint}
            />
          }
        />
      )}
    </StandardView>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingTop: 8,
  },

  // Filter bar
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    marginTop: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: 40,
  },
  sortButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  filterInfo: {
    fontSize: 12,
    marginBottom: 8,
  },

  // Section headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 12,
  },

  // Workout card
  workoutCard: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    overflow: "hidden",
  },
  accentStrip: {
    width: 4,
  },
  cardInner: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dateSection: {
    flex: 1,
  },
  templateName: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: "600",
  },
  relativeTime: {
    fontSize: 12,
  },

  // Volume badge
  volumeBadge: {
    alignItems: "flex-end",
  },
  volumeText: {
    fontSize: 15,
    fontWeight: "700",
  },
  volumeIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  volumeIndicatorText: {
    fontSize: 10,
    fontWeight: "600",
  },

  // Summary row
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  statPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statPillText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Expanded section
  expandedSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(128,128,128,0.1)",
  },

  // Exercise row
  exerciseRow: {
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  bestSetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bestSetText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Sets grid
  setsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  setChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  setChipText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Notes
  notesSection: {
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
  },
  notes: {
    fontSize: 12,
    fontStyle: "italic",
  },

  // Empty state
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
});

const heatmapStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  count: {
    fontSize: 13,
    fontWeight: "700",
  },
  grid: {
    gap: 4,
  },
  row: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
  },
  cell: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 8,
  },
  legendText: {
    fontSize: 10,
  },
});

const swipeStyles = StyleSheet.create({
  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 12,
    marginBottom: 10,
    marginLeft: 8,
  },
  deleteText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});
