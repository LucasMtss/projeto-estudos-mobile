import { footprint } from "@/game/pieces";
import { BOARD, type PieceId, type Placement, type Rotation } from "@/game/types";

export function cellIndex(r: number, c: number): number {
  return r * BOARD + c;
}

export function cellsOf(placement: Placement): number[] {
  const { w, h } = footprint(placement.id, placement.rot);
  const cells: number[] = [];
  for (let dr = 0; dr < h; dr++) {
    for (let dc = 0; dc < w; dc++) {
      cells.push(cellIndex(placement.r + dr, placement.c + dc));
    }
  }
  return cells;
}

export function inBounds(id: PieceId, r: number, c: number, rot: Rotation): boolean {
  const { w, h } = footprint(id, rot);
  return r >= 0 && c >= 0 && r + h <= BOARD && c + w <= BOARD;
}

export type CellOwner = PieceId | null;

export function buildOwners(blockers: Placement[], placed: Placement[]): CellOwner[] {
  const owners: CellOwner[] = Array.from({ length: BOARD * BOARD }, () => null);
  for (const placement of [...blockers, ...placed]) {
    for (const index of cellsOf(placement)) owners[index] = placement.id;
  }
  return owners;
}

export function canPlace(
  owners: CellOwner[],
  id: PieceId,
  r: number,
  c: number,
  rot: Rotation,
  ignoreId?: PieceId,
): boolean {
  if (!inBounds(id, r, c, rot)) return false;
  const { w, h } = footprint(id, rot);
  for (let dr = 0; dr < h; dr++) {
    for (let dc = 0; dc < w; dc++) {
      const owner = owners[cellIndex(r + dr, c + dc)];
      if (owner && owner !== ignoreId) return false;
    }
  }
  return true;
}

export function isSolved(blockers: Placement[], placed: Placement[]): boolean {
  if (placed.length !== 8) return false;
  const owners = buildOwners(blockers, placed);
  return owners.every((owner) => owner !== null);
}
