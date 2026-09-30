import { create } from "zustand";
import { clearProgressRaw, readProgressRaw, writeProgressRaw } from "@/storage/kv";

export type ProgressEntry = {
  bestTimeMs: number;
  updatedAt: number;
};

type ProgressState = {
  records: Record<number, ProgressEntry>;
  ready: boolean;
  hydrate: () => Promise<void>;
  recordWin: (puzzleId: number, timeMs: number) => boolean;
  replaceRecords: (records: Record<number, ProgressEntry>) => void;
  reset: () => Promise<void>;
};

async function persist(records: Record<number, ProgressEntry>) {
  await writeProgressRaw(JSON.stringify(records));
}

export const useProgress = create<ProgressState>((set, get) => ({
  records: {},
  ready: false,
  async hydrate() {
    try {
      const raw = await readProgressRaw();
      const records = raw ? (JSON.parse(raw) as Record<number, ProgressEntry>) : {};
      set({ records, ready: true });
    } catch {
      set({ records: {}, ready: true });
    }
  },
  recordWin(puzzleId, timeMs) {
    const previous = get().records[puzzleId];
    const isNewRecord = Boolean(previous && timeMs < previous.bestTimeMs);
    if (!previous || timeMs < previous.bestTimeMs) {
      const records = {
        ...get().records,
        [puzzleId]: { bestTimeMs: timeMs, updatedAt: Date.now() },
      };
      set({ records });
      void persist(records);
    }
    return isNewRecord;
  },
  replaceRecords(records) {
    set({ records });
    void persist(records);
  },
  async reset() {
    set({ records: {} });
    await clearProgressRaw();
  },
}));
