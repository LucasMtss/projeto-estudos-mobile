import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tutorial } from "@/components/Tutorial";
import { authFeedback } from "@/services/authError";
import { NicknameError, parseNickname } from "@/services/profile";
import { hideTutorialForever } from "@/services/tutorialPref";
import { supabaseConfigured } from "@/services/supabase";
import { useAuth } from "@/store/auth";
import { useT } from "@/i18n";
import { colors, font } from "@/theme/theme";

const GOOGLE_SIGN_IN_ENABLED = false;

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const session = useAuth((state) => state.session);
  const nickname = useAuth((state) => state.nickname);
  const signIn = useAuth((state) => state.signIn);
  const signUp = useAuth((state) => state.signUp);
  const signInWithGoogle = useAuth((state) => state.signInWithGoogle);
  const saveNickname = useAuth((state) => state.saveNickname);
  const signOut = useAuth((state) => state.signOut);
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const seededFor = useRef<string | null>(null);

  useEffect(() => {
    const id = session?.user.id;
    if (!id) {
      seededFor.current = null;
      return;
    }
    if (seededFor.current === id) return;
    if (!nickname) return;
    seededFor.current = id;
    setDraft(nickname);
  }, [nickname, session?.user.id]);

  function submit(kind: "signIn" | "signUp", action: (email: string, password: string) => Promise<void>) {
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setFeedback({ tone: "error", text: t("auth.missingCredentials") });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFeedback({ tone: "error", text: t("auth.invalidEmail") });
      return;
    }
    if (kind === "signUp" && password.length < 6) {
      setFeedback({ tone: "error", text: t("auth.weakPassword") });
      return;
    }
    if (kind === "signUp") {
      if (!draft.trim()) {
        setFeedback({ tone: "error", text: t("auth.missingNickname") });
        return;
      }
      try {
        parseNickname(draft);
      } catch {
        setFeedback({ tone: "error", text: t("auth.nicknameInvalid") });
        return;
      }
    }
    void run(kind, () => action(trimmed, password));
  }

  async function run(kind: "signIn" | "signUp", action: () => Promise<void>) {
    setBusy(true);
    setFeedback(null);
    try {
      await action();
      const state = useAuth.getState();
      if (state.session && state.nickname) router.back();
    } catch (caught) {
      if (caught instanceof NicknameError) {
        setFeedback({
          tone: "error",
          text: t(caught.code === "taken" ? "auth.nicknameTaken" : caught.code === "invalid" ? "auth.nicknameInvalid" : "auth.nicknameFailed"),
        });
        return;
      }
      setFeedback(authFeedback(caught, kind));
    } finally {
      setBusy(false);
    }
  }

  async function saveNick() {
    setBusy(true);
    setFeedback(null);
    try {
      await saveNickname(draft);
      setFeedback({ tone: "info", text: t("auth.nicknameSaved") });
    } catch (caught) {
      const code = caught instanceof NicknameError ? caught.code : "failed";
      setFeedback({
        tone: "error",
        text: t(code === "taken" ? "auth.nicknameTaken" : code === "invalid" ? "auth.nicknameInvalid" : "auth.nicknameFailed"),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.blob} />
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>{t("auth.title")}</Text>
        <Text style={styles.subtitle}>{t("auth.subtitle")}</Text>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="crown" size={22} color="#F5C518" style={styles.crown} />
          <Ionicons name="person" size={36} color={colors.white} />
        </View>
      </View>

      <ScrollView
        style={styles.sheet}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingTop: 8 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {session ? (
            <>
              <Text style={styles.cardTitle}>{t("auth.yourAccount")}</Text>
              <Text style={styles.cardBody}>{t("auth.accountBody")}</Text>
              <Text style={styles.email}>{session.user.email}</Text>
              <NicknameField value={draft} onChangeText={setDraft} placeholder={t("auth.nickname")} />
              <Text style={styles.hint}>{t("auth.nicknameHint")}</Text>
              <Pressable style={styles.primary} disabled={busy} onPress={() => void saveNick()}>
                <Text style={styles.primaryText}>{t("auth.nicknameSave")}</Text>
              </Pressable>
              <Pressable style={styles.cream} disabled={busy} onPress={() => void run("signIn", signOut)}>
                <Text style={styles.creamText}>{t("auth.signOut")}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>{t("auth.signInTitle")}</Text>
              <Text style={styles.cardBody}>{supabaseConfigured ? t("auth.signInBody") : t("auth.signInNoCloud")}</Text>
              {GOOGLE_SIGN_IN_ENABLED ? (
                <>
                  <Pressable style={styles.google} disabled={busy} onPress={() => void run("signIn", signInWithGoogle)}>
                    <Ionicons name="logo-google" size={18} color={colors.white} />
                    <Text style={styles.googleText}>{t("auth.google")}</Text>
                  </Pressable>
                  <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.or}>{t("auth.or")}</Text>
                    <View style={styles.line} />
                  </View>
                </>
              ) : null}
              <View style={styles.field}>
                <Ionicons name="mail-outline" size={18} color="#8B97A3" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder={t("auth.email")}
                  placeholderTextColor="#8B97A3"
                  style={styles.input}
                />
              </View>
              <View style={styles.field}>
                <Ionicons name="lock-closed-outline" size={18} color="#8B97A3" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder={t("auth.password")}
                  placeholderTextColor="#8B97A3"
                  style={styles.input}
                />
                <Pressable onPress={() => setShowPassword((current) => !current)} hitSlop={8}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#8B97A3" />
                </Pressable>
              </View>
              <Pressable style={styles.primary} disabled={busy} onPress={() => void submit("signIn", signIn)}>
                <Text style={styles.primaryText}>{t("auth.enter")}</Text>
              </Pressable>
              <NicknameField value={draft} onChangeText={setDraft} placeholder={t("auth.nickname")} />
              <Text style={styles.hint}>{t("auth.nicknameHint")}</Text>
              <Pressable style={styles.cream} disabled={busy} onPress={() => void submit("signUp", (mail, pass) => signUp(mail, pass, draft))}>
                <Text style={styles.creamText}>{t("auth.signUp")}</Text>
              </Pressable>
            </>
          )}
          {feedback ? (
            <Text style={feedback.tone === "info" ? styles.info : styles.error}>{feedback.text}</Text>
          ) : null}
        </View>

        {session ? null : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("auth.perksTitle")}</Text>
            <View style={styles.perks}>
              <View style={styles.perk}>
                <View style={[styles.perkIcon, { backgroundColor: "#E7F8EF" }]}>
                  <Ionicons name="cloud-outline" size={22} color="#14b374" />
                </View>
                <Text style={styles.perkTitle}>{t("auth.perkCloudTitle")}</Text>
                <Text style={styles.perkBody}>{t("auth.perkCloudBody")}</Text>
              </View>
              <View style={styles.perkRule} />
              <View style={styles.perk}>
                <View style={[styles.perkIcon, { backgroundColor: "#FFF4DE" }]}>
                  <Ionicons name="trophy-outline" size={22} color="#E2A90A" />
                </View>
                <Text style={styles.perkTitle}>{t("auth.perkDevicesTitle")}</Text>
                <Text style={styles.perkBody}>{t("auth.perkDevicesBody")}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.menu}>
          <MenuRow
            icon="trophy-outline"
            tint="#FFF4DE"
            color="#E2A90A"
            title={t("auth.ranking")}
            body={t("auth.rankingBody")}
            onPress={() => router.push("/ranking")}
          />
          <MenuRow
            icon="settings-outline"
            tint="#E7F8EF"
            color="#14b374"
            title={t("auth.settings")}
            body={t("auth.settingsBody")}
            onPress={() => router.push("/settings")}
          />
          <MenuRow
            icon="help-circle-outline"
            tint="#EEF3FF"
            color="#3B82F6"
            title={t("auth.howTo")}
            body={t("auth.howToBody")}
            onPress={() => setHelpOpen(true)}
          />
        </View>
      </ScrollView>

      <Tutorial
        visible={helpOpen}
        onClose={() => setHelpOpen(false)}
        onNever={() => {
          setHelpOpen(false);
          void hideTutorialForever();
        }}
      />
    </View>
  );
}

