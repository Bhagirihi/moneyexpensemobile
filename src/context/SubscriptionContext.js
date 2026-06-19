import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { subscriptionService } from "../services/subscriptionService";
import { purchaseService } from "../services/purchaseService";
import { FEATURES, PLANS, PLAN_CATALOG } from "../config/subscriptionPlans";
import { devError } from "../utils/logger";

const SubscriptionContext = createContext(null);

const DEFAULT_PLAN_PRICES = {
  [PLANS.MONTHLY]: null,
  [PLANS.YEARLY]: null,
};

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState({
    plan: PLANS.FREE,
    status: "active",
    isPremium: false,
    expiresAt: null,
    startedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [planPrices, setPlanPrices] = useState(DEFAULT_PLAN_PRICES);
  const [offeringsLoading, setOfferingsLoading] = useState(false);

  const refreshOfferings = useCallback(async () => {
    if (!purchaseService.isConfigured()) {
      setPlanPrices(DEFAULT_PLAN_PRICES);
      return;
    }

    try {
      setOfferingsLoading(true);
      const { planPrices: nextPrices } = await purchaseService.getOfferings();
      setPlanPrices(nextPrices);
    } catch (error) {
      devError("refreshOfferings error:", error);
    } finally {
      setOfferingsLoading(false);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscription({
        plan: PLANS.FREE,
        status: "active",
        isPremium: false,
        expiresAt: null,
        startedAt: null,
      });
      setPlanPrices(DEFAULT_PLAN_PRICES);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      await purchaseService.syncPurchases();
      const next = await subscriptionService.getEffectiveSubscription(user.id);
      setSubscription(next);
      await refreshOfferings();
    } catch (error) {
      devError("refreshSubscription error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, refreshOfferings]);

  useEffect(() => {
    if (!user?.id) {
      refreshSubscription();
      return;
    }

    purchaseService.configure(user.id).finally(() => {
      refreshSubscription();
    });
  }, [user?.id, refreshSubscription]);

  const getPlanPriceLabel = useCallback(
    (planId) => {
      const livePrice = planPrices[planId]?.priceString;
      if (livePrice) return livePrice;
      return `₹${PLAN_CATALOG[planId]?.priceInr ?? ""}`;
    },
    [planPrices]
  );

  const getPlanMonthlyPriceLabel = useCallback(
    (planId) => {
      const liveMonthly = planPrices[planId]?.pricePerMonthString;
      if (liveMonthly) return liveMonthly;
      const fallback = PLAN_CATALOG[planId]?.priceMonthlyInr;
      return fallback ? `₹${fallback}` : null;
    },
    [planPrices]
  );

  const purchasePlan = useCallback(
    async (planId) => {
      if (!user?.id) throw new Error("Sign in to subscribe");
      if (planId === PLANS.FREE) {
        throw new Error("Use the app store to manage or cancel your subscription.");
      }

      try {
        setPurchasing(true);
        const purchasedPlan = await purchaseService.purchasePlan(planId);
        const next = await subscriptionService.waitForServerSubscription(
          user.id,
          purchasedPlan
        );
        setSubscription(next);
        return next;
      } finally {
        setPurchasing(false);
      }
    },
    [user?.id]
  );

  const restorePurchases = useCallback(async () => {
    if (!user?.id) throw new Error("Sign in to restore purchases");

    try {
      setRestoring(true);
      const restoredPlan = await purchaseService.restorePurchases();
      const next = await subscriptionService.waitForServerSubscription(
        user.id,
        restoredPlan
      );
      setSubscription(next);
      return next;
    } finally {
      setRestoring(false);
    }
  }, [user?.id]);

  const hasFeature = useCallback(
    (featureKey) => subscriptionService.hasFeature(subscription, featureKey),
    [subscription]
  );

  const canUseAnalyticsPeriod = useCallback(
    (period) => subscriptionService.canUsePeriod(subscription, period),
    [subscription]
  );

  const requireFeature = useCallback(
    (featureKey, navigation, options = {}) => {
      if (hasFeature(featureKey)) return true;
      navigation.navigate("Paywall", {
        feature: featureKey,
        ...options,
      });
      return false;
    },
    [hasFeature]
  );

  const value = useMemo(
    () => ({
      subscription,
      loading,
      purchasing,
      restoring,
      offeringsLoading,
      planPrices,
      getPlanPriceLabel,
      getPlanMonthlyPriceLabel,
      refreshSubscription,
      refreshOfferings,
      purchasePlan,
      restorePurchases,
      hasFeature,
      canUseAnalyticsPeriod,
      requireFeature,
      isPremium: subscription.isPremium,
      plan: subscription.plan,
      limits: subscriptionService.getLimits(subscription),
      purchasesConfigured: purchaseService.isConfigured(),
      FEATURES,
      PLANS,
    }),
    [
      subscription,
      loading,
      purchasing,
      restoring,
      offeringsLoading,
      planPrices,
      getPlanPriceLabel,
      getPlanMonthlyPriceLabel,
      refreshSubscription,
      refreshOfferings,
      purchasePlan,
      restorePurchases,
      hasFeature,
      canUseAnalyticsPeriod,
      requireFeature,
    ]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
};
