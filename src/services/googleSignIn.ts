import Constants from "expo-constants";
import { t } from "@/i18n";

export async function signInWithGoogleIdToken(): Promise<string> {
  if (Constants.executionEnvironment === "storeClient") {
    throw new Error(t("auth.googleExpoGo"));
  }
  let GoogleSignin: {
    configure: (options: { webClientId?: string; iosClientId?: string }) => void;
    hasPlayServices: (options?: { showPlayServicesUpdateDialog?: boolean }) => Promise<boolean>;
    signIn: () => Promise<{ data?: { idToken?: string | null } }>;
  };
  try {
    GoogleSignin = require("@react-native-google-signin/google-signin").GoogleSignin;
  } catch {
    throw new Error(t("auth.googleExpoGo"));
  }
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken;
  if (!idToken) throw new Error(t("auth.googleToken"));
  return idToken;
}
