import { StyleSheet, View } from "react-native";
import { footprint } from "@/game/pieces";
import type { Placement } from "@/game/types";
import { colors } from "@/theme/theme";

type Props = {
  blockers: Placement[];
  size: number;
};

export function MiniBoard({ blockers, size }: Props) {
  const cell = size / 8;
  return (
    <View style={[styles.board, { width: size, height: size, borderRadius: size * 0.14 }]}>
      {Array.from({ length: 64 }, (_, index) => (
        <View key={index} style={{ width: cell, height: cell, alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              width: cell * 0.42,
              height: cell * 0.42,
              borderRadius: 99,
              backgroundColor: colors.peg,
            }}
          />
        </View>
      ))}
      {blockers.map((piece) => {
        const { w, h } = footprint(piece.id, piece.rot);
        return (
          <View
            key={piece.id}
            style={{
              position: "absolute",
              left: piece.c * cell + 1,
              top: piece.r * cell + 1,
              width: w * cell - 2,
              height: h * cell - 2,
              borderRadius: 4,
              backgroundColor: "#4E4E4E",
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: colors.board,
    overflow: "hidden",
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
