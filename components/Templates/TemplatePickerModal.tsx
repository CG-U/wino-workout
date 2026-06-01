/**
 * Template Picker Modal
 * Modal for selecting a workout template to start a session
 */

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { WorkoutTemplateWithExercises } from "@/lib/database/schema";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TemplatePickerModalProps {
  visible: boolean;
  templates: WorkoutTemplateWithExercises[];
  onSelect: (template: WorkoutTemplateWithExercises) => void;
  onClose: () => void;
}

export function TemplatePickerModal({
  visible,
  templates,
  onSelect,
  onClose,
}: TemplatePickerModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const [searchText, setSearchText] = useState("");

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchText.toLowerCase()) ||
      template.category.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleSelect = (template: WorkoutTemplateWithExercises) => {
    onSelect(template);
    setSearchText("");
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "PPL":
        return "#3B82F6";
      case "Bro Split":
        return "#F59E0B";
      case "Full Body":
        return "#22C55E";
      default:
        return colors.accent;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.surface1,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.headerTop}>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                Start Workout
              </Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconSymbol
                  size={24}
                  name="chevron.right"
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <TextInput
              style={[
                styles.searchInput,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface2,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Search templates..."
              placeholderTextColor={colors.textTertiary}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Template List */}
          {filteredTemplates.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text
                style={[styles.emptyText, { color: colors.textSecondary }]}
              >
                No matching templates
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredTemplates}
              renderItem={({ item: template }) => (
                <TouchableOpacity
                  style={[
                    styles.templateItem,
                    {
                      backgroundColor: colors.surface1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => handleSelect(template)}
                >
                  <View style={styles.templateInfo}>
                    <Text style={[styles.templateName, { color: colors.textPrimary }]}>
                      {template.name}
                    </Text>
                    <View style={styles.templateMeta}>
                      <Text
                        style={[
                          styles.templateCategory,
                          { color: getCategoryColor(template.category) },
                        ]}
                      >
                        {template.category}
                      </Text>
                      <Text
                        style={[
                          styles.separator,
                          { color: colors.textTertiary },
                        ]}
                      >
                        •
                      </Text>
                      <Text
                        style={[
                          styles.exerciseCount,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {template.exercises.length} exercises
                      </Text>
                    </View>
                  </View>
                  <IconSymbol
                    size={20}
                    name="chevron.right"
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "80%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTop: {
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
  },
  templateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  templateMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  templateCategory: {
    fontSize: 13,
    fontWeight: "600",
  },
  separator: {
    marginHorizontal: 6,
    fontSize: 12,
  },
  exerciseCount: {
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});
