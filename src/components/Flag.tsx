import { StyleSheet, View } from "react-native";
import type { FlagCode } from "@/i18n";

type Props = {
  code: FlagCode;
  width?: number;
};

export function Flag({ code, width = 28 }: Props) {
  const height = Math.round(width * 0.7);
  return (
    <View style={[styles.frame, { width, height, borderRadius: Math.max(3, width * 0.12) }]}>
      {code === "br" ? <Brazil /> : null}
      {code === "us" ? <UnitedStates /> : null}
      {code === "es" ? <Spain /> : null}
      {code === "fr" ? <France /> : null}
      {code === "de" ? <Germany /> : null}
    </View>
  );
}

function Brazil() {
  return (
    <View style={[styles.fill, { backgroundColor: "#009B3A" }]}>
      <View style={styles.diamond} />
      <View style={styles.circle} />
    </View>
  );
}

function UnitedStates() {
  return (
    <View style={styles.fill}>
      {Array.from({ length: 7 }, (_, index) => (
        <View key={index} style={[styles.strip, { backgroundColor: index % 2 === 0 ? "#B22234" : "#FFFFFF" }]} />
      ))}
      <View style={styles.canton} />
    </View>
  );
}

function Spain() {
  return (
    <View style={styles.fill}>
      <View style={[styles.band, { backgroundColor: "#AA151B" }]} />
      <View style={[styles.bandWide, { backgroundColor: "#F1BF00" }]} />
      <View style={[styles.band, { backgroundColor: "#AA151B" }]} />
    </View>
  );
}

function France() {
  return (
    <View style={[styles.fill, styles.row]}>
      <View style={[styles.column, { backgroundColor: "#0055A4" }]} />
      <View style={[styles.column, { backgroundColor: "#FFFFFF" }]} />
      <View style={[styles.column, { backgroundColor: "#EF4135" }]} />
    </View>
  );
}

function Germany() {
  return (
    <View style={styles.fill}>
      <View style={[styles.band, { backgroundColor: "#000000" }]} />
      <View style={[styles.band, { backgroundColor: "#DD0000" }]} />
      <View style={[styles.band, { backgroundColor: "#FFCE00" }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(28, 36, 48, 0.12)",
  },
  fill: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
  },
  column: {
    flex: 1,
  },
  band: {
    flex: 1,
  },
  bandWide: {
    flex: 2,
  },
  strip: {
    flex: 1,
  },
  canton: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "42%",
    height: "54%",
    backgroundColor: "#3C3B6E",
  },
  diamond: {
    position: "absolute",
    left: "18%",
    top: "16%",
    width: "64%",
    height: "68%",
    backgroundColor: "#FEDD00",
    transform: [{ rotate: "45deg" }],
  },
  circle: {
    position: "absolute",
    left: "38%",
    top: "32%",
    width: "24%",
    height: "36%",
    borderRadius: 99,
    backgroundColor: "#002776",
  },
});
