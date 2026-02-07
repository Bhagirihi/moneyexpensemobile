import "dotenv/config";

export default {
  expo: {
    name: "Trivense",
    slug: "Trivense",
    version: "1.0.0",
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
        NSAppTransportSecurity: { NSAllowsArbitraryLoads: true },
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
          image: "./assets/splash-icon.png",
          dark: {
            image: "./assets/splash-icon.png",
            backgroundColor: "#31356e",
          },
          imageWidth: 200,
        },
      ],
      "@react-native-community/datetimepicker",
    ],
    extra: {
      eas: {
        projectId: "373dac47-60b0-4de3-8dfc-aea74ec58784",
      },
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};
