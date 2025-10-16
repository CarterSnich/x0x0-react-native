import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { File } from "@/util/file";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { ThemedSeparator } from "./separator";
import { ThemedText } from "./themed-text";

type Props = {
  data: File[];
  onItemPress?: (item: File, index: number) => void;
};

function ThemedFlatList({ data, onItemPress }: Props) {
  const rippleColor = useThemeColor(
    { light: Colors.dark.background, dark: Colors.light.background },
    "background"
  );

  return (
    <FlatList
      data={data}
      renderItem={({ item, index }) => (
        <Pressable
          key={index}
          style={styles.item}
          android_ripple={{ color: rippleColor, foreground: true }}
          onPress={() => onItemPress?.(item, index)}
        >
          <ThemedText>{item.name}</ThemedText>
        </Pressable>
      )}
      ItemSeparatorComponent={() => (
        <View style={styles.separator}>
          <ThemedSeparator />
        </View>
      )}
      style={styles.flatlist}
    />
  );
}

const styles = StyleSheet.create({
  flatlist: {
    flex: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  separator: {
    paddingHorizontal: 8,
  },
});

export { ThemedFlatList };
