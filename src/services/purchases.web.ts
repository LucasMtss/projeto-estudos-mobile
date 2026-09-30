import { PurchaseFailure } from "@/services/purchaseFailure";

export const REMOVE_ADS_PRODUCT_ID = "remove_ads";

export async function fetchRemoveAdsPrice(): Promise<string | null> {
  return null;
}

export async function buyRemoveAds(): Promise<void> {
  throw new PurchaseFailure("unavailable");
}

export async function restoreRemoveAds(): Promise<void> {
  throw new PurchaseFailure("unavailable");
}