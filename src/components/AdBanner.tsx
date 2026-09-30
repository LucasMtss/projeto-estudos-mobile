import { useEffect, useState, type ComponentType } from "react";
import Constants from "expo-constants";
import { adsEnabled, bannerUnitId } from "@/ads/AdService";
import { useEntitlement } from "@/store/entitlement";

type Props = {
  size?: "banner" | "adaptive";
};

export function AdBanner({ size: kind = "adaptive" }: Props) {
  const [Banner, setBanner] = useState<ComponentType<{ unitId: string; size: string }> | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const entitlementReady = useEntitlement((state) => state.ready);
  const adsRemoved = useEntitlement((state) => state.adsRemoved);

  useEffect(() => {
    if (!entitlementReady || adsRemoved || !adsEnabled() || !bannerUnitId()) {
      setBanner(null);
      setSize(null);
      return;
    }
    if (Constants.executionEnvironment === "storeClient") return;
    try {
      const ads = require("react-native-google-mobile-ads") as {
        BannerAd: ComponentType<{ unitId: string; size: string }>;
        BannerAdSize: { BANNER: string; ANCHORED_ADAPTIVE_BANNER: string };
      };
      setBanner(() => ads.BannerAd);
      setSize(kind === "banner" ? ads.BannerAdSize.BANNER : ads.BannerAdSize.ANCHORED_ADAPTIVE_BANNER);
    } catch {
      setBanner(null);
    }
  }, [kind, entitlementReady, adsRemoved]);

  if (!Banner || !size) return null;
  return <Banner unitId={bannerUnitId()} size={size} />;
}
