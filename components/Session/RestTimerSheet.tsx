/**
 * Rest Timer Bottom Sheet
 * Circular countdown timer that appears after completing a set
 */

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const TIMER_PRESETS = [60, 90, 120, 180];

export interface RestTimerSheetRef {
  open: (duration?: number) => void;
  close: () => void;
}

interface RestTimerSheetProps {
  onTimerComplete?: () => void;
}

export const RestTimerSheet = forwardRef<
  RestTimerSheetRef,
  RestTimerSheetProps
>(({ onTimerComplete }, ref) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["45%"], []);

  const [isActive, setIsActive] = useState(false);
  const [totalDuration, setTotalDuration] = useState(90);
  const [remainingTime, setRemainingTime] = useState(90);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = useSharedValue(1);

  // Circle dimensions
  const size = 180;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const startTimer = useCallback(
    (duration: number) => {
      setTotalDuration(duration);
      setRemainingTime(duration);
      setIsActive(true);
      progress.value = 1;
      progress.value = withTiming(0, {
        duration: duration * 1000,
        easing: Easing.linear,
      });
    },
    [progress, circumference],
  );

  const stopTimer = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isActive && remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            stopTimer();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onTimerComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, stopTimer, onTimerComplete]);

  useImperativeHandle(ref, () => ({
    open: (duration = 90) => {
      bottomSheetRef.current?.snapToIndex(0);
      startTimer(duration);
    },
    close: () => {
      stopTimer();
      bottomSheetRef.current?.close();
    },
  }));

  const handleClose = useCallback(() => {
    stopTimer();
  }, [stopTimer]);

  const handleAddTime = (seconds: number) => {
    const newDuration = remainingTime + seconds;
    setRemainingTime(newDuration);
    setTotalDuration((prev) => prev + seconds);
    progress.value = withTiming(newDuration / (totalDuration + seconds), {
      duration: 300,
    });
  };

  const handleSelectPreset = (seconds: number) => {
    stopTimer();
    startTimer(seconds);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface1 }}
      handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Rest Timer
        </Text>

        {/* Circular Timer */}
        <View style={styles.timerContainer}>
          <Svg width={size} height={size} style={styles.svg}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.surface3}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.accent}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              animatedProps={animatedProps}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          <View style={styles.timerTextContainer}>
            <Text style={[styles.timerText, { color: colors.textPrimary }]}>
              {formatTime(remainingTime)}
            </Text>
            {remainingTime === 0 && (
              <Text style={[styles.timerDoneText, { color: colors.success }]}>
                Done!
              </Text>
            )}
          </View>
        </View>

        {/* Preset Buttons */}
        <View style={styles.presetRow}>
          {TIMER_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                {
                  backgroundColor:
                    totalDuration === preset
                      ? colors.accentSubtle
                      : colors.surface2,
                  borderColor:
                    totalDuration === preset ? colors.accent : colors.border,
                },
              ]}
              onPress={() => handleSelectPreset(preset)}
            >
              <Text
                style={[
                  styles.presetText,
                  {
                    color:
                      totalDuration === preset
                        ? colors.accent
                        : colors.textSecondary,
                  },
                ]}
              >
                {formatTime(preset)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Time Button */}
        <TouchableOpacity
          style={[styles.addTimeButton, { backgroundColor: colors.surface2 }]}
          onPress={() => handleAddTime(30)}
        >
          <IconSymbol size={16} name="plus" color={colors.textSecondary} />
          <Text style={[styles.addTimeText, { color: colors.textSecondary }]}>
            +30s
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  timerContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  svg: {
    transform: [{ rotateZ: "0deg" }],
  },
  timerTextContainer: {
    position: "absolute",
    alignItems: "center",
  },
  timerText: {
    fontSize: 42,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  timerDoneText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  presetRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 14,
    fontWeight: "600",
  },
  addTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addTimeText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
