import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
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
      style={[buttonStyle, { backgroundColor: buttonColor }, props.style]}
      android_ripple={{ color: textColor }}
    >
      <ThemedText
        style={{
          color: props.disabled ? disabledTextColor : textColor,
          textAlign: "center",
        }}
      >
        {props.children}
      </ThemedText>
    </Pressable>
  );
}

const buttonStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 8,
};

export { ThemedButton };
