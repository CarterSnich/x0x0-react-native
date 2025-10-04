import { Props, ThemedButton } from "@/components/themed-button";
import { StyleProp, ViewStyle } from "react-native";

const style: StyleProp<ViewStyle> = {
  paddingHorizontal: 20,
  paddingVertical: 20,
  position: "absolute",
  bottom: 16,
  right: 16,
  borderRadius: "50%",
  elevation: 8,
};

function Fab({ ...props }: Props) {
  return <ThemedButton {...props} style={[style, props.style]} />;
}

export { Fab };
