export function adsEnabled(): boolean {
  return false;
}

export function bannerUnitId(): string {
  return "";
}

export function bannerVisible(): boolean {
  return false;
}

export async function initAds(): Promise<void> {}

export function rewardedAvailable(): boolean {
  return false;
}

export function showPhaseInterstitial(): Promise<void> {
  return Promise.resolve();
}

export function showRewardedAd(): Promise<"earned" | "skipped" | "failed"> {
  return Promise.resolve("failed");
}
