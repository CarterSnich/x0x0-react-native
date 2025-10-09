import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { applicationName } from "expo-application";

import { AlertProvider } from "@/contexts/alert-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";

export default function RootLayout() {
  const router = useRouter();

  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, "text");
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
              headerRight() {
                return (
                  <Pressable
                    style={{ alignSelf: "center" }}
                    onPress={() => router.push("/about")}
                  >
                    <MaterialIcons
                      name="info-outline"
                      color={textColor}
                      size={24}
                    />
                  </Pressable>
                );
              },
            }}
          />
        </Stack>
      </AlertProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
