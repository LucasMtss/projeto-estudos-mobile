import { create } from "zustand";
import { clearAdUnlocksRaw, readAdUnlocksRaw, writeAdUnlocksRaw } from "@/storage/kv";

type AdUnlockState = {
  ids: number[];
  ready: boolean;
  hydrate: () => Promise<void>;
  grant: (id: number) => Promise<void>;
  reset: () => Promise<void>;
};

export const useAdUnlocks = create<AdUnlockState>((set, get) => ({
  ids: [],
  ready: false,
  async hydrate() {
    try {
      const raw = await readAdUnlocksRaw();
      const ids = raw ? (JSON.parse(raw) as number[]) : [];
      set({ ids: Array.isArray(ids) ? ids.map(Number) : [], ready: true });
    } catch {
      set({ ids: [], ready: true });
    }
  },
  async grant(id) {
    if (get().ids.includes(id)) return;
    const ids = [...get().ids, id];
    set({ ids });
    await writeAdUnlocksRaw(JSON.stringify(ids));
  },
  async reset() {
    set({ ids: [] });
    await clearAdUnlocksRaw();
  },
}));
