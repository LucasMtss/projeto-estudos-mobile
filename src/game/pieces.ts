import type { PieceId, Rotation } from "@/game/types";

export type PieceDef = {
  id: PieceId;
  w: number;
  h: number;
  color: string;
  label: string;
  ink: string;
  fixed: boolean;
};

export const PIECES: Record<PieceId, PieceDef> = {
  Y34: { id: "Y34", w: 4, h: 3, color: "#F5C518", label: "12", ink: "#3A2A00", fixed: false },
  B33: { id: "B33", w: 3, h: 3, color: "#2F6FE4", label: "9", ink: "#FFFFFF", fixed: false },
  Y25: { id: "Y25", w: 5, h: 2, color: "#F6D34D", label: "10", ink: "#3A2A00", fixed: false },
  R24: { id: "R24", w: 4, h: 2, color: "#E23B3B", label: "8", ink: "#FFFFFF", fixed: false },
  R23: { id: "R23", w: 3, h: 2, color: "#F25C5C", label: "6", ink: "#FFFFFF", fixed: false },
  B22: { id: "B22", w: 2, h: 2, color: "#3D7BFF", label: "4", ink: "#FFFFFF", fixed: false },
  W15: { id: "W15", w: 5, h: 1, color: "#F4F4F4", label: "5", ink: "#3A3A3A", fixed: false },
  W14: { id: "W14", w: 4, h: 1, color: "#FFFFFF", label: "4", ink: "#3A3A3A", fixed: false },
  K1: { id: "K1", w: 1, h: 1, color: "#555C66", label: "", ink: "#FFFFFF", fixed: true },
  K2: { id: "K2", w: 2, h: 1, color: "#555C66", label: "", ink: "#FFFFFF", fixed: true },
  K3: { id: "K3", w: 3, h: 1, color: "#555C66", label: "", ink: "#FFFFFF", fixed: true },
};

export const PLAYER_PIECES: PieceId[] = ["Y34", "B33", "Y25", "R24", "R23", "B22", "W15", "W14"];

export function footprint(id: PieceId, rot: Rotation): { w: number; h: number } {
  const piece = PIECES[id];
  if (rot === 1 && piece.w !== piece.h) return { w: piece.h, h: piece.w };
  return { w: piece.w, h: piece.h };
}
