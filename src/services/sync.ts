import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";
import { useProgress, type ProgressEntry } from "@/store/progress";

type RemoteRow = {
  puzzle_id: number;
  best_time_ms: number;
  updated_at: string;
};

function mergeRecords(
  local: Record<number, ProgressEntry>,
  remote: RemoteRow[],
): Record<number, ProgressEntry> {
  const next: Record<number, ProgressEntry> = { ...local };
  for (const row of remote) {
    const current = next[row.puzzle_id];
    const remoteTime = row.best_time_ms;
    const remoteAt = new Date(row.updated_at).getTime();
    if (!current || remoteTime < current.bestTimeMs) {
      next[row.puzzle_id] = { bestTimeMs: remoteTime, updatedAt: remoteAt || Date.now() };
    }
  }
  return next;
}

export async function pullAndMerge(session: Session | null): Promise<void> {
  if (!supabase || !session) return;
  const { data, error } = await supabase
    .from("puzzle_progress")
    .select("puzzle_id,best_time_ms,updated_at")
    .eq("user_id", session.user.id);
  if (error || !data) return;

  const local = useProgress.getState().records;
  const merged = mergeRecords(local, data as RemoteRow[]);
  useProgress.getState().replaceRecords(merged);

  const remoteById = new Map((data as RemoteRow[]).map((row) => [row.puzzle_id, row.best_time_ms]));
  const uploads = Object.entries(merged)
    .filter(([id, entry]) => {
      const remote = remoteById.get(Number(id));
      return remote === undefined || entry.bestTimeMs < remote;
    })
    .map(([id, entry]) => ({
      user_id: session.user.id,
      puzzle_id: Number(id),
      best_time_ms: entry.bestTimeMs,
      completed_at: new Date(entry.updatedAt).toISOString(),
    }));

  if (uploads.length === 0) return;
  await supabase.from("puzzle_progress").upsert(uploads, { onConflict: "user_id,puzzle_id" });
}

export async function pushWin(session: Session | null, puzzleId: number, timeMs: number): Promise<void> {
  if (!supabase || !session) return;
  const existing = useProgress.getState().records[puzzleId];
  await supabase.from("puzzle_progress").upsert(
    {
      user_id: session.user.id,
      puzzle_id: puzzleId,
      best_time_ms: existing?.bestTimeMs ?? timeMs,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,puzzle_id" },
  );
}
