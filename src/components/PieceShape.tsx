import { StyleSheet, Text, View } from "react-native";
import { footprint, PIECES } from "@/game/pieces";
import type { PieceId, Rotation } from "@/game/types";
import { font } from "@/theme/theme";

const NEON = "#39FF14";

type Props = {
  id: PieceId;
  rot: Rotation;
  cell: number;
  selected?: boolean;
};

export function PieceShape({ id, rot, cell, selected }: Props) {
  const piece = PIECES[id];
  const { w, h } = footprint(id, rot);
  const radius = Math.round(Math.min(16, Math.max(8, cell * 0.34)));
  return (
    <View
      style={[
        styles.piece,
        selected ? styles.selected : null,
        {
          width: Math.max(cell - 4, w * cell - 4),
          height: Math.max(cell - 4, h * cell - 4),
          backgroundColor: piece.color,
          borderRadius: radius,
          borderColor: selected ? NEON : piece.color === "#FFFFFF" || piece.color === "#F4F4F4" ? "#E4E4E4" : "rgba(0,0,0,0.06)",
          borderWidth: selected ? 3 : 1,
        },
      ]}
    >
      {piece.label ? (
        <Text style={[styles.label, { color: piece.ink, fontSize: Math.max(11, cell * 0.38) }]}>{piece.label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  selected: {
    elevation: 10,
    shadowColor: NEON,
    shadowOpacity: 0.95,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    boxShadow: "0 0 10px 1px #39FF14",
  },
  label: {
    fontFamily: font.extra,
  },
});
