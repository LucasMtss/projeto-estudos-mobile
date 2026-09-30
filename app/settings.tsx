import { useEffect, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Flag } from "@/components/Flag";
import { LOCALES, useI18n, useT } from "@/i18n";
import { PurchaseFailure, type PurchaseCode } from "@/services/purchaseFailure";
import { buyRemoveAds, fetchRemoveAdsPrice, restoreRemoveAds } from "@/services/purchases";
import { supabaseConfigured } from "@/services/supabase";
import { useAuth } from "@/store/auth";
import { useEntitlement } from "@/store/entitlement";
import { useAdUnlocks } from "@/store/adUnlocks";
import { useProgress } from "@/store/progress";
import { colors, font } from "@/theme/theme";

function purchaseMessage(code: PurchaseCode, t: ReturnType<typeof useT>): string {
  if (code === "login") return t("settings.adsLogin");
  if (code === "expo-go") return t("settings.expoGo");
  if (code === "unavailable") return t("settings.unavailable");
  if (code === "linked") return t("settings.linked");
  if (code === "pending") return t("settings.pending");
  if (code === "none") return t("settings.none");
  return t("settings.failed");
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const t = useT();
  const locale = useI18n((state) => state.locale);
  const setLocale = useI18n((state) => state.setLocale);
  const session = useAuth((state) => state.session);
  const adsRemoved = useEntitlement((state) => state.adsRemoved);
  const reset = useProgress((state) => state.reset);
  const resetUnlocks = useAdUnlocks((state) => state.reset);
  const [price, setPrice] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [purchaseError, setPurchaseError] = useState<PurchaseCode | null>(null);

  useEffect(() => {
    if (!session || Platform.OS !== "android") return;
    let alive = true;
    void fetchRemoveAdsPrice().then((value) => {
      if (alive && value) setPrice(value);
    });
    return () => {
      alive = false;
    };
  }, [session]);

  const runPurchase = (action: () => Promise<void>) => {
    setPurchaseError(null);
    setBuying(true);
    void action()
      .catch((error: unknown) => {
        if (error instanceof PurchaseFailure && error.code !== "cancelled") setPurchaseError(error.code);
      })
      .finally(() => setBuying(false));
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>{t("settings.title")}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>{t("settings.language")}</Text>
          {LOCALES.map((item) => {
            const selected = item.id === locale;
            return (
              <Pressable key={item.id} style={[styles.lang, selected && styles.langOn]} onPress={() => void setLocale(item.id)}>
                <Flag code={item.flag} />
                <Text style={styles.langName}>{item.nativeName}</Text>
                {selected ? <Ionicons name="checkmark" size={18} color="#14b374" /> : null}
              </Pressable>
            );
          })}
        </View>

        {/* <View style={styles.card}>
          <Text style={styles.label}>{t("settings.account")}</Text>
          <Text style={styles.value}>{session?.user.email ?? t("settings.guest")}</Text>
          <Pressable onPress={() => router.push("/auth")}>
            <Text style={styles.link}>{session ? t("settings.manage") : t("settings.enter")}</Text>
          </Pressable>
        </View> */}

        {/* <View style={styles.card}>
          <Text style={styles.label}>{t("settings.cloud")}</Text>
          <Text style={styles.value}>{supabaseConfigured ? t("settings.cloudOn") : t("settings.cloudOff")}</Text>
        </View> */}

        {/* <View style={styles.card}>
          <Text style={styles.label}>{adsRemoved ? t("settings.adsRemoved") : t("settings.ads")}</Text>
          {adsRemoved ? (
            <Text style={styles.value}>{t("settings.adsRemovedBody")}</Text>
          ) : !session ? (
            <>
              <Text style={styles.value}>{t("settings.adsLogin")}</Text>
              <Pressable onPress={() => router.push("/auth")}>
                <Text style={styles.link}>{t("settings.enter")}</Text>
              </Pressable>
            </>
          ) : Platform.OS !== "android" ? (
            <Text style={styles.value}>{t("settings.unavailable")}</Text>
          ) : (
            <>
              <Text style={styles.value}>{t("settings.adsOffer", { price: price ?? t("settings.priceFallback") })}</Text>
              <Pressable
                style={[styles.buy, buying && styles.buyDisabled]}
                disabled={buying}
                onPress={() => runPurchase(buyRemoveAds)}
              >
                <Text style={styles.buyText}>{buying ? t("settings.buying") : t("settings.buy")}</Text>
              </Pressable>
              <Pressable disabled={buying} onPress={() => runPurchase(restoreRemoveAds)}>
                <Text style={styles.link}>{t("settings.restore")}</Text>
              </Pressable>
            </>
          )}
          {purchaseError ? <Text style={styles.error}>{purchaseMessage(purchaseError, t)}</Text> : null}
        </View> */}

        <Pressable
          style={styles.danger}
          onPress={() => {
            Alert.alert(t("settings.resetTitle"), t("settings.resetBody"), [
              { text: t("settings.cancel"), style: "cancel" },
              {
                text: t("settings.delete"),
                style: "destructive",
                onPress: () => void Promise.all([reset(), resetUnlocks()]),
              },
            ]);
          }}
        >
          <Text style={styles.dangerText}>{t("settings.resetButton")}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: font.extra,
    fontSize: 28,
    color: colors.ink,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    gap: 6,
  },
  lang: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  langOn: {
    backgroundColor: "#E7F8EF",
  },
  langName: {
    flex: 1,
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.ink,
  },
  label: {
    fontFamily: font.extra,
    color: colors.ink,
    fontSize: 16,
  },
  value: {
    fontFamily: font.semi,
    color: colors.muted,
  },
  link: {
    fontFamily: font.bold,
    color: colors.greenDark,
    marginTop: 4,
  },
  buy: {
    marginTop: 8,
    backgroundColor: "#14b374",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  buyDisabled: {
    opacity: 0.6,
  },
  buyText: {
    fontFamily: font.bold,
    color: colors.white,
    fontSize: 16,
  },
  error: {
    fontFamily: font.semi,
    color: "#B42318",
    marginTop: 4,
  },
  danger: {
    marginTop: 8,
    backgroundColor: "#FFE4E4",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  dangerText: {
    fontFamily: font.bold,
    color: "#B42318",
  },
});
