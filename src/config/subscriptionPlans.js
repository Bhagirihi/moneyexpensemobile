export { REVENUECAT_ENTITLEMENT_ID, STORE_PRODUCT_IDS } from "./revenueCat";

export const PLANS = {
  FREE: "free",
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

export const FEATURES = {
  UNLIMITED_BOARDS: "unlimited_boards",
  BOARD_SHARING: "board_sharing",
  BOARD_SETTLEMENTS: "board_settlements",
  EXPORT_DATA: "export_data",
  GOOGLE_DRIVE_BACKUP: "google_drive_backup",
  ADVANCED_ANALYTICS: "advanced_analytics",
  UNLIMITED_CATEGORIES: "unlimited_categories",
  CLOUD_BACKUP: "cloud_backup",
  PRIORITY_SUPPORT: "priority_support",
};

export const PLAN_CATALOG = {
  [PLANS.FREE]: {
    id: PLANS.FREE,
    nameKey: "planFree",
    priceInr: 0,
    priceMonthlyInr: 0,
    billingKey: "planFreeBilling",
    badgeKey: null,
    highlight: false,
  },
  [PLANS.MONTHLY]: {
    id: PLANS.MONTHLY,
    nameKey: "planMonthly",
    priceInr: 299,
    priceMonthlyInr: 299,
    billingKey: "planMonthlyBilling",
    badgeKey: "planPopular",
    highlight: true,
  },
  [PLANS.YEARLY]: {
    id: PLANS.YEARLY,
    nameKey: "planYearly",
    priceInr: 2499,
    priceMonthlyInr: 208,
    billingKey: "planYearlyBilling",
    badgeKey: "planBestValue",
    highlight: false,
  },
};

export const PLAN_LIMITS = {
  [PLANS.FREE]: {
    maxBoards: 1,
    maxSharedBoards: 0,
    maxCustomCategories: 3,
    analyticsPeriods: ["week"],
    features: {
      [FEATURES.UNLIMITED_BOARDS]: false,
      [FEATURES.BOARD_SHARING]: false,
      [FEATURES.BOARD_SETTLEMENTS]: false,
      [FEATURES.EXPORT_DATA]: false,
      [FEATURES.GOOGLE_DRIVE_BACKUP]: false,
      [FEATURES.ADVANCED_ANALYTICS]: false,
      [FEATURES.UNLIMITED_CATEGORIES]: false,
      [FEATURES.CLOUD_BACKUP]: false,
      [FEATURES.PRIORITY_SUPPORT]: false,
    },
  },
  [PLANS.MONTHLY]: {
    maxBoards: null,
    maxSharedBoards: null,
    maxCustomCategories: null,
    analyticsPeriods: ["week", "month", "year", "all"],
    features: {
      [FEATURES.UNLIMITED_BOARDS]: true,
      [FEATURES.BOARD_SHARING]: true,
      [FEATURES.BOARD_SETTLEMENTS]: true,
      [FEATURES.EXPORT_DATA]: true,
      [FEATURES.GOOGLE_DRIVE_BACKUP]: true,
      [FEATURES.ADVANCED_ANALYTICS]: true,
      [FEATURES.UNLIMITED_CATEGORIES]: true,
      [FEATURES.CLOUD_BACKUP]: true,
      [FEATURES.PRIORITY_SUPPORT]: true,
    },
  },
  [PLANS.YEARLY]: {
    maxBoards: null,
    maxSharedBoards: null,
    maxCustomCategories: null,
    analyticsPeriods: ["week", "month", "year", "all"],
    features: {
      [FEATURES.UNLIMITED_BOARDS]: true,
      [FEATURES.BOARD_SHARING]: true,
      [FEATURES.BOARD_SETTLEMENTS]: true,
      [FEATURES.EXPORT_DATA]: true,
      [FEATURES.GOOGLE_DRIVE_BACKUP]: true,
      [FEATURES.ADVANCED_ANALYTICS]: true,
      [FEATURES.UNLIMITED_CATEGORIES]: true,
      [FEATURES.CLOUD_BACKUP]: true,
      [FEATURES.PRIORITY_SUPPORT]: true,
    },
  },
};

export const PAYWALL_FEATURE_LIST = [
  {
    feature: FEATURES.UNLIMITED_BOARDS,
    icon: "view-grid-plus",
    titleKey: "featureUnlimitedBoards",
    descKey: "featureUnlimitedBoardsDesc",
    benefitKey: "featureUnlimitedBoardsBenefit",
  },
  {
    feature: FEATURES.BOARD_SHARING,
    icon: "account-group",
    titleKey: "featureBoardSharing",
    descKey: "featureBoardSharingDesc",
    benefitKey: "featureBoardSharingBenefit",
  },
  {
    feature: FEATURES.BOARD_SETTLEMENTS,
    icon: "scale-balance",
    titleKey: "featureBoardSettlements",
    descKey: "featureBoardSettlementsDesc",
    benefitKey: "featureBoardSettlementsBenefit",
  },
  {
    feature: FEATURES.EXPORT_DATA,
    icon: "file-export",
    titleKey: "featureExportData",
    descKey: "featureExportDataDesc",
    benefitKey: "featureExportDataBenefit",
  },
  {
    feature: FEATURES.GOOGLE_DRIVE_BACKUP,
    icon: "google-drive",
    titleKey: "featureGoogleDrive",
    descKey: "featureGoogleDriveDesc",
    benefitKey: "featureGoogleDriveBenefit",
  },
  {
    feature: FEATURES.ADVANCED_ANALYTICS,
    icon: "chart-line",
    titleKey: "featureAdvancedAnalytics",
    descKey: "featureAdvancedAnalyticsDesc",
    benefitKey: "featureAdvancedAnalyticsBenefit",
  },
  {
    feature: FEATURES.UNLIMITED_CATEGORIES,
    icon: "tag-multiple",
    titleKey: "featureUnlimitedCategories",
    descKey: "featureUnlimitedCategoriesDesc",
    benefitKey: "featureUnlimitedCategoriesBenefit",
  },
];

export function getFeatureLockInfo(featureKey) {
  return PAYWALL_FEATURE_LIST.find((item) => item.feature === featureKey) || null;
}

export function getPlanLimits(planId) {
  return PLAN_LIMITS[planId] || PLAN_LIMITS[PLANS.FREE];
}

export function isPremiumPlan(planId) {
  return planId === PLANS.MONTHLY || planId === PLANS.YEARLY;
}

export function hasFeatureAccess(planId, featureKey) {
  const limits = getPlanLimits(planId);
  return Boolean(limits.features?.[featureKey]);
}

export function canUseAnalyticsPeriod(planId, period) {
  const limits = getPlanLimits(planId);
  return limits.analyticsPeriods.includes(period);
}
