import { Props, ThemedButton } from "@/components/themed-button";
import { StyleProp, ViewStyle } from "react-native";

const style: StyleProp<ViewStyle> = {
  position: "absolute",
  bottom: 24,
  right: 24,
  height: 76,
  aspectRatio: 1,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "50%",
  elevation: 8,
};

function Fab({ ...props }: Props) {
  return <ThemedButton {...props} style={[style, props.style]} />;
}

export { Fab };
