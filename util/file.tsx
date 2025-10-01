import { DocumentPickerAsset } from "expo-document-picker";

type File = {
  id: string;
  file: DocumentPickerAsset;
  token?: string;
  expires?: string;
  url?: string;
};

export { File };
