import { supabase } from "@/services/supabase";

export type PlayerRank = {
  nickname: string;
  completedCount: number;
  totalBestMs: number;
};

export type PhaseRank = {
  nickname: string;
  bestTimeMs: number;
};

export class RankingError extends Error {
  code: "unavailable" | "failed";

  constructor(code: "unavailable" | "failed") {
    super(code);
    this.code = code;
  }
}

function asRankingError(error: { message?: string; code?: string }): RankingError {
  const message = error.message ?? "";
  if (/schema cache|could not find the function|PGRST202|404/i.test(message) || error.code === "PGRST202") {
    return new RankingError("unavailable");
  }
  return new RankingError("failed");
}

export async function fetchPlayerRanking(): Promise<PlayerRank[]> {
  if (!supabase) throw new RankingError("unavailable");
  const { data, error } = await supabase.rpc("leaderboard_players");
  if (error) throw asRankingError(error);
  if (!Array.isArray(data)) return [];
  return data.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as { nickname?: unknown; completed_count?: unknown; total_best_ms?: unknown };
    if (typeof record.nickname !== "string") return [];
    return [{
      nickname: record.nickname,
      completedCount: Number(record.completed_count) || 0,
      totalBestMs: Number(record.total_best_ms) || 0,
    }];
  });
}

export async function fetchPhaseRanking(puzzleId: number): Promise<PhaseRank[]> {
  if (!supabase) throw new RankingError("unavailable");
  const { data, error } = await supabase.rpc("leaderboard_phase_times", { phase_id: puzzleId });
  if (error) throw asRankingError(error);
  if (!Array.isArray(data)) return [];
  return data.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as { nickname?: unknown; best_time_ms?: unknown };
    if (typeof record.nickname !== "string") return [];
    return [{ nickname: record.nickname, bestTimeMs: Number(record.best_time_ms) || 0 }];
  });
}
