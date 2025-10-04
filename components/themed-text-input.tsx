import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, TextInput, TextInputProps, TextStyle } from "react-native";

function ThemedTextInput({ ...props }: TextInputProps) {
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "placeholder");

  const style: TextStyle = {
    color: textColor,
    borderBottomColor: textColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
  };

  return (
    <TextInput
      placeholderTextColor={props.placeholderTextColor ?? placeholderColor}
      {...props}
      style={[style, props.style]}
    />
  );
}

export { ThemedTextInput };
