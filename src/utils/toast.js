import Toast from "react-native-toast-message";

export const showToast = {
  success: (message, description = "") => {
    Toast.show({
      type: "success",
      text1: message,
      text2: description,
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
    });
  },
  error: (message, description = "") => {
    Toast.show({
      type: "error",
      text1: message,
      text2: description,
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
    });
  },
  info: (message, description = "") => {
    Toast.show({
      type: "info",
      text1: message,
      text2: description,
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
    });
  },
};
