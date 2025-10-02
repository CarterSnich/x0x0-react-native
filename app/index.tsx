import { Alert, Modal, StyleSheet, ToastAndroid, View } from "react-native";

import { ThemedFlatList } from "@/components/flatlist";
import ThemedBase from "@/components/themed-base";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
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
  const router = useRouter();
  const navigation = useNavigation();

  const [isUploading, setIsUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pickedFile, setPickedFile] = useState<DocumentPickerAsset>();
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
    } catch (e) {
      console.error(e);
      Alert.alert("Loading files", "Failed to load files.");
    }
  }

  const uploadFile = async () => {
    if (!pickedFile || !pickedFile.file) {
      Alert.alert("Upload error", "No file selected. Something went wrong.");
      return;
    }
    setIsUploading(true);

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

      ToastAndroid.show(`${pickedFile.name} uploaded`, ToastAndroid.SHORT);
    } catch (error) {
      console.error("File upload error:", error);
      Alert.alert("File upload error", `${error}`);
    } finally {
      setIsUploading(false);
      setModalVisible(false);
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
        Alert.alert(
          "File picker",
          "File seems to be  corrupted or something else went wrong."
        );
        return;
      }

      if (!resultFile.size) {
        Alert.alert("File picker", "Empty file.");
        return;
      }

      if (resultFile.size > 536870912) {
        Alert.alert("File picker", "File size must not exceed 512 MiB.");
        return;
      }

      setPickedFile(resultFile);
      setModalVisible(true);
    } catch (error) {
      console.error("Error picking document:", error);
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

      <Modal animationType="slide" visible={modalVisible} transparent>
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalDialog}>
            <ThemedText style={styles.modalTitle}>Upload</ThemedText>
            <View style={styles.modalBody}>
              <ThemedText>File: {pickedFile?.name}</ThemedText>
              <ThemedText>
                Size: {pickedFile?.size && prettyBytes(pickedFile?.size)}
              </ThemedText>
              <ThemedText>Type: {pickedFile?.mimeType}</ThemedText>
            </View>
            <View style={styles.modalButtons}>
              <ThemedButton
                onPress={() => setModalVisible(false)}
                disabled={isUploading}
              >
                Cancel
              </ThemedButton>
              <ThemedButton onPress={uploadFile} disabled={isUploading}>
                {isUploading ? "Uploading" : "Upload"}
              </ThemedButton>
            </View>
          </ThemedView>
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
