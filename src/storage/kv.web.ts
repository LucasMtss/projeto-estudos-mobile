import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "logic-jigsaw-progress-v1";

export async function readProgressRaw(): Promise<string | null> {
  return AsyncStorage.getItem(KEY);
}

export async function writeProgressRaw(value: string): Promise<void> {
  await AsyncStorage.setItem(KEY, value);
}

export async function clearProgressRaw(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
