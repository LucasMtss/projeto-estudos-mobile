import type { Puzzle } from "@/game/types";
import { PUZZLES } from "@/data/puzzleData";

export { PUZZLES };

export const LEVELS = [1, 2, 3, 4, 5] as const;

export function isPuzzleUnlocked(
  id: number,
  completedIds: Iterable<number | string>,
  grantedIds: Iterable<number | string> = [],
): boolean {
  const done = new Set([...completedIds].map(Number));
  const granted = new Set([...grantedIds].map(Number));
  const index = PUZZLES.findIndex((puzzle) => puzzle.id === id);
  if (index < 0) return false;
  let open = true;
  for (let cursor = 1; cursor <= index; cursor += 1) {
    const previousCompleted = done.has(PUZZLES[cursor - 1].id);
    const grantedThis = granted.has(PUZZLES[cursor].id);
    open = open && (previousCompleted || grantedThis);
    if (!open) return false;
  }
  return true;
}

export function nextLockedPuzzleId(
  completedIds: Iterable<number | string>,
  grantedIds: Iterable<number | string> = [],
): number | undefined {
  return PUZZLES.find((puzzle) => !isPuzzleUnlocked(puzzle.id, completedIds, grantedIds))?.id;
}

export function getPuzzle(id: number): Puzzle | undefined {
  return PUZZLES.find((puzzle) => puzzle.id === id);
}

export function puzzlesByStars(stars: number): Puzzle[] {
  return PUZZLES.filter((puzzle) => puzzle.stars === stars);
}

export function nextPuzzleId(completedIds: number[]): number | undefined {
  const done = new Set(completedIds);
  return PUZZLES.find((puzzle) => !done.has(puzzle.id))?.id ?? PUZZLES[0]?.id;
}