function NicknameField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.field}>
      <Ionicons name="person-outline" size={18} color="#8B97A3" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={placeholder}
        placeholderTextColor="#8B97A3"
        style={styles.input}
        maxLength={16}
      />
    </View>
  );
}

function MenuRow({
  icon,
  tint,
  color,
  title,
  body,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  color: string;
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.menuCopy}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuBody}>{body}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#8AA094" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF6EA",
  },
  header: {
    backgroundColor: "#14b374",
    paddingHorizontal: 22,
    paddingBottom: 72,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 180,
    height: 140,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -30,
    right: -20,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 14,
    color: colors.white,
    fontFamily: font.extra,
    fontSize: 36,
  },
  subtitle: {
    marginTop: 4,
    maxWidth: 210,
    color: "rgba(255,255,255,0.9)",
    fontFamily: font.semi,
    fontSize: 14,
    lineHeight: 20,
  },
  avatar: {
    position: "absolute",
    right: 22,
    bottom: 48,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#1FA971",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  crown: {
    position: "absolute",
    top: -8,
    right: -2,
  },
  sheet: {
    flex: 1,
    marginTop: -36,
    backgroundColor: "#FFF6EA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: font.extra,
    fontSize: 18,
    color: "#1C2430",
  },
  cardBody: {
    marginTop: 4,
    marginBottom: 14,
    fontFamily: font.semi,
    color: "#8B97A3",
    lineHeight: 20,
  },
  hint: {
    marginTop: -4,
    marginBottom: 10,
    fontFamily: font.semi,
    fontSize: 12,
    color: "#8B97A3",
  },
  email: {
    fontFamily: font.bold,
    fontSize: 16,
    color: "#1C2430",
    marginBottom: 14,
  },
  google: {
    backgroundColor: "#14b374",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  googleText: {
    color: colors.white,
    fontFamily: font.extra,
    fontSize: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 14,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E7E0D4",
  },
  or: {
    fontFamily: font.semi,
    color: "#8B97A3",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F7F3EA",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: font.semi,
    color: "#1C2430",
    fontSize: 15,
  },
  primary: {
    marginTop: 4,
    backgroundColor: "#14b374",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryText: {
    color: colors.white,
    fontFamily: font.extra,
    fontSize: 16,
  },
  cream: {
    marginTop: 10,
    backgroundColor: "#FFF4DE",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  creamText: {
    color: "#1C2430",
    fontFamily: font.extra,
    fontSize: 16,
  },
  error: {
    marginTop: 10,
    fontFamily: font.semi,
    color: "#B42318",
    textAlign: "center",
    lineHeight: 20,
  },
  info: {
    marginTop: 10,
    fontFamily: font.semi,
    color: "#0E7A4B",
    textAlign: "center",
    lineHeight: 20,
  },
  perks: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  perk: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  perkRule: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#F0E6D8",
  },
  perkIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  perkTitle: {
    fontFamily: font.extra,
    fontSize: 14,
    color: "#1C2430",
    textAlign: "center",
  },
  perkBody: {
    marginTop: 4,
    fontFamily: font.semi,
    fontSize: 12,
    lineHeight: 16,
    color: "#8B97A3",
    textAlign: "center",
  },
  menu: {
    backgroundColor: colors.white,
    borderRadius: 22,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  menuCopy: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: font.extra,
    fontSize: 15,
    color: "#1C2430",
  },
  menuBody: {
    fontFamily: font.semi,
    fontSize: 12,
    color: "#8B97A3",
    marginTop: 2,
  },
});
