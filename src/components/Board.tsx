import { StyleSheet, View } from "react-native";
import { useMemo, useRef, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { PieceShape } from "@/components/PieceShape";
import { cellsOf } from "@/game/logic";
import { footprint } from "@/game/pieces";
import type { PieceId, Placement } from "@/game/types";
import { colors } from "@/theme/theme";

export type Preview = { cells: number[]; ok: boolean };

type Props = {
  cell: number;
  blockers: Placement[];
  placed: Placement[];
  preview: Preview | null;
  selectedId: PieceId | null;
  onTapCell: (row: number, col: number) => void;
  onDragPiece: (id: PieceId, row: number, col: number, phase: "start" | "move" | "end") => void;
  onMeasure: (x: number, y: number, size: number) => void;
};

export function Board({
  cell,
  blockers,
  placed,
  preview,
  selectedId,
  onTapCell,
  onDragPiece,
  onMeasure,
}: Props) {
  const size = cell * 8;
  const previewSet = new Set(preview?.cells ?? []);
  const gridRef = useRef<View>(null);
  const drag = useRef<{ id: PieceId; grabX: number; grabY: number; rot: Placement["rot"] } | null>(null);
  const [ghost, setGhost] = useState<{ id: PieceId; left: number; top: number; rot: Placement["rot"] } | null>(null);
  const api = useRef({ cell, placed, onTapCell, onDragPiece });
  api.current = { cell, placed, onTapCell, onDragPiece };

  function handleLayout() {
    const node = gridRef.current as (View & { getBoundingClientRect?: () => { left: number; top: number; width: number } }) | null;
    if (!node) return;
    if (typeof node.getBoundingClientRect === "function") {
      const rect = node.getBoundingClientRect();
      onMeasure(rect.left, rect.top, rect.width);
      return;
    }
    node.measureInWindow?.((x, y, width) => {
      onMeasure(x, y, width);
    });
  }

  function handlePan(x: number, y: number, phase: "start" | "move" | "end") {
    const current = api.current;
    if (phase === "start") {
      const col = Math.floor(x / current.cell);
      const row = Math.floor(y / current.cell);
      const index = row * 8 + col;
      const piece = current.placed.find((item) => cellsOf(item).includes(index));
      if (!piece) {
        drag.current = null;
        return;
      }
      drag.current = {
        id: piece.id,
        grabX: x - piece.c * current.cell,
        grabY: y - piece.r * current.cell,
        rot: piece.rot,
      };
    }
    const session = drag.current;
    if (!session) return;
    const left = x - session.grabX;
    const top = y - session.grabY;
    const col = Math.round(left / current.cell);
    const row = Math.round(top / current.cell);
    if (phase === "end") {
      drag.current = null;
      setGhost(null);
    } else {
      setGhost({ id: session.id, left, top, rot: session.rot });
    }
    current.onDragPiece(session.id, row, col, phase);
  }

  function handleTap(x: number, y: number) {
    const current = api.current;
    const col = Math.floor(x / current.cell);
    const row = Math.floor(y / current.cell);
    if (row >= 0 && col >= 0 && row < 8 && col < 8) current.onTapCell(row, col);
  }

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .minDistance(8)
      .onStart((event) => {
        runOnJS(handlePan)(event.x, event.y, "start");
      })
      .onUpdate((event) => {
        runOnJS(handlePan)(event.x, event.y, "move");
      })
      .onEnd((event) => {
        runOnJS(handlePan)(event.x, event.y, "end");
      });
    const tap = Gesture.Tap().onEnd((event) => {
      runOnJS(handleTap)(event.x, event.y);
    });
    return Gesture.Exclusive(pan, tap);
    // O gesto fica estável para não cancelar o arraste no meio do movimento.
    // handlePan lê os dados atuais pelo ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.frame}>
      <GestureDetector gesture={gesture}>
        <View ref={gridRef} style={[styles.grid, { width: size, height: size }]} onLayout={handleLayout}>
          {Array.from({ length: 64 }, (_, index) => {
            const marked = previewSet.has(index);
            return (
              <View key={index} style={[styles.cell, { width: cell, height: cell }]}>
                <View style={styles.peg} />
                {marked ? <View style={[styles.mark, { backgroundColor: preview?.ok ? colors.ok : colors.bad }]} /> : null}
              </View>
            );
          })}
          {blockers.map((piece) => (
            <PlacedPiece key={piece.id} piece={piece} cell={cell} selected={false} />
          ))}
          {placed.map((piece) => (
            <PlacedPiece key={piece.id} piece={piece} cell={cell} selected={selectedId === piece.id} />
          ))}
        </View>
      </GestureDetector>
      {ghost ? (
        <View pointerEvents="none" style={[styles.ghost, { left: ghost.left + FRAME_PAD, top: ghost.top + FRAME_PAD }]}>
          <PieceShape id={ghost.id} rot={ghost.rot} cell={cell} selected />
        </View>
      ) : null}
    </View>
  );
}

function PlacedPiece({
  piece,
  cell,
  selected,
}: {
  piece: Placement;
  cell: number;
  selected: boolean;
}) {
  const { w, h } = footprint(piece.id, piece.rot);
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: piece.c * cell + 1,
        top: piece.r * cell + 1,
        width: w * cell,
        height: h * cell,
      }}
    >
      <PieceShape id={piece.id} rot={piece.rot} cell={cell} selected={selected} />
    </View>
  );
}

export function pieceCells(piece: Placement): number[] {
  return cellsOf(piece);
}

const FRAME_PAD = 12;

const styles = StyleSheet.create({
  frame: {
    backgroundColor: "#121820",
    borderRadius: 28,
    padding: FRAME_PAD,
    alignSelf: "center",
    marginTop: 16,
    shadowColor: "#1C2430",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.board,
    borderRadius: 18,
    overflow: "hidden",
  },
  cell: {
    alignItems: "center",
    justifyContent: "center",
  },
  peg: {
    width: "42%",
    height: "42%",
    borderRadius: 999,
    backgroundColor: colors.peg,
  },
  mark: {
    ...StyleSheet.absoluteFill,
    opacity: 0.72,
  },
  ghost: {
    position: "absolute",
    zIndex: 5,
  },
});
