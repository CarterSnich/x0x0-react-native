import { useThemeColor } from "@/hooks/use-theme-color";
import { Switch as RNSwitch, SwitchProps } from "react-native";

function Switch({ ...props }: SwitchProps) {
  const trackColor = useThemeColor({}, "disabled");
  const thumbColor = useThemeColor({}, "tint");

  return (
    <RNSwitch
      thumbColor={thumbColor}
      trackColor={{
        true: trackColor,
        false: trackColor,
      }}
      {...props}
    />
  );
}

export { Switch };
