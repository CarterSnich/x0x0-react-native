import { StyleSheet, ToastAndroid, View } from "react-native";

import { ThemedFlatList } from "@/components/flatlist";
import ThemedBase from "@/components/themed-base";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { useModal } from "@/contexts/modal-context";
import { upload } from "@/util/endpoint-service";
import { File } from "@/util/file";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { DocumentPickerAsset, getDocumentAsync } from "expo-document-picker";
import { useFocusEffect, useRouter } from "expo-router";
import prettyBytes from "pretty-bytes";
import { useCallback, useState } from "react";

function IndexScreen() {
  const { openModal, closeModal } = useModal();

  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);

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
      openModal({
        title: "Loading files failed",
        content: <ThemedText>Loading files error: {e}.</ThemedText>,
      });
    }
  }

  const uploadFile = async (pickedFile: DocumentPickerAsset) => {
    const formData = new FormData();
    const formFile: any = {
      uri: pickedFile.uri,
      type: pickedFile.mimeType,
      name: pickedFile.name,
    };

    formData.append("file", formFile);

    try {
      const fileName = pickedFile.name;
      const fileType = pickedFile.mimeType ?? "*/*";
      const fileSize = pickedFile.size ?? 0;
      const fileURI = pickedFile.uri;

      ToastAndroid.show(`Uploading ${fileName}.`, ToastAndroid.SHORT);
      const { url, token, expires } = await upload(fileName, fileType, fileURI);
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
      console.error("File upload error:", e);

      openModal({
        title: "File upload error",
        content: <ThemedText>File upload failed: {e}.</ThemedText>,
      });
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
        openModal({
          title: "File picker",
          content: (
            <ThemedText>
              File seems to be corrupted or something else went wrong.
            </ThemedText>
          ),
        });
        return;
      }

      if (!resultFile.size) {
        openModal({
          title: "File picker",
          content: <ThemedText>Empty file.</ThemedText>,
        });
        return;
      }

      if (resultFile.size > 536870912) {
        openModal({
          title: "File size",
          content: <ThemedText>File size must not exceed 512 MiB.</ThemedText>,
        });
        return;
      }

      openModal({
        title: "File upload",
        content: (
          <View>
            <ThemedText>File: {resultFile.name}</ThemedText>
            <ThemedText>Size: {prettyBytes(resultFile.size)}</ThemedText>
            <ThemedText>Type: {resultFile.mimeType}</ThemedText>
          </View>
        ),
        buttons: [
          {
            label: "UPLOAD",
            action: async () => {
              closeModal();
              uploadFile(resultFile);
            },
          },
          {
            label: "CANCEL",
            action: closeModal,
          },
        ],
      });
    } catch (e: any) {
      console.error("Error picking document:", e);
      openModal({
        title: "File picker",
        content: <ThemedText>Error picking document: {e}.</ThemedText>,
      });
    }
  };

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

  modalBackdrop: {
    flex: 1,
    backgroundColor: "#000000cb",
    justifyContent: "center",
    alignItems: "center",
  },
  modalDialog: {
    width: "90%",
    padding: 16,
    borderRadius: 8,
    gap: 24,
  },
  modalTitle: {
    fontSize: 24,
  },
  modalBody: {},
  modalButtons: {
    flexDirection: "row-reverse",
    gap: 16,
  },
});

export default IndexScreen;
