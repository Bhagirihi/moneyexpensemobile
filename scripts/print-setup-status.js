#!/usr/bin/env node
/**
 * Print Trivense external-service setup status and next steps.
 * Run: node scripts/print-setup-status.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const checks = [
  {
    name: "RevenueCat — Trivense project",
    ok: true,
    detail: "proj2d578859 · entitlement premium · offering default · webhook → Supabase",
    url: "https://app.revenuecat.com/projects/proj2d578859",
  },
  {
    name: "RevenueCat — iOS SDK key",
    ok: true,
    detail: "appl_zAcnKrQHwmEZBckJSWcHFTTTywd (add to .env)",
  },
  {
    name: "RevenueCat — Android SDK key",
    ok: true,
    detail: "goog_yEuXEgHvGCpioYQwECAhRiQAhFM (add to .env)",
  },
  {
    name: "RevenueCat — Test Store key",
    ok: true,
    detail: "test_IGvFDXFXmmGKdvrwdPuGhNfuIIy (dev builds)",
  },
  {
    name: "Firebase — trivense-app-prod",
    ok: fs.existsSync(path.join(ROOT, "firebase/google-services.json")),
    detail: "Android + iOS apps registered · com.trivense.app",
    url: "https://console.firebase.google.com/project/trivense-app-prod/overview",
  },
  {
    name: "Firebase — google-services.json",
    ok: fs.existsSync(path.join(ROOT, "firebase/google-services.json")),
    detail: "firebase/google-services.json",
  },
  {
    name: "Firebase — GoogleService-Info.plist",
    ok: fs.existsSync(path.join(ROOT, "firebase/GoogleService-Info.plist")),
    detail: "firebase/GoogleService-Info.plist",
  },
  {
    name: "Sentry — DSN in .env",
    ok: false,
    detail: "Create project at sentry.io → copy DSN to EXPO_PUBLIC_SENTRY_DSN",
    url: "https://sentry.io/organizations/new/",
    manual: true,
  },
  {
    name: "AdMob — app IDs",
    ok: false,
    detail: "admob.google.com → Add app → Link Firebase trivense-app-prod",
    url: "https://admob.google.com/home/",
    manual: true,
  },
  {
    name: "Play Store assets",
    ok: fs.existsSync(path.join(ROOT, "store-assets/play/app_icon_512.png")),
    detail: "store-assets/play/ + store-assets/promo/ (9 banners @ 1024×682)",
  },
  {
    name: "Play Console listing copy",
    ok: fs.existsSync(path.join(ROOT, "store-assets/play/listing.json")),
    detail: "store-assets/play/listing.json — paste into Play Console",
    url: "https://play.google.com/console/u/3/developers/5766759369200444867/app/4976093803059142709/app-dashboard",
    manual: true,
  },
  {
    name: "Play Console subscriptions",
    ok: false,
    detail: "Create trivense_monthly + trivense_yearly (base plans monthly/yearly)",
    manual: true,
  },
  {
    name: "Local .env file",
    ok: fs.existsSync(path.join(ROOT, ".env")),
    detail: "Copy .env.example → .env and fill Supabase + Sentry",
  },
];

console.log("\nTrivense external services status\n" + "─".repeat(50));

for (const c of checks) {
  const icon = c.ok ? "✓" : c.manual ? "○" : "✗";
  console.log(`${icon} ${c.name}`);
  console.log(`  ${c.detail}`);
  if (c.url) console.log(`  ${c.url}`);
}

console.log("\nNext steps (manual — require your login):\n");
console.log("1. Sentry: https://sentry.io → New org 'trivense' → React Native project");
console.log("2. AdMob: https://admob.google.com → Add Trivense → Link Firebase project");
console.log("3. Play Console: Upload assets from store-assets/play/, paste listing.json copy");
console.log("4. Play Console → Monetize → Subscriptions: trivense_monthly, trivense_yearly");
console.log("5. RevenueCat: Link Play service credentials (Settings → Google Play)");
console.log("6. Copy .env.example to .env and add Supabase keys\n");
