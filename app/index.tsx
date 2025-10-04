import { StyleSheet, ToastAndroid, View } from "react-native";

import { ThemedFlatList } from "@/components/flatlist";
import { LabeledSwitch } from "@/components/labeled-switch";
import { Modal } from "@/components/modal";
import ThemedBase from "@/components/themed-base";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { useAlert } from "@/contexts/alert-context";
import { upload } from "@/util/endpoint-service";
import { File } from "@/util/file";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { DocumentPickerAsset, getDocumentAsync } from "expo-document-picker";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import prettyBytes from "pretty-bytes";
import { useCallback, useState } from "react";

function IndexScreen() {
  const { alertShow } = useAlert();

  const router = useRouter();
  const navigation = useNavigation();

  const [files, setFiles] = useState<File[]>([]);

  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false);

  const [pickedFile, setPickedFile] = useState<DocumentPickerAsset>();
  const [isSecret, setIsSecret] = useState(false);
  const [retention, setRetention] = useState("");

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

  function resetFileUploadDialog() {
    setRetention("");
    setIsSecret(false);
    setPickedFile(undefined);
    setShowFileUploadDialog(false);
  }

  const uploadFile = async () => {
    if (!pickedFile) {
      alertShow({
        title: "File picker",
        message: "No file selected.",
      });
      return;
    }

    try {
      const fileName = pickedFile.name;
      const fileType = pickedFile.mimeType ?? "*/*";
      const fileSize = pickedFile.size ?? 0;
      const fileURI = pickedFile.uri;

      ToastAndroid.show(`Uploading ${fileName}.`, ToastAndroid.SHORT);
      const { url, token, expires } = await upload(
        fileName,
        fileType,
        fileURI,
        isSecret,
        retention ? Number(retention) : undefined
      );
      const id = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.MD5,
        pickedFile.name
      );

      const file: File = {
        id: id,
        name: fileName,
        size: fileSize,
        mimeType: fileType,
        uri: fileURI,
        url: url,
        token: token,
        expires: expires,
      };

      await AsyncStorage.setItem(id, JSON.stringify(file));
      setFiles([...files, file]);
      ToastAndroid.show(`${pickedFile.name} uploaded.`, ToastAndroid.SHORT);
    } catch (e: any) {
      console.error(e);
      alertShow({
        title: "File upload error",
        message: e,
      });
    } finally {
      resetFileUploadDialog();
    }
  };

  const onUploadButtonPress = async () => {
    try {
      let result = await getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const resultFile = result.assets[0];

      if (!resultFile) {
        resetFileUploadDialog();
        alertShow({
          title: "File picker",
          message: "File seems to be corrupted or something else went wrong.",
        });
        return;
      }

      if (!resultFile.size) {
        resetFileUploadDialog();
        alertShow({
          title: "File picker",
          message: "Empty file.",
        });
        return;
      }

      if (resultFile.size > 536870912) {
        resetFileUploadDialog();
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
  };

  function onChangeRetention(text: string) {
    if (text === "" || /^[1-9]\d*$/.test(text)) {
      setRetention(text);
    }
  }

  const modalActions = [
    {
      label: "UPLOAD",
      action: async () => {
        setShowFileUploadDialog(false);
        uploadFile();
      },
    },
    {
      label: "CANCEL",
      action: () => setShowFileUploadDialog(false),
    },
  ];

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
        onItemPress={(item) => router.navigate(`/${item.id}`)}
      />
      <ThemedButton style={styles.fab} onPress={onUploadButtonPress}>
        <MaterialIcons name="add" size={24} />
      </ThemedButton>

      <Modal
        visible={showFileUploadDialog}
        title="File upload"
        actions={modalActions}
      >
        <View style={styles.fileUploadDialog}>
          <View style={styles.fileProperties}>
            <ThemedText style={styles.optionsTitle}>File properties</ThemedText>
            <View style={styles.filePropRow}>
              <ThemedText>File: </ThemedText>
              <ThemedText style={styles.filePropValue}>
                {pickedFile?.name}
              </ThemedText>
            </View>
            <View style={styles.filePropRow}>
              <ThemedText>Size: </ThemedText>
              <ThemedText style={styles.filePropValue}>
                {prettyBytes(pickedFile?.size ?? 0)}
              </ThemedText>
            </View>
            <View style={styles.filePropRow}>
              <ThemedText>Type: </ThemedText>
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
                value={retention}
                onChangeText={onChangeRetention}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ThemedBase>
  );
}

const styles = StyleSheet.create({
  container: {},

  fab: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    position: "absolute",
    bottom: 16,
    right: 16,
    borderRadius: "50%",
    elevation: 8,
  },

  fileUploadDialog: {
    gap: 16,
  },

  fileProperties: {
    gap: 4,
  },
  filePropRow: { flexDirection: "row", gap: 4 },
  filePropValue: {
    fontFamily: "monospace",
    backgroundColor: "black",
    padding: 4,
    borderRadius: 4,
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
