import { StyleSheet, View } from "react-native";

import { Fab } from "@/components/fab";
import { ThemedFlatList } from "@/components/flatlist";
import { LabeledSwitch } from "@/components/labeled-switch";
import { Modal } from "@/components/modal";
import ThemedBase from "@/components/themed-base";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { useAlert } from "@/contexts/alert-context";
import { createUploadTask, handleUploadTask } from "@/util/endpoint-service";
import { File } from "@/util/file";
import { copyToClipboard, formatDate } from "@/util/utils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { DocumentPickerAsset, getDocumentAsync } from "expo-document-picker";
import { UploadTask } from "expo-file-system/legacy";
import { useFocusEffect, useRouter } from "expo-router";
import prettyBytes from "pretty-bytes";
import { useCallback, useEffect, useState } from "react";
import RNBlobUtil from "react-native-blob-util";

function IndexScreen() {
  const { alertShow } = useAlert();

  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);

  const [uploadTask, setUploadTask] = useState<UploadTask>();
  const [progressPercentage, setProgressPercentege] = useState(0);

  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();

  const [pickedFile, setPickedFile] = useState<DocumentPickerAsset>();
  const [isSecret, setIsSecret] = useState(false);
  const [retention, setRetention] = useState<number>();

  async function getFiles() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const values = await AsyncStorage.multiGet(keys);
      const retrievedFiles = values.map((v) => {
        if (v[1]) {
          return JSON.parse(v[1]);
        }
      });

      setFiles(retrievedFiles);
    } catch (e: any) {
      console.error("Loading files failed:", e);
      alertShow({
        title: "Loading files failed",
        message: `Loading files error: ${e}.`,
      });
    }
  }

  function resetFileUpload() {
    setUploadTask(undefined);
    setProgressPercentege(0);

    setPickedFile(undefined);
    setShowFileUploadDialog(false);

    setRetention(undefined);
    setIsSecret(false);
  }

  async function uploadFile() {
    if (!pickedFile) {
      alertShow({
        title: "File upload",
        message: "No file selected.",
      });
      return;
    }

    try {
      const task = createUploadTask(
        pickedFile.uri,
        isSecret,
        retention,
        ({ totalBytesSent: sent, totalBytesExpectedToSend: total }) => {
          const percent = Math.round((sent / total) * 100);
          setProgressPercentege((_) => percent);
        }
      );

      setUploadTask((_) => task);
      const { url, token, expires } = handleUploadTask(
        await task.uploadAsync()
      );

      if (!token.length) {
        alertShow({
          title: "File upload",
          message: `File already exists. ${url}`,
        });
        return;
      }

      const id = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.MD5,
        pickedFile.name
      );

      const file: File = {
        id: id,
        name: pickedFile.name,
        size: pickedFile.size ?? 0,
        mimeType: pickedFile.mimeType ?? "*/*",
        uri: pickedFile.uri,
        url: url,
        token: token,
        expires: expires,
      };

      await AsyncStorage.setItem(id, JSON.stringify(file));
      setFiles([...files, file]);

      alertShow({
        title: "File upload",
        message: `${pickedFile.name} uploaded successfully.`,
      });
    } catch (e: any) {
      console.error("File upload error", e);
      alertShow({
        title: "File upload error",
        message: `${e}`,
      });
    } finally {
      resetFileUpload();
    }
  }

  async function onUploadButtonPress() {
    try {
      let result = await getDocumentAsync({
        multiple: false,
        type: "*/*",
      });

      if (result.canceled) {
        return;
      }

      if (result === null || !result.assets) {
        alertShow({
          title: "File picker",
          message: "No file selected. Something went wrong.",
        });
        return;
      }

      const resultFile = result.assets[0];

      if (!resultFile.size) {
        resetFileUpload();
        alertShow({
          title: "File picker",
          message: "Empty file.",
        });
        return;
      }

      // magic number detected
      if (resultFile.size > 536870912) {
        resetFileUpload();
        alertShow({
          title: "File size",
          message: "File size must not exceed 512 MiB.",
        });
        return;
      }

      setPickedFile(resultFile);
      setShowFileUploadDialog(true);
    } catch (e: any) {
      console.error("Error picking document:", e);
      alertShow({
        title: "File picker",
        message: `Error picking document: ${e}.`,
      });
    }
  }

  function onChangeRetention(text: string) {
    if (text === "" || /^[1-9]\d*$/.test(text)) {
      setRetention(Number(text));
    }
  }

  async function downloadFile(file: File) {
    try {
      const blob = RNBlobUtil.config({
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          mime: file.mimeType,
          description: `Downloading ${file.name}`,
          path: `${RNBlobUtil.fs.dirs.DownloadDir}/${file.name}`,
        },
      });
      const result = await blob.fetch("GET", file.url);
      return result.path();
    } catch (e: any) {
      console.error(`Failed to download: ${file.name}`, e);
      alertShow({
        title: "File download",
        message: `Failed to download: ${file.name}`,
      });
    }
  }

  const modalActions = [
    {
      label: "Upload",
      action: async () => {
        setShowFileUploadDialog(false);
        uploadFile();
      },
    },
    {
      label: "Cancel",
      action: () => setShowFileUploadDialog(false),
    },
  ];

  useEffect(() => {}, []);

  useFocusEffect(
    useCallback(() => {
      getFiles();
      return () => {};
    }, [])
  );

  return (
    <ThemedBase style={styles.container}>
      <ThemedFlatList
        data={files}
        onItemPress={(item) => {
          setSelectedFile(item);
        }}
      />
      <Fab onPress={onUploadButtonPress}>
        <MaterialIcons name="cloud-upload" size={24} />
      </Fab>

      <Modal
        visible={showFileUploadDialog}
        title="File upload"
        actions={modalActions}
      >
        <View style={styles.fileUploadDialog}>
          <View style={styles.fileProperties}>
            <ThemedText style={styles.optionsTitle}>File properties</ThemedText>
            <View style={styles.filePropRow}>
              <ThemedText style={styles.filePropLabel}>File: </ThemedText>
              <ThemedText style={styles.filePropValue}>
                {pickedFile?.name}
              </ThemedText>
            </View>
            <View style={styles.filePropRow}>
              <ThemedText style={styles.filePropLabel}>Size: </ThemedText>
              <ThemedText style={styles.filePropValue}>
                {prettyBytes(pickedFile?.size ?? 0)}
              </ThemedText>
            </View>
            <View style={styles.filePropRow}>
              <ThemedText style={styles.filePropLabel}>Type: </ThemedText>
              <ThemedText style={styles.filePropValue}>
                {pickedFile?.mimeType}
              </ThemedText>
            </View>
          </View>

          <View style={styles.options}>
            <ThemedText style={styles.optionsTitle}>Options</ThemedText>
            <LabeledSwitch
              label="Secret?"
              value={isSecret}
              onValueChange={setIsSecret}
            />
            <View style={styles.optionsRow}>
              <ThemedText>Retention (hours)</ThemedText>
              <ThemedTextInput
                style={styles.optionsRetention}
                keyboardType="numeric"
                value={retention?.toString()}
                onChangeText={onChangeRetention}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={uploadTask !== undefined}
        title="File upload"
        actions={[
          {
            label: "Cancel",
            action: async () => {
              if (uploadTask !== undefined) {
                await uploadTask.cancelAsync();
              }
            },
          },
        ]}
      >
        <ThemedText>Uploading {progressPercentage}%</ThemedText>
      </Modal>

      {/* File options */}
      <Modal
        title={selectedFile?.name}
        visible={selectedFile !== undefined}
        actions={[
          {
            label: "Download",
            action: async () => {
              if (selectedFile) {
                const path = await downloadFile(selectedFile);
                setSelectedFile(undefined);
                alertShow({
                  title: "File download",
                  message: `File downloaded to: ${path}`,
                });
              }
            },
          },
          {
            label: "Close",
            action() {
              setSelectedFile(undefined);
            },
          },
        ]}
      >
        <View style={styles.fileProperties}>
          <View style={styles.filePropRow}>
            <ThemedText style={styles.filePropLabel}>Size </ThemedText>
            <ThemedText style={styles.filePropValue}>
              {prettyBytes(selectedFile?.size ?? 0)}
            </ThemedText>
          </View>
          <View style={styles.filePropRow}>
            <ThemedText style={styles.filePropLabel}>Type </ThemedText>
            <ThemedText style={styles.filePropValue}>
              {selectedFile?.mimeType}
            </ThemedText>
          </View>
          <View style={styles.filePropRow}>
            <ThemedText style={styles.filePropLabel}>URL </ThemedText>
            <ThemedText
              type="link"
              style={styles.filePropValue}
              onPress={() =>
                copyToClipboard("URL copied to clipboard.", selectedFile?.url)
              }
            >
              {selectedFile?.url}
            </ThemedText>
          </View>
          <View style={styles.filePropRow}>
            <ThemedText style={styles.filePropLabel}>Token </ThemedText>
            <ThemedText
              type="link"
              style={styles.filePropValue}
              onPress={() =>
                copyToClipboard(
                  "Token copied to clipboard.",
                  selectedFile?.token
                )
              }
            >
              {selectedFile?.token}
            </ThemedText>
          </View>
          <View style={styles.filePropRow}>
            <ThemedText style={styles.filePropLabel}>Expires on </ThemedText>
            <ThemedText style={styles.filePropValue}>
              {formatDate(new Date(Number(selectedFile?.expires)))}
            </ThemedText>
          </View>
        </View>
      </Modal>
    </ThemedBase>
  );
}

const styles = StyleSheet.create({
  container: {},

  fileUploadDialog: {
    gap: 16,
  },

  fileProperties: {
    gap: 4,
  },
  filePropRow: { flexDirection: "row", gap: 4 },
  filePropLabel: {
    width: 80,
  },
  filePropValue: {
    flexShrink: 1,
  },

  options: {},
  optionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionsRetention: {
    width: 50,
    textAlign: "center",
  },
});

export default IndexScreen;
