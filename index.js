import * as Sentry from "@sentry/react-native";
import { registerRootComponent } from "expo";
import App from "./App";

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    enabled: !__DEV__,
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
  });
}

registerRootComponent(sentryDsn ? Sentry.wrap(App) : App);
