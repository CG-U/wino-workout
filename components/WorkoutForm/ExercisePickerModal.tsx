/**
 * Exercise Picker Modal
 * Displays a list of previously logged exercises for quick selection
 */

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  addCustomExercise,
  getAllCustomExercises,
} from "@/lib/database/customExerciseQueries";
import React, { useEffect, useMemo, useState } from "react";

import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Basic exercise library organized by category
const BASIC_EXERCISES = [
  // Push (Chest, Shoulders, Triceps)
  "Bench Press",
  "Incline Bench Press",
  "Decline Bench Press",
  "Dumbbell Press",
  "Chest Fly",
  "Push-ups",
  "Overhead Press",
  "Shoulder Press",
  "Lateral Raise",
  "Front Raise",
  "Tricep Dips",
  "Tricep Pushdown",
  "Skull Crushers",

  // Pull (Back, Biceps)
  "Deadlift",
  "Pull-ups",
  "Chin-ups",
  "Lat Pulldown",
  "Barbell Row",
  "Dumbbell Row",
  "T-Bar Row",
  "Face Pulls",
  "Shrugs",
  "Bicep Curls",
  "Hammer Curls",
  "Preacher Curls",

  // Legs (Quads, Hamstrings, Glutes, Calves)
  "Squat",
  "Front Squat",
  "Leg Press",
  "Bulgarian Split Squat",
  "Lunges",
  "Romanian Deadlift",
  "Leg Curl",
  "Leg Extension",
  "Hip Thrust",
  "Calf Raise",
  "Seated Calf Raise",
];

interface ExercisePickerModalProps {
  visible: boolean;
  exercises: string[];
  onSelect: (exerciseName: string) => void;
  onClose: () => void;
}

export function ExercisePickerModal({
  visible,
  exercises,
  onSelect,
  onClose,
}: ExercisePickerModalProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const [searchText, setSearchText] = useState("");
  const [customExercises, setCustomExercises] = useState<string[]>([]);

  // Load custom exercises from DB when modal opens
  useEffect(() => {
    if (visible) {
      getAllCustomExercises().then(setCustomExercises).catch(console.error);
    }
  }, [visible]);

  // Merge basic exercises with user's logged exercises and custom exercises, remove duplicates
  const allExercises = useMemo(() => {
    const combined = [...BASIC_EXERCISES, ...exercises, ...customExercises];
    const unique = Array.from(
      new Set(combined.map((e) => e.toLowerCase())),
    ).map((lower) => combined.find((e) => e.toLowerCase() === lower)!);
    return unique.sort((a, b) => a.localeCompare(b));
  }, [exercises, customExercises]);

  const filteredExercises = allExercises.filter((exercise) =>
    exercise.toLowerCase().includes(searchText.toLowerCase()),
  );

  // Check if the search text exactly matches an existing exercise (case-insensitive)
  const trimmedSearch = searchText.trim();
  const exactMatchExists = allExercises.some(
    (e) => e.toLowerCase() === trimmedSearch.toLowerCase(),
  );
  const canAddCustom = trimmedSearch.length > 0 && !exactMatchExists;

  const handleSelect = (exerciseName: string) => {
    onSelect(exerciseName);
    setSearchText("");
  };

  const handleAddCustom = async () => {
    // Persist to database
    await addCustomExercise(trimmedSearch);
    setCustomExercises((prev) => [...prev, trimmedSearch]);
    onSelect(trimmedSearch);
    setSearchText("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#151718" : "#fff" },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Select Exercise
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol size={24} name="chevron.right" color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <TextInput
            style={[
              styles.searchInput,
              {
                borderColor: colors.border,
                backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                color: colors.text,
              },
            ]}
            placeholder="Search exercises..."
            placeholderTextColor={isDark ? "#666" : "#999"}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Exercise List */}
        {filteredExercises.length === 0 && !canAddCustom ? (
          <View style={styles.emptyContainer}>
            <Text
              style={[styles.emptyText, { color: isDark ? "#999" : "#666" }]}
            >
              No matching exercises
            </Text>
            <Text
              style={[styles.emptySubtext, { color: isDark ? "#666" : "#999" }]}
            >
              Try a different search term
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            renderItem={({ item: exercise }) => (
              <TouchableOpacity
                style={[
                  styles.exerciseItem,
                  {
                    backgroundColor: isDark ? "#1a1a1a" : "#fff",
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => handleSelect(exercise)}
              >
                <Text style={[styles.exerciseName, { color: colors.text }]}>
                  {exercise}
                </Text>
                <IconSymbol
                  size={20}
                  name="chevron.right"
                  color={colors.tint}
                />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              canAddCustom ? (
                <TouchableOpacity
                  style={[
                    styles.addCustomItem,
                    {
                      backgroundColor: isDark ? "#1a2a1a" : "#f0faf0",
                      borderColor: colors.tint,
                    },
                  ]}
                  onPress={handleAddCustom}
                >
                  <View style={styles.addCustomContent}>
                    <IconSymbol
                      size={20}
                      name="plus.circle.fill"
                      color={colors.tint}
                    />
                    <Text
                      style={[styles.addCustomText, { color: colors.tint }]}
                    >
                      Add "{trimmedSearch}"
                    </Text>
                  </View>
                  <IconSymbol
                    size={16}
                    name="chevron.right"
                    color={colors.tint}
                  />
                </TouchableOpacity>
              ) : null
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  listContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 4,
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,

    borderRadius: 8,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  addCustomItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: 8,
  },
  addCustomContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addCustomText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
