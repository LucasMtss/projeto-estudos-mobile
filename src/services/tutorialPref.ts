import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";

const KEY = "logic-jigsaw-hide-tutorial-v1";

export async function isTutorialHidden(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) === "1";
}

export async function hideTutorialForever(): Promise<void> {
  await AsyncStorage.setItem(KEY, "1");
  if (!supabase) return;
  try {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) return;
    await supabase.from("user_preferences").upsert(
      { user_id: session.user.id, hide_tutorial: true },
      { onConflict: "user_id" },
    );
  } catch {
    return;
  }
}

export async function syncTutorialPreference(session: Session | null): Promise<void> {
  const local = await isTutorialHidden();
  if (!supabase || !session) return;
  const { data, error } = await supabase
    .from("user_preferences")
    .select("hide_tutorial")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) return;
  const remote = Boolean(data?.hide_tutorial);
  if (remote && !local) await AsyncStorage.setItem(KEY, "1");
  if (local && !remote) {
    await supabase.from("user_preferences").upsert(
      { user_id: session.user.id, hide_tutorial: true },
      { onConflict: "user_id" },
    );
  }
}
