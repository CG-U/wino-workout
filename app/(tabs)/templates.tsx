/**
 * Templates Screen
 * Manage workout templates - view, create, edit, and delete
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { TemplateCard } from "@/components/Templates/TemplateCard";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getAllWorkoutTemplatesWithExercises,
  deleteWorkoutTemplate,
} from "@/lib/database/templateQueries";
import { WorkoutTemplateWithExercises } from "@/lib/database/schema";

export default function TemplatesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const [templates, setTemplates] = useState<WorkoutTemplateWithExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTemplates = async () => {
    try {
      const data = await getAllWorkoutTemplatesWithExercises();
      setTemplates(data);
    } catch (error) {
      console.error("Error loading templates:", error);
      Alert.alert("Error", "Failed to load templates");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTemplates();
  };

  const handleTemplatePress = (template: WorkoutTemplateWithExercises) => {
    // TODO: Navigate to template detail/edit screen
    Alert.alert(
      template.name,
      `${template.exercises.length} exercises\n\nExercises:\n${template.exercises.map((e) => `• ${e.name}`).join("\n")}`,
    );
  };

  const handleDeleteTemplate = (template: WorkoutTemplateWithExercises) => {
    if (template.isDefault) {
      Alert.alert("Cannot Delete", "Default templates cannot be deleted");
      return;
    }

    Alert.alert(
      "Delete Template",
      `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWorkoutTemplate(template.id);
              await loadTemplates();
            } catch (error) {
              console.error("Error deleting template:", error);
              Alert.alert("Error", "Failed to delete template");
            }
          },
        },
      ],
    );
  };

  const handleCreateTemplate = () => {
    // TODO: Navigate to create template screen
    Alert.alert("Create Template", "Template creation coming soon!");
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol size={64} name="list.bullet" color={isDark ? "#666" : "#999"} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Custom Templates
      </Text>
      <Text style={[styles.emptySubtitle, { color: isDark ? "#999" : "#666" }]}>
        You have {templates.length} default templates.{"\n"}
        Create your own custom workout plan!
      </Text>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.tint }]}
        onPress={handleCreateTemplate}
      >
        <IconSymbol size={20} name="plus.circle.fill" color="#fff" />
        <Text style={styles.createButtonText}>Create Template</Text>
      </TouchableOpacity>
    </View>
  );

  // Separate default and custom templates
  const defaultTemplates = templates.filter((t) => t.isDefault);
  const customTemplates = templates.filter((t) => !t.isDefault);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <ThemedText type="title">Templates</ThemedText>
        <Text style={[styles.subtitle, { color: isDark ? "#999" : "#666" }]}>
          Manage your workout plans
        </Text>
      </View>

      {/* Templates List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDark ? "#999" : "#666" }]}>
            Loading templates...
          </Text>
        </View>
      ) : customTemplates.length === 0 && defaultTemplates.length > 0 ? (
        <FlatList
          data={defaultTemplates}
          renderItem={({ item }) => (
            <TemplateCard
              template={item}
              onPress={() => handleTemplatePress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          ListFooterComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
        />
      ) : (
        <FlatList
          data={[...customTemplates, ...defaultTemplates]}
          renderItem={({ item }) => (
            <TemplateCard
              template={item}
              onPress={() => handleTemplatePress(item)}
              onDelete={!item.isDefault ? () => handleDeleteTemplate(item) : undefined}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          ListHeaderComponent={
            customTemplates.length > 0 ? (
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  My Templates
                </Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.tint,
            bottom: insets.bottom + 80,
          },
        ]}
        onPress={handleCreateTemplate}
        activeOpacity={0.8}
      >
        <IconSymbol size={28} name="plus.circle.fill" color="#fff" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingTop: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
