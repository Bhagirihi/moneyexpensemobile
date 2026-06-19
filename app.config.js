import "dotenv/config";

export default {
  expo: {
    name: "Trivense",
    slug: "Trivense",
    version: "1.0.0",
    scheme: "trivense",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.trivense.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          "Trivense needs camera access to attach receipt photos to expenses.",
        NSPhotoLibraryUsageDescription:
          "Trivense needs photo library access to attach receipt images to expenses.",
        NSPhotoLibraryAddUsageDescription:
          "Trivense can save exported expense files to your photo library.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive_icon.png",
        backgroundColor: "#31356e",
      },
      package: "com.trivense.app",
      versionCode: 1,
      permissions: ["INTERNET"],
    },
    web: {
      favicon: "./assets/icon.png",
    },
    owner: "takeyshi",
    plugins: [
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/Inter_Bold.ttf",
            "./assets/fonts/Inter_Medium.ttf",
            "./assets/fonts/Inter_Regular.ttf",
            "./assets/fonts/Manrope-Bold.ttf",
            "./assets/fonts/Manrope-Medium.ttf",
            "./assets/fonts/Poppins-Bold.ttf",
            "./assets/fonts/Poppins-Medium.ttf",
            "./assets/fonts/Poppins-Light.ttf",
            "./assets/fonts/Poppins-ExtraLight.ttf",
            "./assets/fonts/Poppins-Regular.ttf",
            "./assets/fonts/Poppins-SemiBold.ttf",
            "./assets/fonts/Poppins-Thin.ttf",
            "./assets/fonts/Poppins-ExtraBold.ttf",
          ],
        },
      ],
      "expo-asset",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#31356e",
          image: "./assets/splash_icon.png",
          dark: {
            image: "./assets/splash_icon.png",
            backgroundColor: "#31356e",
          },
          imageWidth: 200,
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#31356e",
        },
      ],
      "@react-native-community/datetimepicker",
      "expo-web-browser",
      ...(process.env.EXPO_PUBLIC_SENTRY_DSN ? ["@sentry/react-native"] : []),
    ],
    extra: {
      eas: {
        projectId: "373dac47-60b0-4de3-8dfc-aea74ec58784",
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};
