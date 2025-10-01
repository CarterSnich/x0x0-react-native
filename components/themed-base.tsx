import React from "react";
import { StyleProp, ViewProps, ViewStyle } from "react-native";
import { ThemedView } from "./themed-view";

const style: StyleProp<ViewStyle> = {
  flex: 1,
};

export default function ThemedBase({ ...props }: ViewProps) {
  return <ThemedView {...props} style={[style, props.style]} />;
}
