import { Switch } from "@/components/switch";
import { StyleSheet, SwitchProps, View } from "react-native";
import { ThemedText } from "./themed-text";

type Props = SwitchProps & {
  label: string;
};

function LabeledSwitch({ ...props }: Props) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{props.label}</ThemedText>
      <Switch {...props} style={[styles.switch, props.style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {},
  switch: {
    height: "50%",
  },
});

export { LabeledSwitch };
