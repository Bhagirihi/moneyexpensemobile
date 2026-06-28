import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSubscription } from "./SubscriptionContext";
import { getAdVisibilityState, isAdMobAvailable } from "../services/adService";

const defaultState = {
  showBannerAds: false,
  showInterstitialAds: false,
  showAppOpenAds: false,
  inGracePeriod: false,
  rewardedAdFreeUntil: null,
  loading: true,
};

const AdPolicyContext = createContext({
  ...defaultState,
  refreshAdPolicy: async () => {},
});

export function AdPolicyProvider({ children }) {
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const [policy, setPolicy] = useState(defaultState);

  const refreshAdPolicy = useCallback(async () => {
    if (subscriptionLoading) return;

    if (isPremium || !isAdMobAvailable()) {
      setPolicy({ ...defaultState, loading: false });
      return;
    }

    const visibility = await getAdVisibilityState(isPremium);
    setPolicy({ ...visibility, loading: false });
  }, [isPremium, subscriptionLoading]);

  useEffect(() => {
    refreshAdPolicy();
  }, [refreshAdPolicy]);

  const value = useMemo(
    () => ({
      ...policy,
      refreshAdPolicy,
    }),
    [policy, refreshAdPolicy],
  );

  return (
    <AdPolicyContext.Provider value={value}>{children}</AdPolicyContext.Provider>
  );
}

export function useAdPolicy() {
  return useContext(AdPolicyContext);
}
