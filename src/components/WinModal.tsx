import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { useT } from "@/i18n";
import { colors, font, formatTime } from "@/theme/theme";

type Props = {
  visible: boolean;
  timeMs: number;
  isRecord: boolean;
  stars: number;
  onNext?: () => void;
  onLevels: () => void;
};

const BITS = [
  { top: 22, left: 36, color: "#F5C518", width: 8, height: 16, rotate: "28deg", delay: 40 },
  { top: 48, left: 18, color: "#3DDC97", width: 7, height: 14, rotate: "-18deg", delay: 90 },
  { top: 18, right: 48, color: "#3D7BFF", width: 8, height: 15, rotate: "16deg", delay: 70 },
  { top: 54, right: 22, color: "#F25C5C", width: 7, height: 13, rotate: "-24deg", delay: 120 },
  { top: 34, left: 72, color: "#F6D34D", width: 6, height: 12, rotate: "40deg", delay: 30 },
  { top: 28, right: 78, color: "#E23B3B", width: 6, height: 11, rotate: "-36deg", delay: 150 },
  { top: 64, left: 58, color: "#2F6FE4", width: 6, height: 10, rotate: "12deg", delay: 110 },
  { top: 62, right: 64, color: "#1FA971", width: 6, height: 11, rotate: "-12deg", delay: 80 },
];

export function WinModal({ visible, timeMs, isRecord, stars, onNext, onLevels }: Props) {
  const t = useT();
  const scale = useSharedValue(0.86);
  const opacity = useSharedValue(0);
  const starScale = useSharedValue(0.4);

  useEffect(() => {
    if (!visible) return;
    scale.value = 0.86;
    opacity.value = 0;
    starScale.value = 0.4;
    scale.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.back(1.2)) });
    opacity.value = withTiming(1, { duration: 220 });
    starScale.value = withDelay(80, withTiming(1, { duration: 460, easing: Easing.out(Easing.back(1.8)) }));
  }, [opacity, scale, starScale, visible]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLevels}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.crest}>
            <View style={styles.crestOrb} />
            {visible ? BITS.map((bit) => <Bit key={`${bit.top}-${bit.left ?? bit.right}`} {...bit} />) : null}
            <Animated.View style={[styles.starWrap, starStyle]}>
              <Ionicons name="star" size={92} color="#F5C518" />
            </Animated.View>
          </View>

          <Text style={styles.title}>{t("win.title")}</Text>

          <View style={styles.timeBox}>
            <Ionicons name="stopwatch-outline" size={30} color="#14b374" />
            <View>
              <Text style={styles.timeLabel}>{t("win.time")}</Text>
              <Text style={styles.timeValue}>{formatTime(timeMs)}</Text>
            </View>
          </View>

          {isRecord ? <Text style={styles.record}>{t("win.record")}</Text> : null}

          <View style={styles.stars}>
            {Array.from({ length: Math.max(1, stars) }, (_, index) => (
              <Ionicons key={index} name="star" size={28} color="#F5C518" />
            ))}
          </View>

          {onNext ? (
            <Pressable style={styles.primary} onPress={onNext}>
              <View style={styles.primarySpacer} />
              <Text style={styles.primaryText}>{t("win.next")}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.white} />
            </Pressable>
          ) : null}
          <Pressable style={onNext ? styles.secondary : styles.primary} onPress={onLevels}>
            <Text style={onNext ? styles.secondaryText : styles.primaryText}>{t("win.levels")}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Bit({
  top,
  left,
  right,
  color,
  width,
  height,
  rotate,
  delay,
}: {
  top: number;
  left?: number;
  right?: number;
  color: string;
  width: number;
  height: number;
  rotate: string;
  delay: number;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 260 }));
    scale.value = withDelay(delay, withTiming(1, { duration: 420, easing: Easing.out(Easing.back(1.5)) }));
  }, [delay, opacity, scale]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { rotate }],
  }));
  return <Animated.View style={[styles.bit, style, { top, left, right, width, height, backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(28, 32, 38, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFF9F0",
    borderRadius: 28,
    overflow: "hidden",
    paddingBottom: 18,
    alignItems: "center",
  },
  crest: {
    height: 148,
    width: "100%",
    alignItems: "center",
    overflow: "hidden",
  },
  crestOrb: {
    position: "absolute",
    top: -250,
    width: 520,
    height: 360,
    borderRadius: 260,
    backgroundColor: "#14b374",
  },
  starWrap: {
    position: "absolute",
    bottom: 2,
    shadowColor: "#E2A90A",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  bit: {
    position: "absolute",
    borderRadius: 4,
  },
  title: {
    fontFamily: font.extra,
    fontSize: 28,
    color: "#1C2430",
    marginTop: 4,
    textAlign: "center",
  },
  timeBox: {
    marginTop: 16,
    marginHorizontal: 22,
    alignSelf: "stretch",
    backgroundColor: "#F3F0E8",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 12,
  },
  timeLabel: {
    fontFamily: font.semi,
    color: "#8B97A3",
    fontSize: 13,
  },
  timeValue: {
    fontFamily: font.extra,
    fontSize: 28,
    color: "#1C2430",
    marginTop: -2,
  },
  record: {
    marginTop: 10,
    fontFamily: font.extra,
    color: "#14b374",
    fontSize: 15,
  },
  stars: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    marginBottom: 16,
  },
  primary: {
    marginHorizontal: 22,
    alignSelf: "stretch",
    backgroundColor: "#14b374",
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  primarySpacer: {
    width: 20,
  },
  primaryText: {
    flex: 1,
    textAlign: "center",
    color: colors.white,
    fontFamily: font.extra,
    fontSize: 17,
  },
  secondary: {
    marginTop: 10,
    marginHorizontal: 22,
    alignSelf: "stretch",
    backgroundColor: "#FFF4DE",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryText: {
    color: "#1C2430",
    fontFamily: font.extra,
    fontSize: 16,
  },
});
