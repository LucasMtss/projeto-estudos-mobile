import Constants from "expo-constants";
import { useAuth } from "@/store/auth";
import { useEntitlement } from "@/store/entitlement";

const enabled = process.env.EXPO_PUBLIC_ADS_ENABLED === "true";
const bannerId = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID ?? "";
const interstitialId = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? "";
const rewardedId = process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID ?? "";
const expoGo = Constants.executionEnvironment === "storeClient";

type Interstitial = {
  loaded: boolean;
  show: () => Promise<void>;
  load: () => void;
  addAdEventListener: (type: string, listener: () => void) => () => void;
};

type Rewarded = Interstitial;

type AdsModule = {
  default: () => { initialize: () => Promise<unknown> };
  InterstitialAd: { createForAdRequest: (id: string) => Interstitial };
  RewardedAd: { createForAdRequest: (id: string) => Rewarded };
  AdEventType: { LOADED: string; CLOSED: string; ERROR: string };
  RewardedAdEventType: { LOADED: string; EARNED_REWARD: string };
};

let starting: Promise<void> | null = null;
let adsModule: AdsModule | null = null;
let interstitial: Interstitial | null = null;
let rewarded: Rewarded | null = null;

export function adsEnabled(): boolean {
  if (useEntitlement.getState().adsRemoved) return false;
  return enabled && Boolean(bannerId || interstitialId || rewardedId) && !expoGo;
}

export function rewardedAvailable(): boolean {
  return adsEnabled() && Boolean(rewardedId);
}

export function bannerUnitId(): string {
  return bannerId;
}

export function bannerVisible(): boolean {
  return adsEnabled() && Boolean(bannerId);
}

export async function initAds(): Promise<void> {
  if (!adsEnabled()) return;
  if (!starting) starting = loadSdk();
  await starting;
}

async function loadSdk(): Promise<void> {
  try {
    const ads = require("react-native-google-mobile-ads") as AdsModule;
    adsModule = ads;
    await ads.default().initialize();
    if (interstitialId) {
      const created = ads.InterstitialAd.createForAdRequest(interstitialId);
      interstitial = created;
      created.addAdEventListener(ads.AdEventType.CLOSED, () => created.load());
      created.load();
    }
    if (rewardedId) {
      const created = ads.RewardedAd.createForAdRequest(rewardedId);
      rewarded = created;
      created.addAdEventListener(ads.AdEventType.CLOSED, () => created.load());
      created.load();
    }
  } catch {
    interstitial = null;
    rewarded = null;
    adsModule = null;
  }
}

function waitForAuthReady(): Promise<void> {
  if (useAuth.getState().ready) return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve();
    };
    const unsubscribe = useAuth.subscribe((state) => {
      if (state.ready) done();
    });
    if (useAuth.getState().ready) done();
  });
}

export function showPhaseInterstitial(): Promise<void> {
  return (async () => {
    await waitForAuthReady();
    if (!useEntitlement.getState().ready) {
      await useEntitlement.getState().sync(useAuth.getState().session?.user.id ?? null);
    }
    if (!adsEnabled()) return;
    await initAds();
    await presentInterstitial();
  })();
}

export function showRewardedAd(): Promise<"earned" | "skipped" | "failed"> {
  return (async () => {
    if (!rewardedAvailable()) return "failed";
    await initAds();
    return presentRewarded();
  })();
}

function presentRewarded(): Promise<"earned" | "skipped" | "failed"> {
  return new Promise((resolve) => {
    const ad = rewarded;
    const events = adsModule?.AdEventType;
    const rewardedEvents = adsModule?.RewardedAdEventType;
    if (!ad || !events || !rewardedEvents) {
      resolve("failed");
      return;
    }

    let settled = false;
    let earned = false;
    const pending: Array<() => void> = [];
    const done = (result: "earned" | "skipped" | "failed") => {
      if (settled) return;
      settled = true;
      pending.forEach((unsubscribe) => unsubscribe());
      resolve(result);
    };

    const show = () => {
      ad.show().catch(() => {
        ad.load();
        done("failed");
      });
    };

    pending.push(ad.addAdEventListener(rewardedEvents.EARNED_REWARD, () => {
      earned = true;
    }));
    pending.push(
      ad.addAdEventListener(events.CLOSED, () => {
        setTimeout(() => done(earned ? "earned" : "skipped"), 0);
      }),
    );
    pending.push(
      ad.addAdEventListener(events.ERROR, () => {
        done("failed");
        ad.load();
      }),
    );

    if (ad.loaded) {
      show();
      return;
    }

    const timeout = setTimeout(() => done("failed"), 8000);
    pending.push(() => clearTimeout(timeout));
    pending.push(
      ad.addAdEventListener(rewardedEvents.LOADED, () => {
        clearTimeout(timeout);
        show();
      }),
    );
    ad.load();
  });
}

function presentInterstitial(): Promise<void> {
  return new Promise((resolve) => {
    const ad = interstitial;
    const events = adsModule?.AdEventType;
    if (!ad || !events) {
      resolve();
      return;
    }

    let settled = false;
    const pending: Array<() => void> = [];
    const done = () => {
      if (settled) return;
      settled = true;
      pending.forEach((unsubscribe) => unsubscribe());
      resolve();
    };

    const show = () => {
      ad.show().catch(() => {
        ad.load();
        done();
      });
    };

    pending.push(ad.addAdEventListener(events.CLOSED, done));
    pending.push(
      ad.addAdEventListener(events.ERROR, () => {
        done();
        ad.load();
      }),
    );

    if (ad.loaded) {
      show();
      return;
    }

    const timeout = setTimeout(done, 6000);
    pending.push(() => clearTimeout(timeout));
    pending.push(
      ad.addAdEventListener(events.LOADED, () => {
        clearTimeout(timeout);
        show();
      }),
    );
    ad.load();
  });
}
