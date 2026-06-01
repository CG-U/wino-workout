/**
 * Create Template Modal
 * Full-screen modal for creating a new workout template
 */

import { ExercisePickerModal } from "@/components/WorkoutForm/ExercisePickerModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { WorkoutTemplateWithExercises } from "@/lib/database/schema";
import {
  createCompleteTemplate,
  updateCompleteTemplate,
} from "@/lib/database/templateQueries";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = ["PPL", "Bro Split", "Full Body", "Custom"] as const;
type Category = (typeof CATEGORIES)[number];

interface CreateTemplateModalProps {
  visible: boolean;
  mode?: "create" | "edit";
  initialTemplate?: WorkoutTemplateWithExercises | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CreateTemplateModal({
  visible,
  mode = "create",
  initialTemplate,
  onClose,
  onSaved,
}: CreateTemplateModalProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Custom");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<{ name: string; notes: string }[]>(
    [],
  );
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;

    if (mode === "edit" && initialTemplate) {
      setName(initialTemplate.name);
      setCategory(initialTemplate.category);
      setNotes(initialTemplate.notes || "");
      setExercises(
        initialTemplate.exercises.map((exercise) => ({
          name: exercise.name,
          notes: exercise.notes || "",
        })),
      );
      return;
    }

    setName("");
    setCategory("Custom");
    setNotes("");
    setExercises([]);
  }, [visible, mode, initialTemplate]);

  const handleClose = () => {
    setShowExercisePicker(false);
    onClose();
  };

  const handleAddExercise = (exerciseName: string) => {
    setExercises((prev) => [...prev, { name: exerciseName, notes: "" }]);
    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Missing Name", "Please enter a template name.");
      return;
    }
    if (exercises.length === 0) {
      Alert.alert(
        "No Exercises",
        "Please add at least one exercise to the template.",
      );
      return;
    }

    setSaving(true);
    try {
      if (mode === "edit" && initialTemplate) {
        await updateCompleteTemplate(
          initialTemplate.id,
          trimmedName,
          category,
          notes.trim(),
          exercises,
        );
      } else {
        await createCompleteTemplate(
          trimmedName,
          category,
          notes.trim(),
          exercises,
        );
      }
      onSaved();
    } catch (error) {
      console.error("Error saving template:", error);
      Alert.alert("Error", "Failed to save template. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 8,
              backgroundColor: colors.surface1,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {mode === "edit" ? "Edit Template" : "New Template"}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.headerButton}
            disabled={saving}
          >
            <Text
              style={[
                styles.saveText,
                { color: colors.accent, opacity: saving ? 0.5 : 1 },
              ]}
            >
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Template Name */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Template Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.surface2,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. Upper Body Day"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Category
            </Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor:
                        category === cat ? colors.accent : colors.surface2,
                      borderColor:
                        category === cat ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color: category === cat ? "#fff" : colors.textPrimary,
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Notes (optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.notesInput,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.surface2,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Add notes about this template..."
              placeholderTextColor={colors.textTertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Exercises */}
          <View style={styles.section}>
            <View style={styles.exercisesHeader}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Exercises ({exercises.length})
              </Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.accent }]}
                onPress={() => setShowExercisePicker(true)}
              >
                <IconSymbol size={16} name="plus" color="#fff" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {exercises.length === 0 ? (
              <View
                style={[
                  styles.emptyExercises,
                  { backgroundColor: colors.surface2 },
                ]}
              >
                <Text
                  style={[
                    styles.emptyExercisesText,
                    { color: colors.textTertiary },
                  ]}
                >
                  No exercises added yet.{"\n"}Tap "Add" to select exercises.
                </Text>
              </View>
            ) : (
              <View style={styles.exerciseList}>
                {exercises.map((exercise, index) => (
                  <View
                    key={`${exercise.name}-${index}`}
                    style={[
                      styles.exerciseItem,
                      {
                        backgroundColor: colors.surface2,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.exerciseInfo}>
                      <Text
                        style={[styles.exerciseOrder, { color: colors.accent }]}
                      >
                        {index + 1}
                      </Text>
                      <Text
                        style={[
                          styles.exerciseName,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {exercise.name}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveExercise(index)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <IconSymbol
                        size={20}
                        name="xmark.circle.fill"
                        color={colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Exercise Picker */}
      <ExercisePickerModal
        visible={showExercisePicker}
        exercises={[]}
        onSelect={handleAddExercise}
        onClose={() => setShowExercisePicker(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  cancelText: {
    fontSize: 16,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  exercisesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyExercises: {
    borderRadius: 10,
    padding: 24,
    alignItems: "center",
  },
  emptyExercisesText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  exerciseList: {
    gap: 8,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  exerciseInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  exerciseOrder: {
    fontSize: 14,
    fontWeight: "700",
    width: 20,
  },
  exerciseName: {
    fontSize: 16,
    flex: 1,
  },
});
