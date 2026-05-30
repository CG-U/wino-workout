import { ThemedView, ThemedViewProps } from "@/components/themed-view";

type StandardViewProps = ThemedViewProps & {
  padded?: boolean;
};

const DEFAULT_HORIZONTAL_PADDING = 16;

export function StandardView({
  style,
  padded = true,
  ...otherProps
}: StandardViewProps) {
  return (
    <ThemedView
      style={[
        padded && {
          paddingHorizontal: DEFAULT_HORIZONTAL_PADDING,
          paddingVertical: DEFAULT_HORIZONTAL_PADDING,
        },
        style,
      ]}
      {...otherProps}
    />
  );
}
