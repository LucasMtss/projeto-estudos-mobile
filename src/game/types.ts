export type Rotation = 0 | 1;

export type PieceId =
  | "Y34"
  | "B33"
  | "Y25"
  | "R24"
  | "R23"
  | "B22"
  | "W15"
  | "W14"
  | "K1"
  | "K2"
  | "K3";

export type Placement = {
  id: PieceId;
  r: number;
  c: number;
  rot: Rotation;
};

export type Puzzle = {
  id: number;
  stars: 1 | 2 | 3 | 4 | 5;
  blockers: Placement[];
};

export const BOARD = 8;
