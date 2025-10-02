import { File } from "@/util/file";
import { Image } from "expo-image";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { Alert, Share, StyleSheet, ToastAndroid, View } from "react-native";

import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import prettyBytes from "pretty-bytes";

function UploadScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [file, setFile] = useState<File>();

  function onPressDelete() {
    Alert.alert(
      "Delete file",
      `Are you sure you want to delete "${file?.file.name}"?`,
      [
        {
          text: "Confirm",
          onPress: deletFile,
          style: "destructive",
        },
        {
          text: "Cancel",
          isPreferred: true,
        },
      ]
    );
  }

  async function deletFile() {
    if (!file) return;

    const body = new FormData();
    body.append("token", `${file.token}`);
    body.append("delete", "");

    let response = await fetch(`${file.url}`, {
      headers: {
        "User-Agent": "x0x0/0.0.1 (Android;RN Expo)",
      },
      method: "POST",
      body: body,
    });
    let responseData = await response.text();

    if (!response.ok) {
      console.error(`Error ${response.status}: ${responseData}`);
      Alert.alert("Delete file", responseData);
      return;
    }

    await AsyncStorage.removeItem(file.id);
    ToastAndroid.show(`${file.file.name} deleted.`, ToastAndroid.SHORT);
    router.back();
  }

  async function shareFile() {
    try {
      await Share.share({
        message: `${file?.url}`,
        title: "Share URL",
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Sharing failed", `${e}`);
    }
  }

  useEffect(() => {
    (async () => {
      const item = await AsyncStorage.getItem(id);

      if (item) {
        const retrievedFile: File = JSON.parse(item);
        const info = await FileSystem.getInfoAsync(retrievedFile.file.uri);

        if (!info.exists) {
          try {
            await FileSystem.downloadAsync(
              new URL(`${retrievedFile.url}`).href,
              retrievedFile.file.uri
            );
          } catch (e) {
            console.error(e);
            Alert.alert(
              "File retrieve error",
              "Failed to download from remote."
            );
            router.back();
          }
        }

        setFile(retrievedFile);
      } else {
        router.back();
        Alert.alert("View file error", "File doesn't exist.");
      }
    })();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: file?.file.name,
    });
  }, [file]);

  return (
    <View style={styles.container}>
      {/* PREVIEW */}
      <View style={styles.preview}>
        {file && file.file.mimeType?.includes("image") ? (
          <Image
            source={file.file.uri}
            contentFit="contain"
            style={styles.image}
            onError={(event) => Alert.alert("Image", event.error)}
          />
        ) : file?.file.mimeType?.includes("video") ? (
          <FontAwesome5 name="file-video" size={64} color="white" />
        ) : file?.file.mimeType?.includes("pdf") ? (
          <FontAwesome5 name="file-pdf" size={64} color="white" />
        ) : (
          <FontAwesome5 name="file" size={64} color="white" />
        )}
      </View>

      {/* PROPERTIES */}
      <View style={styles.properties}>
        <View style={styles.propertyRow}>
          <ThemedText style={styles.propertyLabel}>File name</ThemedText>
          <ThemedText style={styles.propertyValue}>
            {file?.file.name}
          </ThemedText>
        </View>
        <View style={styles.propertyRow}>
          <ThemedText style={styles.propertyLabel}>URL</ThemedText>
          <ThemedText
            style={styles.propertyValue}
            type="link"
            onPress={async () => {
              await Clipboard.setStringAsync(`${file?.url}`);
              ToastAndroid.show("URL copied to clipboard.", ToastAndroid.SHORT);
            }}
          >
            {file?.url}
          </ThemedText>
        </View>
        <View style={styles.propertyRow}>
          <ThemedText style={styles.propertyLabel}>Type</ThemedText>
          <ThemedText style={styles.propertyValue}>
            {file?.file.mimeType}
          </ThemedText>
        </View>
        <View style={styles.propertyRow}>
          <ThemedText style={styles.propertyLabel}>Size</ThemedText>
          <ThemedText style={styles.propertyValue}>
            {file?.file.size && prettyBytes(file?.file.size)}
          </ThemedText>
        </View>
        <View style={styles.propertyRow}>
          <ThemedText style={styles.propertyLabel}>Token</ThemedText>
          <ThemedText
            style={styles.propertyValue}
            type="link"
            onPress={async () => {
              await Clipboard.setStringAsync(`${file?.token}`);
              ToastAndroid.show(
                "Token copied to clipboard.",
                ToastAndroid.SHORT
              );
            }}
          >
            {file?.token}
          </ThemedText>
        </View>
        <View style={styles.propertyRow}>
          <ThemedText style={styles.propertyLabel}>Expires</ThemedText>
          <ThemedText style={styles.propertyValue}>
            {new Date(Number(file?.expires)).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </ThemedText>
        </View>
        <View style={styles.propertyRow}>
          <ThemedText style={styles.propertyLabel}>URI</ThemedText>
          <ThemedText style={styles.propertyValue}>{file?.file.uri}</ThemedText>
        </View>
      </View>

      {/* BUTTONS */}
      <View style={styles.buttons}>
        <ThemedButton style={styles.button} onPress={onPressDelete}>
          Delete
        </ThemedButton>
        <ThemedButton style={styles.button} onPress={shareFile}>
          Share
        </ThemedButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    flexDirection: "column",
    gap: 16,
  },

  preview: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#202020ff",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },

  properties: {},
  propertyRow: {
    flexDirection: "row",
    gap: 16,
  },
  propertyLabel: {
    width: 100,
  },
  propertyValue: {
    flexShrink: 1,
  },

  buttons: {
    marginTop: "auto",
    flexDirection: "row",
    gap: 16,
  },
  button: {
    flex: 1,
  },
});

export default UploadScreen;
