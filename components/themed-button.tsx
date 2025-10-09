import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { ThemedText } from "./themed-text";

type Props = PressableProps & {
  children?: React.ReactElement | string;
  style?: StyleProp<ViewStyle>;
};

function ThemedButton({ ...props }: Props) {
  const buttonColor = useThemeColor({}, "tint");
  const textColor = useThemeColor(
    {
      light: Colors.dark.text,
      dark: Colors.light.text,
    },
    "text"
  );
  const disabledTextColor = useThemeColor(
    {
      light: Colors.dark.disabled,
      dark: Colors.light.disabled,
    },
    "disabled"
  );

  return (
    <Pressable
      {...props}
      style={[styles.button, { backgroundColor: buttonColor }, props.style]}
      android_ripple={{ color: textColor, foreground: true }}
    >
      <ThemedText
        style={[
          styles.text,
          { color: props.disabled ? disabledTextColor : textColor },
        ]}
      >
        {props.children}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  text: {
    textAlign: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

export { Props, ThemedButton };
