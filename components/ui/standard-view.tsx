import { ThemedView, ThemedViewProps } from "@/components/themed-view";

type StandardViewProps = ThemedViewProps;

const DEFAULT_HORIZONTAL_PADDING = 16;

export function StandardView({ style, ...otherProps }: StandardViewProps) {
  return (
    <ThemedView
      style={[
        {
          paddingHorizontal: DEFAULT_HORIZONTAL_PADDING,
          paddingVertical: DEFAULT_HORIZONTAL_PADDING,
        },
        style,
      ]}
      {...otherProps}
    />
  );
}
