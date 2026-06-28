export const LEGAL_LINKS = {
  privacyPolicy: "https://trivense.app/privacy",
  termsOfService: "https://trivense.app/terms",
  advertisingPolicy: "https://trivense.app/ads",
  support: "mailto:support@trivense.app",
};

export const STORE_LINKS = {
  website: "https://trivense.app",
  androidPackage: "com.trivense.app",
  playStoreBase:
    "https://play.google.com/store/apps/details?id=com.trivense.app",
};

/** Play Store URL; optional invite code passed via install referrer on Android. */
export function buildPlayStoreUrl(referralCode) {
  const code = (referralCode || "").trim().toUpperCase();
  if (!code) return STORE_LINKS.playStoreBase;
  const referrer = encodeURIComponent(`invite=${code}`);
  return `${STORE_LINKS.playStoreBase}&referrer=${referrer}`;
}

/** Public landing link — opens app if installed, otherwise redirects to Play Store. */
export function buildReferralShareUrl(referralCode) {
  const code = encodeURIComponent((referralCode || "").trim().toUpperCase());
  return `${STORE_LINKS.website}/download?invite=${code}`;
}

export function buildReferralDeepLink(referralCode) {
  const code = encodeURIComponent((referralCode || "").trim().toUpperCase());
  return `trivense://invite/${code}`;
}
