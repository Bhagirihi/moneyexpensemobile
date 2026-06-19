import Clipboard from "@react-native-clipboard/clipboard";

export async function copyToClipboard(text) {
  Clipboard.setString(String(text ?? ""));
}
