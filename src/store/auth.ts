import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { AuthFlowError } from "@/services/authError";
import { signInWithGoogleIdToken } from "@/services/googleSignIn";
import { loadNickname, parseNickname, upsertNickname } from "@/services/profile";
import { supabase, supabaseConfigured } from "@/services/supabase";
import { t } from "@/i18n";
import { pullAndMerge } from "@/services/sync";
import { syncTutorialPreference } from "@/services/tutorialPref";
import { syncEntitlement } from "@/store/entitlement";

type AuthState = {
  session: Session | null;
  nickname: string | null;
  ready: boolean;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nickname: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  saveNickname: (nickname: string) => Promise<void>;
  signOut: () => Promise<void>;
};

async function nicknameFor(userId: string | undefined): Promise<string | null> {
  if (!userId) return null;
  return loadNickname(userId);
}

export const useAuth = create<AuthState>((set, get) => ({
  session: null,
  nickname: null,
  ready: !supabaseConfigured,
  async init() {
    if (!supabase) {
      await syncEntitlement(null);
      set({ ready: true, session: null, nickname: null });
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      await pullAndMerge(data.session);
      await syncTutorialPreference(data.session);
    }
    await syncEntitlement(data.session?.user.id ?? null);
    set({
      session: data.session,
      nickname: await nicknameFor(data.session?.user.id),
      ready: true,
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, nickname: session ? get().nickname : null });
      void syncEntitlement(session?.user.id ?? null);
      if (!session) return;
      void nicknameFor(session.user.id).then((nickname) => {
        if (get().session?.user.id === session.user.id) set({ nickname });
      });
    });
  },
  async signIn(email, password) {
    if (!supabase) throw new Error(t("auth.supabaseSignIn"));
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    set({ session: data.session, nickname: await nicknameFor(data.session?.user.id) });
    await pullAndMerge(data.session);
    await syncTutorialPreference(data.session);
    await syncEntitlement(data.session?.user.id ?? null);
  },
  async signUp(email, password, nickname) {
    if (!supabase) throw new Error(t("auth.supabaseSignUp"));
    const clean = parseNickname(nickname);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nickname: clean } },
    });
    if (error) throw error;
    if (!data.session) {
      const identities = data.user?.identities;
      if (identities && identities.length === 0) throw new AuthFlowError("emailTaken");
      throw new AuthFlowError("confirmEmail");
    }
    const saved = await upsertNickname(data.session.user.id, clean);
    set({ session: data.session, nickname: saved });
    await pullAndMerge(data.session);
    await syncTutorialPreference(data.session);
    await syncEntitlement(data.session.user.id);
  },
  async signInWithGoogle() {
    if (!supabase) throw new Error(t("auth.supabaseGoogle"));
    const idToken = await signInWithGoogleIdToken();
    const { data, error } = await supabase.auth.signInWithIdToken({ provider: "google", token: idToken });
    if (error) throw error;
    set({ session: data.session, nickname: await nicknameFor(data.session?.user.id) });
    await pullAndMerge(data.session);
    await syncTutorialPreference(data.session);
    await syncEntitlement(data.session?.user.id ?? null);
  },
  async saveNickname(nickname) {
    const session = get().session;
    if (!supabase || !session) throw new Error(t("auth.supabaseSignIn"));
    const saved = await upsertNickname(session.user.id, nickname);
    set({ nickname: saved });
  },
  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ session: null, nickname: null });
    await syncEntitlement(null);
  },
}));
