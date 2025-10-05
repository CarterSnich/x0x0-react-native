import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { applicationName } from "expo-application";

import { AlertProvider } from "@/contexts/alert-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const headerTitle = applicationName ?? "";

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AlertProvider>
        <Stack
          screenOptions={{
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: headerTitle,
            }}
          />
        </Stack>
      </AlertProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
