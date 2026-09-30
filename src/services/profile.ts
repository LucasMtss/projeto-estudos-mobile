import { supabase } from "@/services/supabase";

const NICKNAME = /^[\p{L}\p{N}_]{3,16}$/u;

export class NicknameError extends Error {
  code: "invalid" | "taken" | "failed";

  constructor(code: "invalid" | "taken" | "failed") {
    super(code);
    this.code = code;
  }
}

export function parseNickname(raw: string): string {
  const nickname = raw.trim();
  if (!NICKNAME.test(nickname)) throw new NicknameError("invalid");
  return nickname;
}

export async function loadNickname(userId: string): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("nickname").eq("user_id", userId).maybeSingle();
  if (error || !data) return null;
  return typeof data.nickname === "string" ? data.nickname : null;
}

export async function upsertNickname(userId: string, raw: string): Promise<string> {
  if (!supabase) throw new NicknameError("failed");
  const nickname = parseNickname(raw);
  const { error } = await supabase.from("profiles").upsert(
    { user_id: userId, nickname },
    { onConflict: "user_id" },
  );
  if (!error) return nickname;
  const code = "code" in error ? String(error.code) : "";
  const message = error.message ?? "";
  if (code === "23505" || /duplicate|unique/i.test(message)) throw new NicknameError("taken");
  if (code === "23514" || /check constraint|profiles_nickname_format/i.test(message)) {
    throw new NicknameError("invalid");
  }
  throw new NicknameError("failed");
}
