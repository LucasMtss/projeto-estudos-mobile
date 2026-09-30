import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import * as Haptics from "expo-haptics";
import { buildOwners, canPlace, cellsOf, inBounds, isSolved } from "@/game/logic";
import { footprint, PLAYER_PIECES } from "@/game/pieces";
import type { PieceId, Placement, Rotation } from "@/game/types";
import { getPuzzle } from "@/data/puzzles";
import { pushWin } from "@/services/sync";
import { useAuth } from "@/store/auth";
import { useProgress } from "@/store/progress";

export type Preview = { cells: number[]; ok: boolean } | null;

export function useGame(puzzleId: number) {
  const puzzle = getPuzzle(puzzleId);
  const [placed, setPlaced] = useState<Placement[]>([]);
  const [past, setPast] = useState<Placement[][]>([]);
  const [selected, setSelected] = useState<PieceId | null>(null);
  const [rots, setRots] = useState<Partial<Record<PieceId, Rotation>>>({});
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const [finalMs, setFinalMs] = useState(0);
  const acc = useRef(0);
  const tickStart = useRef(Date.now());
  const finished = useRef(false);

  const rotOf = (id: PieceId): Rotation => rots[id] ?? 0;

  function currentMs() {
    return acc.current + (running ? Date.now() - tickStart.current : 0);
  }

  useEffect(() => {
    if (!running) return;
    tickStart.current = Date.now();
    const timer = setInterval(() => {
      setElapsed(acc.current + Date.now() - tickStart.current);
    }, 200);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        tickStart.current = Date.now();
        return;
      }
      acc.current += Date.now() - tickStart.current;
      tickStart.current = Date.now();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [running]);

  useEffect(() => {
    if (!puzzle || won || finished.current) return;
    if (!isSolved(puzzle.blockers, placed)) return;
    finished.current = true;
    const ms = currentMs();
    setRunning(false);
    setFinalMs(ms);
    setElapsed(ms);
    const record = useProgress.getState().recordWin(puzzle.id, ms);
    setIsRecord(record);
    setWon(true);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    void pushWin(useAuth.getState().session, puzzle.id, ms);
  }, [placed, puzzle, won, running]);

  function commit(next: Placement[]) {
    setPast((history) => [...history, placed]);
    setPlaced(next);
  }

  function tryPlace(id: PieceId, row: number, col: number, rot = rotOf(id)): boolean {
    if (!puzzle || won) return false;
    const owners = buildOwners(puzzle.blockers, placed);
    if (!canPlace(owners, id, row, col, rot, id)) return false;
    commit([...placed.filter((piece) => piece.id !== id), { id, r: row, c: col, rot }]);
    setRots((current) => ({ ...current, [id]: rot }));
    setSelected(null);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return true;
  }

  function previewAt(id: PieceId, row: number, col: number, rot = rotOf(id)): Preview {
    if (!puzzle) return null;
    if (!inBounds(id, row, col, rot)) {
      const { w, h } = footprint(id, rot);
      const cells: number[] = [];
      for (let dr = 0; dr < h; dr++) {
        for (let dc = 0; dc < w; dc++) {
          const rr = row + dr;
          const cc = col + dc;
          if (rr >= 0 && cc >= 0 && rr < 8 && cc < 8) cells.push(rr * 8 + cc);
        }
      }
      if (cells.length === 0) return null;
      return { cells, ok: false };
    }
    const owners = buildOwners(puzzle.blockers, placed);
    return { cells: cellsOf({ id, r: row, c: col, rot }), ok: canPlace(owners, id, row, col, rot, id) };
  }

  function undo() {
    if (won || past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((history) => history.slice(0, -1));
    setPlaced(previous);
  }

  function resume() {
    if (won || running) return;
    tickStart.current = Date.now();
    setRunning(true);
  }

  function restart() {
    acc.current = 0;
    tickStart.current = Date.now();
    finished.current = false;
    setPlaced([]);
    setPast([]);
    setSelected(null);
    setRots({});
    setElapsed(0);
    setWon(false);
    setIsRecord(false);
    setFinalMs(0);
    setRunning(true);
  }

  function rotateSelected() {
    if (!selected || !puzzle || won) return;
    const piece = PIECES_ROT(selected);
    if (piece) return;
    const next = (rotOf(selected) === 0 ? 1 : 0) as Rotation;
    const onBoard = placed.find((item) => item.id === selected);
    if (onBoard) {
      const owners = buildOwners(puzzle.blockers, placed);
      if (!canPlace(owners, selected, onBoard.r, onBoard.c, next, selected)) return;
      commit(placed.map((item) => (item.id === selected ? { ...item, rot: next } : item)));
    }
    setRots((current) => ({ ...current, [selected]: next }));
  }

  function removeSelected() {
    if (!selected || won) return;
    if (!placed.some((piece) => piece.id === selected)) return;
    commit(placed.filter((piece) => piece.id !== selected));
  }

  function onTrayPress(id: PieceId) {
    if (won) return;
    setSelected(id);
  }

  const tray = PLAYER_PIECES.filter((id) => !placed.some((piece) => piece.id === id));

  return {
    puzzle,
    placed,
    selected,
    setSelected,
    rotOf,
    elapsed,
    won,
    isRecord,
    finalMs,
    tray,
    tryPlace,
    previewAt,
    undo,
    resume,
    restart,
    rotateSelected,
    removeSelected,
    onTrayPress,
  };
}

function PIECES_ROT(id: PieceId): boolean {
  return footprint(id, 0).w === footprint(id, 0).h;
}
