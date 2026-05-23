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
        return "#007AFF";
      case "Bro Split":
        return "#FF9500";
      case "Full Body":
        return "#34C759";
      default:
        return colors.tint;
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
            { backgroundColor: isDark ? "#151718" : "#fff" },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.headerTop}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Start Workout
              </Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconSymbol
                  size={24}
                  name="chevron.right"
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <TextInput
              style={[
                styles.searchInput,
                {
                  borderColor: colors.border,
                  backgroundColor: isDark ? "#2a2a2a" : "#fff",
                  color: colors.text,
                },
              ]}
              placeholder="Search templates..."
              placeholderTextColor={isDark ? "#666" : "#999"}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Template List */}
          {filteredTemplates.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text
                style={[styles.emptyText, { color: isDark ? "#999" : "#666" }]}
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
                      backgroundColor: isDark ? "#1a1a1a" : "#fff",
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => handleSelect(template)}
                >
                  <View style={styles.templateInfo}>
                    <Text style={[styles.templateName, { color: colors.text }]}>
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
                          { color: isDark ? "#666" : "#999" },
                        ]}
                      >
                        •
                      </Text>
                      <Text
                        style={[
                          styles.exerciseCount,
                          { color: isDark ? "#999" : "#666" },
                        ]}
                      >
                        {template.exercises.length} exercises
                      </Text>
                    </View>
                  </View>
                  <IconSymbol
                    size={20}
                    name="chevron.right"
                    color={colors.tint}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
