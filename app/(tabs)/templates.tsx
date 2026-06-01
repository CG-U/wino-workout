/**
 * Templates Screen
 * Manage workout templates - view, create, edit, and delete
 */

import { CreateTemplateModal } from "@/components/Templates/CreateTemplateModal";
import { TemplateCard } from "@/components/Templates/TemplateCard";
import { ThemedText } from "@/components/themed-text";
import { IconButton, PrimaryButton } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StandardView } from "@/components/ui/standard-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { WorkoutTemplateWithExercises } from "@/lib/database/schema";
import {
  deleteWorkoutTemplate,
  getAllWorkoutTemplatesWithExercises,
} from "@/lib/database/templateQueries";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TemplatesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const [templates, setTemplates] = useState<WorkoutTemplateWithExercises[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkoutTemplateWithExercises | null>(null);
  const [editingTemplate, setEditingTemplate] =
    useState<WorkoutTemplateWithExercises | null>(null);

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
    setSelectedTemplate(template);
    setShowTemplateModal(true);
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
              setShowTemplateModal(false);
              setSelectedTemplate(null);
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
    setEditingTemplate(null);
    setShowCreateModal(true);
  };

  const handleEditSelectedTemplate = () => {
    if (!selectedTemplate) return;
    setEditingTemplate(selectedTemplate);
    setShowTemplateModal(false);
    setShowCreateModal(true);
  };

  const handleDeleteSelectedTemplate = () => {
    if (!selectedTemplate) return;
    handleDeleteTemplate(selectedTemplate);
  };

  const handleTemplateSaved = () => {
    setSelectedTemplate(null);
    setEditingTemplate(null);
    setShowCreateModal(false);
    setShowTemplateModal(false);
    loadTemplates();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol size={64} name="list.bullet" color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        No Custom Templates
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        You have {templates.length} default templates.{"\n"}
        Create your own custom workout plan!
      </Text>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.accent }]}
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
    <StandardView style={styles.container} padded={false}>
      <View style={{ flex: 1, padding: 16 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <ThemedText type="title">Templates</ThemedText>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage your workout plans
          </Text>
        </View>

        {/* Templates List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
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
                  <Text
                    style={[styles.sectionTitle, { color: colors.textPrimary }]}
                  >
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
        <IconButton
          icon="plus"
          size={28}
          color="#fff"
          onPress={handleCreateTemplate}
          style={StyleSheet.flatten([
            styles.fab,
            {
              backgroundColor: colors.accent,
              bottom: insets.bottom + 80,
            },
          ])}
        />
      </View>

      {/* Template Action Modal */}
      <Modal
        visible={showTemplateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View style={styles.actionOverlay}>
          <TouchableOpacity
            style={styles.actionBackdrop}
            activeOpacity={1}
            onPress={() => setShowTemplateModal(false)}
          />

          <View
            style={[
              styles.actionModal,
              {
                backgroundColor: colors.surface1,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Close button */}
            <TouchableOpacity
              style={styles.actionCloseButton}
              onPress={() => setShowTemplateModal(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol size={22} name="xmark" color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
              {selectedTemplate?.name}
            </Text>
            <Text
              style={[styles.actionSubtitle, { color: colors.textSecondary }]}
            >
              {selectedTemplate?.exercises.length ?? 0} exercises
            </Text>

            <ScrollView
              style={[
                styles.exerciseListContainer,
                {
                  backgroundColor: colors.surface2,
                  borderColor: colors.border,
                },
              ]}
              contentContainerStyle={styles.exerciseListContent}
              showsVerticalScrollIndicator
            >
              {(selectedTemplate?.exercises ?? []).map((exercise, index) => (
                <View
                  key={`${exercise.id}-${index}`}
                  style={styles.exerciseRow}
                >
                  <Text
                    style={[styles.exerciseIndex, { color: colors.accent }]}
                  >
                    {index + 1}.
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.exerciseRowText,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {exercise.name}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.actionButtonRow}>
              <PrimaryButton
                title="Edit Template"
                onPress={handleEditSelectedTemplate}
                icon="pencil"
                style={styles.editActionButton}
              />
              {!selectedTemplate?.isDefault && (
                <TouchableOpacity
                  style={[
                    styles.deleteIconButton,
                    {
                      backgroundColor: colors.surface2,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={handleDeleteSelectedTemplate}
                >
                  <IconSymbol
                    size={20}
                    name="trash"
                    color={colors.destructive}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Template Modal */}
      <CreateTemplateModal
        visible={showCreateModal}
        mode={editingTemplate ? "edit" : "create"}
        initialTemplate={editingTemplate}
        onClose={() => {
          setEditingTemplate(null);
          setShowCreateModal(false);
        }}
        onSaved={handleTemplateSaved}
      />
    </StandardView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  actionOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  actionBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  actionModal: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  actionCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  actionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  exerciseListContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 14,
    maxHeight: 180,
  },
  exerciseListContent: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  exerciseIndex: {
    width: 22,
    fontSize: 13,
    fontWeight: "700",
  },
  exerciseRowText: {
    fontSize: 14,
    flex: 1,
  },
  actionButtonRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },
  editActionButton: {
    flex: 3,
    marginBottom: 0,
  },
  deleteIconButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
});
