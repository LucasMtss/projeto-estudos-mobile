import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from "@expo-google-fonts/nunito";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { initAds } from "@/ads/AdService";
import { Tutorial } from "@/components/Tutorial";
import { hideTutorialForever, isTutorialHidden, syncTutorialPreference } from "@/services/tutorialPref";
import { useI18n } from "@/i18n";
import { useAuth } from "@/store/auth";
import { useAdUnlocks } from "@/store/adUnlocks";
import { useProgress } from "@/store/progress";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

let shownThisLaunch = false;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  const hydrate = useProgress((state) => state.hydrate);
  const hydrateUnlocks = useAdUnlocks((state) => state.hydrate);
  const hydrateLocale = useI18n((state) => state.hydrate);
  const localeReady = useI18n((state) => state.ready);
  const initAuth = useAuth((state) => state.init);
  const ready = useAuth((state) => state.ready);
  const session = useAuth((state) => state.session);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  useEffect(() => {
    void hydrate();
    void hydrateUnlocks();
    void hydrateLocale();
    void initAuth();
    void initAds();
  }, [hydrate, hydrateUnlocks, hydrateLocale, initAuth]);

  useEffect(() => {
    if ((loaded || error) && localeReady) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded, error, localeReady]);

  useEffect(() => {
    if ((!loaded && !error) || !ready) return;
    let alive = true;
    void (async () => {
      await syncTutorialPreference(session);
      if (!alive) return;
      const hidden = await isTutorialHidden();
      if (!alive) return;
      if (hidden) {
        setTutorialOpen(false);
        return;
      }
      if (!shownThisLaunch) {
        shownThisLaunch = true;
        setTutorialOpen(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loaded, error, ready, session]);

  if ((!loaded && !error) || !localeReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
        <Tutorial
          visible={tutorialOpen}
          onClose={() => setTutorialOpen(false)}
          onNever={() => {
            setTutorialOpen(false);
            void hideTutorialForever();
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
