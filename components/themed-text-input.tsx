import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, TextInput, TextInputProps, TextStyle } from "react-native";

function ThemedTextInput({ ...props }: TextInputProps) {
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "placeholder");

  const style: TextStyle = {
    color: textColor,
    borderBottomColor: "white",
    borderBottomWidth: StyleSheet.hairlineWidth,
    margin: 8,
  };

  return (
    <TextInput
      {...props}
      placeholderTextColor={props.placeholderTextColor ?? placeholderColor}
      style={[style, props.style]}
    />
  );
}

export { ThemedTextInput };
