import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const KEY = "logic-jigsaw-progress-v1";
const UNLOCK_KEY = "logic-jigsaw-ad-unlocks-v1";
const expoGo = Constants.executionEnvironment === "storeClient";

type Kv = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  clear: (key: string) => void;
};

function openMmkv(): Kv | null {
  if (expoGo) return null;
  try {
    const { createMMKV } = require("react-native-mmkv") as {
      createMMKV: (config?: { id?: string }) => {
        getString: (key: string) => string | undefined;
        set: (key: string, value: string) => void;
        remove: (key: string) => void;
      };
    };
    const store = createMMKV({ id: "logic-jigsaw" });
    return {
      getString: (key) => store.getString(key),
      set: (key, value) => store.set(key, value),
      clear: (key) => store.remove(key),
    };
  } catch {
    return null;
  }
}

const mmkv = openMmkv();

export async function readProgressRaw(): Promise<string | null> {
  if (mmkv) return mmkv.getString(KEY) ?? null;
  return AsyncStorage.getItem(KEY);
}

export async function writeProgressRaw(value: string): Promise<void> {
  if (mmkv) {
    mmkv.set(KEY, value);
    return;
  }
  await AsyncStorage.setItem(KEY, value);
}

export async function clearProgressRaw(): Promise<void> {
  if (mmkv) {
    mmkv.clear(KEY);
    return;
  }
  await AsyncStorage.removeItem(KEY);
}

export async function readAdUnlocksRaw(): Promise<string | null> {
  if (mmkv) return mmkv.getString(UNLOCK_KEY) ?? null;
  return AsyncStorage.getItem(UNLOCK_KEY);
}

export async function writeAdUnlocksRaw(value: string): Promise<void> {
  if (mmkv) {
    mmkv.set(UNLOCK_KEY, value);
    return;
  }
  await AsyncStorage.setItem(UNLOCK_KEY, value);
}

export async function clearAdUnlocksRaw(): Promise<void> {
  if (mmkv) {
    mmkv.clear(UNLOCK_KEY);
    return;
  }
  await AsyncStorage.removeItem(UNLOCK_KEY);
}
