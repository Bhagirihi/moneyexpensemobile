import { PLANS } from "./subscriptionPlans";

/**
 * RevenueCat configuration for Trivense.
 * Provisioned in RevenueCat project: Trivense (proj2d578859)
 */
export const REVENUECAT_PROJECT_ID = "proj2d578859";

export const REVENUECAT_ENTITLEMENT_ID = "premium";

/** RevenueCat offering lookup_key (current offering). */
export const REVENUECAT_OFFERING_ID = "default";

/**
 * Package lookup_keys inside the offering.
 * @see https://www.revenuecat.com/docs/tools/mcp/usage-examples
 */
export const REVENUECAT_PACKAGE_LOOKUP_KEYS = {
  [PLANS.MONTHLY]: "monthly",
  [PLANS.YEARLY]: "annual",
};

/**
 * Store product identifiers — must match App Store Connect / Play Console.
 * Android Play subscriptions use `subscriptionId:basePlanId`.
 */
export const STORE_PRODUCT_IDS = {
  [PLANS.MONTHLY]: {
    ios: "trivense_monthly",
    android: "trivense_monthly:monthly",
    test: "trivense_monthly",
  },
  [PLANS.YEARLY]: {
    ios: "trivense_yearly",
    android: "trivense_yearly:yearly",
    test: "trivense_yearly",
  },
};

export const TRIVENSE_APP = {
  ios: {
    name: "Trivense",
    bundleId: "com.trivense.app",
    revenueCatAppId: "appa88cacf071",
  },
  android: {
    name: "Trivense",
    packageName: "com.trivense.app",
    revenueCatAppId: "appc06abb7240",
  },
  testStore: {
    name: "Test Store",
    revenueCatAppId: "app13783e11c3",
  },
};

export const REVENUECAT_PRODUCTS = [
  {
    plan: PLANS.MONTHLY,
    displayName: "Trivense Premium Monthly",
    storeIdentifier: STORE_PRODUCT_IDS[PLANS.MONTHLY].ios,
    duration: "P1M",
  },
  {
    plan: PLANS.YEARLY,
    displayName: "Trivense Premium Yearly",
    storeIdentifier: STORE_PRODUCT_IDS[PLANS.YEARLY].ios,
    duration: "P1Y",
  },
];

export function getStorePlatform() {
  return "ios"; // default for non-RN contexts
}

export function getStoreProductId(planId, platform) {
  const ids = STORE_PRODUCT_IDS[planId];
  if (!ids) return null;
  return ids[platform] ?? ids.ios ?? null;
}

export function getPackageLookupKey(planId) {
  return REVENUECAT_PACKAGE_LOOKUP_KEYS[planId] ?? null;
}

export function normalizeStoreProductId(productId) {
  if (!productId) return "";
  return String(productId).split(":")[0].toLowerCase();
}

export function productIdMatchesPlan(productId, planId, platform = "ios") {
  const expected = getStoreProductId(planId, platform);
  if (!expected) return false;
  if (productId === expected) return true;

  const normalizedProduct = normalizeStoreProductId(productId);
  const normalizedExpected = normalizeStoreProductId(expected);
  return normalizedProduct === normalizedExpected;
}
