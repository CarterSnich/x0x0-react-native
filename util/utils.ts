import * as Clipboard from "expo-clipboard";
import { ToastAndroid } from "react-native";

async function copyToClipboard(toastMessage: string, text?: string) {
  if (text === undefined || !text) {
    ToastAndroid.show("Nothing to copy.", ToastAndroid.SHORT);
    return;
  }
  await Clipboard.setStringAsync(text);
  ToastAndroid.show(toastMessage, ToastAndroid.SHORT);
}

function formatDate(date: Date) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export { copyToClipboard, formatDate };
