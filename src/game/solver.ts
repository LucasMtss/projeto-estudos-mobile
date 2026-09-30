import { PLAYER_PIECES, footprint } from "@/game/pieces";
import { BOARD, type PieceId, type Placement, type Rotation } from "@/game/types";

function masksFor(id: PieceId): bigint[] {
  const masks: bigint[] = [];
  const rots: Rotation[] = footprint(id, 0).w === footprint(id, 0).h ? [0] : [0, 1];
  for (const rot of rots) {
    const { w, h } = footprint(id, rot);
    for (let r = 0; r <= BOARD - h; r++) {
      for (let c = 0; c <= BOARD - w; c++) {
        let bits = 0n;
        for (let dr = 0; dr < h; dr++) {
          for (let dc = 0; dc < w; dc++) {
            bits |= 1n << BigInt((r + dr) * BOARD + (c + dc));
          }
        }
        masks.push(bits);
      }
    }
  }
  return masks;
}

const CATALOG: Record<string, bigint[]> = {};
for (const id of PLAYER_PIECES) CATALOG[id] = masksFor(id);

const ORDER = [...PLAYER_PIECES].sort((a, b) => {
  const aa = footprint(a, 0).w * footprint(a, 0).h;
  const bb = footprint(b, 0).w * footprint(b, 0).h;
  return bb - aa;
});

export function isSolvable(blockers: Placement[], nodeLimit = 250000): boolean {
  let blocked = 0n;
  for (const piece of blockers) {
    const { w, h } = footprint(piece.id, piece.rot);
    for (let dr = 0; dr < h; dr++) {
      for (let dc = 0; dc < w; dc++) {
        const r = piece.r + dr;
        const c = piece.c + dc;
        if (r < 0 || c < 0 || r >= BOARD || c >= BOARD) return false;
        const bit = 1n << BigInt(r * BOARD + c);
        if ((blocked & bit) !== 0n) return false;
        blocked |= bit;
      }
    }
  }
  let nodes = 0;
  const options = ORDER.map((id) => CATALOG[id]);

  function search(index: number, mask: bigint): boolean {
    if (index === options.length) return true;
    if (nodes++ > nodeLimit) return false;
    for (const bits of options[index]) {
      if ((mask & bits) !== 0n) continue;
      if (search(index + 1, mask | bits)) return true;
    }
    return false;
  }

  return search(0, blocked);
}
