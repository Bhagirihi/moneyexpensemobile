import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { PLANS } from "../config/subscriptionPlans";
import {
  REVENUECAT_ENTITLEMENT_ID,
  REVENUECAT_OFFERING_ID,
  getPackageLookupKey,
  getStoreProductId,
  productIdMatchesPlan,
} from "../config/revenueCat";
import { devLog, devWarn } from "../utils/logger";

const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
const testKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;

let configuredUserId = null;

const EMPTY_PLAN_PRICES = {
  [PLANS.MONTHLY]: null,
  [PLANS.YEARLY]: null,
};

function getApiKey() {
  if (Platform.OS === "ios") {
    return iosKey || (__DEV__ ? testKey : null);
  }
  return androidKey || (__DEV__ ? testKey : null);
}

function getPlatformKey() {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return __DEV__ ? "test" : "ios";
}

function planFromProductId(productId) {
  if (!productId) return PLANS.FREE;

  const platform = getPlatformKey();
  if (productIdMatchesPlan(productId, PLANS.YEARLY, platform)) {
    return PLANS.YEARLY;
  }
  if (productIdMatchesPlan(productId, PLANS.MONTHLY, platform)) {
    return PLANS.MONTHLY;
  }

  const normalized = productId.toLowerCase();
  if (normalized.includes("year") || normalized.includes("annual")) {
    return PLANS.YEARLY;
  }
  if (normalized.includes("month")) return PLANS.MONTHLY;

  return PLANS.FREE;
}

function planFromCustomerInfo(customerInfo) {
  const entitlement =
    customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID];
  if (!entitlement) return PLANS.FREE;
  return planFromProductId(entitlement.productIdentifier);
}

function getOffering(offerings) {
  if (!offerings) return null;
  return (
    offerings.all?.[REVENUECAT_OFFERING_ID] ??
    offerings.current ??
    null
  );
}

function findPackage(offering, planId) {
  if (!offering) return null;

  const lookupKey = getPackageLookupKey(planId);
  const fromLookup = offering.availablePackages?.find(
    (pkg) => pkg.identifier === lookupKey
  );
  if (fromLookup) return fromLookup;

  if (planId === PLANS.YEARLY) {
    return (
      offering.annual ??
      offering.availablePackages?.find((pkg) => pkg.packageType === "ANNUAL")
    );
  }

  return (
    offering.monthly ??
    offering.availablePackages?.find((pkg) => pkg.packageType === "MONTHLY")
  );
}

function formatPrice(pkg) {
  const product = pkg?.product;
  if (!product?.priceString) return null;

  return {
    priceString: product.priceString,
    price: product.price,
    currencyCode: product.currencyCode,
    pricePerMonthString: product.pricePerMonthString || null,
  };
}

function buildPlanPrices(offering) {
  const prices = { ...EMPTY_PLAN_PRICES };

  [PLANS.MONTHLY, PLANS.YEARLY].forEach((planId) => {
    const pkg = findPackage(offering, planId);
    prices[planId] = formatPrice(pkg);
  });

  return prices;
}

export const purchaseService = {
  isConfigured() {
    return Boolean(getApiKey());
  },

  async configure(userId) {
    const apiKey = getApiKey();
    if (!apiKey || !userId) return false;

    if (configuredUserId === userId) return true;

    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey, appUserID: userId });
    configuredUserId = userId;
    devLog("RevenueCat configured for user", userId);
    return true;
  },

  async getOfferings() {
    if (!this.isConfigured()) {
      return { offering: null, planPrices: { ...EMPTY_PLAN_PRICES } };
    }

    const offerings = await Purchases.getOfferings();
    const offering = getOffering(offerings);
    return {
      offering,
      planPrices: buildPlanPrices(offering),
    };
  },

  async getActivePlan() {
    if (!this.isConfigured()) return PLANS.FREE;
    const customerInfo = await Purchases.getCustomerInfo();
    return planFromCustomerInfo(customerInfo);
  },

  async purchasePlan(planId) {
    if (!this.isConfigured()) {
      throw new Error(
        "In-app purchases are not configured. Set RevenueCat API keys for this build."
      );
    }

    const offerings = await Purchases.getOfferings();
    const offering = getOffering(offerings);
    const selectedPackage = findPackage(offering, planId);

    if (!selectedPackage) {
      throw new Error(
        `Subscription package "${getPackageLookupKey(planId)}" not found. Run scripts/setup-revenuecat-trivense.js or configure RevenueCat offerings.`
      );
    }

    const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
    const activePlan = planFromCustomerInfo(customerInfo);

    if (activePlan === PLANS.FREE) {
      throw new Error("Purchase completed but premium entitlement was not granted.");
    }

    return activePlan;
  },

  async restorePurchases() {
    if (!this.isConfigured()) {
      throw new Error(
        "In-app purchases are not configured. Set RevenueCat API keys for this build."
      );
    }

    const customerInfo = await Purchases.restorePurchases();
    return planFromCustomerInfo(customerInfo);
  },

  async syncPurchases() {
    if (!this.isConfigured()) return PLANS.FREE;
    try {
      await Purchases.syncPurchases();
    } catch (error) {
      devWarn("syncPurchases failed:", error?.message);
    }
    return this.getActivePlan();
  },
};
