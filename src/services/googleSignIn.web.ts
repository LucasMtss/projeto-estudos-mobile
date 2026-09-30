import { t } from "@/i18n";

export async function signInWithGoogleIdToken(): Promise<string> {
  throw new Error(t("auth.googleWeb"));
}
