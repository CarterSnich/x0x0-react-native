import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, useColorScheme, View, ViewStyle } from "react-native";

function ThemedSeparator({ vertical = false }) {
  const colorScheme = useColorScheme();
  const color = useThemeColor({}, "divider");

  const style: ViewStyle = {
    ...(vertical ? styles.vertical : styles.horizontal),
    backgroundColor: color,
  };

  return <View style={style} />;
}

const styles = StyleSheet.create({
  vertical: {
    height: "100%",
    width: StyleSheet.hairlineWidth,
  },
  horizontal: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
});

export { ThemedSeparator };
