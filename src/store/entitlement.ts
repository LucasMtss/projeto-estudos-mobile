import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { supabase } from "@/services/supabase";

const STORAGE_KEY = "logic-jigsaw-entitlement-v1";

type CachedEntitlement = {
  userId: string;
  adsRemoved: boolean;
};

type EntitlementState = {
  adsRemoved: boolean;
  ready: boolean;
  sync: (userId: string | null) => Promise<void>;
  setRemoved: (userId: string) => Promise<void>;
};

async function readCache(userId: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as CachedEntitlement;
    return parsed.userId === userId && parsed.adsRemoved;
  } catch {
    return false;
  }
}

async function writeCache(userId: string, adsRemoved: boolean): Promise<void> {
  const value: CachedEntitlement = { userId, adsRemoved };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export const useEntitlement = create<EntitlementState>((set) => ({
  adsRemoved: false,
  ready: false,
  async sync(userId) {
    if (!userId || !supabase) {
      set({ adsRemoved: false, ready: true });
      return;
    }
    const local = await readCache(userId);
    if (local) set({ adsRemoved: true });
    const { data, error } = await supabase
      .from("user_entitlements")
      .select("ads_removed")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      set({ adsRemoved: local, ready: true });
      return;
    }
    const removed = Boolean(data?.ads_removed);
    await writeCache(userId, removed);
    set({ adsRemoved: removed, ready: true });
  },
  async setRemoved(userId) {
    await writeCache(userId, true);
    set({ adsRemoved: true, ready: true });
  },
}));

export function syncEntitlement(userId: string | null): Promise<void> {
  return useEntitlement.getState().sync(userId);
}
