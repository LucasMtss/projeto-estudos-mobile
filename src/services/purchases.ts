import { Platform } from "react-native";
import Constants from "expo-constants";
import { PurchaseFailure } from "@/services/purchaseFailure";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/store/auth";
import { useEntitlement } from "@/store/entitlement";

export const REMOVE_ADS_PRODUCT_ID = "remove_ads";

type StorePurchase = {
  productId: string;
  purchaseToken?: string | null;
};

type StoreProduct = {
  id: string;
  displayPrice?: string;
};

type StoreError = {
  code?: string;
};

type StoreModule = {
  initConnection: () => Promise<unknown>;
  fetchProducts: (request: { skus: string[]; type: "in-app" }) => Promise<StoreProduct[] | null>;
  requestPurchase: (request: {
    request: { google: { skus: string[]; obfuscatedAccountId?: string } };
    type: "in-app";
  }) => Promise<unknown>;
  getAvailablePurchases: () => Promise<StorePurchase[] | null>;
  finishTransaction: (request: { purchase: StorePurchase; isConsumable?: boolean }) => Promise<unknown>;
  purchaseUpdatedListener: (listener: (purchase: StorePurchase) => void) => { remove: () => void };
  purchaseErrorListener: (listener: (error: StoreError) => void) => { remove: () => void };
};

const CANCELLED = "user-cancelled";
const ALREADY_OWNED = "already-owned";

function requireUser(): string {
  const userId = useAuth.getState().session?.user.id;
  if (!userId) throw new PurchaseFailure("login");
  return userId;
}

function openStore(): StoreModule {
  if (Constants.executionEnvironment === "storeClient") throw new PurchaseFailure("expo-go");
  if (Platform.OS !== "android") throw new PurchaseFailure("unavailable");
  try {
    return require("expo-iap") as StoreModule;
  } catch {
    throw new PurchaseFailure("expo-go");
  }
}

async function confirmWithServer(purchaseToken: string): Promise<void> {
  if (!supabase) throw new PurchaseFailure("failed");
  const { data, error } = await supabase.functions.invoke<{ ok?: boolean; code?: string }>("verify-purchase", {
    body: { purchaseToken, productId: REMOVE_ADS_PRODUCT_ID },
  });
  if (data?.ok) return;
  const code = data?.code ?? (await readErrorCode(error));
  if (code === "linked") throw new PurchaseFailure("linked");
  if (code === "pending") throw new PurchaseFailure("pending");
  if (code === "login") throw new PurchaseFailure("login");
  throw new PurchaseFailure("failed");
}

async function readErrorCode(error: unknown): Promise<string | undefined> {
  const response = (error as { context?: { json?: () => Promise<{ code?: string }> } } | null)?.context;
  if (!response?.json) return undefined;
  try {
    const body = await response.json();
    return body.code;
  } catch {
    return undefined;
  }
}

async function grant(store: StoreModule, purchase: StorePurchase, userId: string): Promise<void> {
  const token = purchase.purchaseToken;
  if (!token) throw new PurchaseFailure("failed");
  await confirmWithServer(token);
  await store.finishTransaction({ purchase, isConsumable: false });
  await useEntitlement.getState().setRemoved(userId);
}

function waitForPurchase(store: StoreModule, userId: string): Promise<StorePurchase> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      updated.remove();
      failed.remove();
      action();
    };
    const updated = store.purchaseUpdatedListener((purchase) => {
      if (purchase.productId !== REMOVE_ADS_PRODUCT_ID) return;
      finish(() => resolve(purchase));
    });
    const failed = store.purchaseErrorListener((error) => {
      finish(() => reject(failureFromStore(error.code)));
    });
    void store
      .requestPurchase({
        request: {
          google: {
            skus: [REMOVE_ADS_PRODUCT_ID],
            obfuscatedAccountId: userId,
          },
        },
        type: "in-app",
      })
      .then((result) => {
        const purchase = result as StorePurchase | null;
        if (purchase?.productId === REMOVE_ADS_PRODUCT_ID && purchase.purchaseToken) {
          finish(() => resolve(purchase));
        }
      })
      .catch((error: StoreError) => {
        finish(() => reject(failureFromStore(error?.code)));
      });
  });
}

function failureFromStore(code: string | undefined): PurchaseFailure {
  if (code === CANCELLED) return new PurchaseFailure("cancelled");
  if (code === ALREADY_OWNED) return new PurchaseFailure("owned");
  return new PurchaseFailure("failed");
}

async function restoreOwned(store: StoreModule, userId: string): Promise<void> {
  await store.initConnection();
  const purchases = await store.getAvailablePurchases();
  const match = (purchases ?? []).find((item) => item.productId === REMOVE_ADS_PRODUCT_ID && item.purchaseToken);
  if (!match) throw new PurchaseFailure("none");
  await grant(store, match, userId);
}

export async function fetchRemoveAdsPrice(): Promise<string | null> {
  try {
    const store = openStore();
    await store.initConnection();
    const products = await store.fetchProducts({ skus: [REMOVE_ADS_PRODUCT_ID], type: "in-app" });
    return products?.find((item) => item.id === REMOVE_ADS_PRODUCT_ID)?.displayPrice ?? null;
  } catch {
    return null;
  }
}

export async function buyRemoveAds(): Promise<void> {
  const userId = requireUser();
  const store = openStore();
  await store.initConnection();
  try {
    const purchase = await waitForPurchase(store, userId);
    await grant(store, purchase, userId);
  } catch (error) {
    if (error instanceof PurchaseFailure && error.code === "owned") {
      await restoreOwned(store, userId);
      return;
    }
    throw error;
  }
}

export async function restoreRemoveAds(): Promise<void> {
  const userId = requireUser();
  const store = openStore();
  await restoreOwned(store, userId);
}
