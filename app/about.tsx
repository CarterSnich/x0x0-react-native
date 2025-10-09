import appIcon from "@/assets/images/icon.png";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import * as Application from "expo-application";
import { Image } from "expo-image";
import * as Linking from "expo-linking"; // or import { Linking } from "react-native"
import { StyleSheet, View } from "react-native";

function AboutScreen() {
  async function openUrl(url: string) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (err) {
      // pass
    }
  }

  return (
    <View style={styles.container}>
      {/* App icon */}
      <Image source={appIcon} style={styles.appIcon} />

      <View style={styles.appAndDev}>
        {/* App name */}
        <ThemedText style={styles.appName}>
          {Application.applicationName} v{Application.nativeApplicationVersion}
        </ThemedText>
        {/* App dev */}
        <ThemedText>by CarterSnich</ThemedText>
      </View>

      {/* Links */}
      <View style={styles.links}>
        <ThemedButton
          style={styles.linksButton}
          onPress={() =>
            openUrl("https://github.com/CarterSnich/x0x0-react-native")
          }
        >
          Source code
        </ThemedButton>
        <ThemedButton
          style={styles.linksButton}
          onPress={() =>
            openUrl("https://github.com/CarterSnich/x0x0-react-native")
          }
        >
          Licenses
        </ThemedButton>
      </View>

      {/* Disclaimer */}
      <ThemedText style={styles.disclaimer}>
        This application is an unofficial client for{" "}
        <ThemedText type="defaultSemiBold">The Null Pointer</ThemedText>{" "}
        temporary file hosting. It is not affiliated with, endorsed by, or
        maintained by the The Null Pointer project or its developers. All files
        and their moderation are entirely handled by The Null Pointer project.
        Neither this app nor its developer has any access to, hosts, or controls
        user uploads in any way.
      </ThemedText>
      <ThemedText style={styles.disclaimer}>
        For more information about the project, including details on uploading
        files, managing your uploads, client software and script notes, FAQs,
        Terms of Service, Privacy Policy, abuse and takedown requests, or
        donating to support The Null Pointer project, please visit{" "}
        <ThemedText type="link">https://0x0.st</ThemedText>.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 64,
    gap: 16,
  },

  appAndDev: {
    alignItems: "center",
  },

  appIcon: {
    height: 120,
    aspectRatio: 1,
  },

  appName: {
    fontSize: 24,
  },

  links: {
    flexDirection: "row",
    gap: 16,
  },
  linksButton: {
    flex: 1,
  },

  disclaimer: {
    textAlign: "justify",
  },
});

export default AboutScreen;
