import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { applicationName } from "expo-application";

import { ModalProvider } from "@/contexts/modal-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ModalProvider>
        <Stack
          screenOptions={{
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: applicationName ?? "",
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ModalProvider>
    </ThemeProvider>
  );
}
