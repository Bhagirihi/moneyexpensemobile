export const ANDROID_PACKAGE = "com.trivense.app";

export const PLAY_STORE_BASE =
  "https://play.google.com/store/apps/details?id=com.trivense.app";

export function buildPlayStoreUrl(referralCode?: string | null) {
  const code = referralCode?.trim().toUpperCase();
  if (!code) return PLAY_STORE_BASE;
  const referrer = encodeURIComponent(`invite=${code}`);
  return `${PLAY_STORE_BASE}&referrer=${referrer}`;
}

/** Android: try native app first, fall back to Play Store with referral. */
export function buildAndroidAppIntentUrl(referralCode: string) {
  const code = encodeURIComponent(referralCode.trim().toUpperCase());
  const fallback = encodeURIComponent(buildPlayStoreUrl(referralCode));
  return `intent://invite/${code}#Intent;scheme=trivense;package=${ANDROID_PACKAGE};S.browser_fallback_url=${fallback};end`;
}

export function buildReferralDownloadUrl(referralCode: string) {
  const code = encodeURIComponent(referralCode.trim().toUpperCase());
  return `https://trivense.app/download?invite=${code}`;
}
