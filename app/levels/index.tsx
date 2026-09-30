import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdBanner } from "@/components/AdBanner";
import { UnlockPhaseModal, usePhaseUnlockOffer } from "@/components/UnlockPhaseModal";
import { LEVELS, isPuzzleUnlocked, nextLockedPuzzleId, puzzlesByStars } from "@/data/puzzles";
import { useAdUnlocks } from "@/store/adUnlocks";
import { useProgress } from "@/store/progress";
import { levelName, useT } from "@/i18n";
import { colors, font, levelColor } from "@/theme/theme";

const board = require("../../assets/home-board.png");

const washes = ["#E7F8EF", "#EEF3FF", "#FFF4E4", "#FDECEC", "#F3EEFF"];

export default function LevelsScreen() {
  const insets = useSafeAreaInsets();
  const t = useT();
  const records = useProgress((state) => state.records);
  const granted = useAdUnlocks((state) => state.ids);
  const offer = usePhaseUnlockOffer();
  const completedIds = Object.keys(records);
  const nextLocked = nextLockedPuzzleId(completedIds, granted);
  const counts = LEVELS.map((stars) => {
    const puzzles = puzzlesByStars(stars);
    const done = puzzles.filter((puzzle) => records[puzzle.id]).length;
    return { total: puzzles.length, done };
  });

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.blob} />
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>{t("levels.title")}</Text>
        <Text style={styles.subtitle}>{t("levels.subtitle")}</Text>
        <Image source={board} style={styles.board} resizeMode="contain" />
      </View>

      <ScrollView
        style={styles.sheet}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingTop: 18, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {LEVELS.map((stars, index) => {
          const { total, done } = counts[index];
          const puzzles = puzzlesByStars(stars);
          const unlocked = puzzles.some((puzzle) => isPuzzleUnlocked(puzzle.id, completedIds, granted));
          const offersNext = nextLocked !== undefined && puzzles.some((puzzle) => puzzle.id === nextLocked);
          const progress = total === 0 ? 0 : done / total;
          return (
            <Pressable
              key={stars}
              style={[styles.card, { backgroundColor: washes[index] }, !unlocked && styles.cardLocked]}
              disabled={!unlocked && !offersNext}
              onPress={() => {
                if (unlocked) router.push(`/levels/${stars}`);
                else if (offersNext && nextLocked !== undefined) offer.open(nextLocked);
              }}
            >
              <View style={styles.cardTop}>
                <View style={[styles.badge, { backgroundColor: levelColor[index] }]}>
                  <Text style={styles.badgeText}>{stars}</Text>
                </View>
                <View style={styles.copy}>
                  <Text style={styles.name}>{levelName(stars, t)}</Text>
                  <Text style={styles.meta}>{t("levels.phases", { count: total })}</Text>
                </View>
                {unlocked ? (
                  <View style={styles.score}>
                    <Text style={styles.scoreText}>
                      {done}/{total}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#8AA094" />
                  </View>
                ) : (
                  <Ionicons name="lock-closed" size={18} color="#9AA8A1" />
                )}
              </View>
              {unlocked ? (
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: levelColor[index] }]} />
                </View>
              ) : (
                <Text style={styles.locked}>{t("levels.locked")}</Text>
              )}
            </Pressable>
          );
        })}
        <AdBanner />
      </ScrollView>
      <UnlockPhaseModal
        phaseId={offer.phaseId}
        busy={offer.busy}
        error={offer.error}
        canWatch={offer.canWatch}
        onClose={offer.close}
        onWatch={() => void offer.watch()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF6EA",
  },
  header: {
    backgroundColor: "#14b374",
    paddingHorizontal: 22,
    paddingBottom: 54,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 180,
    height: 140,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -20,
    left: -30,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 16,
    color: colors.white,
    fontFamily: font.extra,
    fontSize: 40,
  },
  subtitle: {
    marginTop: 4,
    color: "rgba(255,255,255,0.9)",
    fontFamily: font.semi,
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 190,
  },
  board: {
    position: "absolute",
    width: 196,
    height: 196 / (1423 / 1105),
    right: -18,
    bottom: 16,
  },
  sheet: {
    flex: 1,
    marginTop: -28,
    backgroundColor: "#FFF6EA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
  },
  card: {
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardLocked: {
    opacity: 0.92,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.white,
    fontFamily: font.extra,
    fontSize: 24,
  },
  copy: {
    flex: 1,
  },
  name: {
    fontFamily: font.extra,
    fontSize: 18,
    color: "#1C2430",
  },
  meta: {
    fontFamily: font.semi,
    color: "#6D7C74",
    marginTop: 2,
  },
  score: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  scoreText: {
    fontFamily: font.bold,
    color: "#6D7C74",
  },
  track: {
    marginTop: 12,
    marginLeft: 64,
    height: 7,
    borderRadius: 99,
    backgroundColor: "rgba(28,36,48,0.08)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 99,
  },
  locked: {
    marginTop: 8,
    marginLeft: 64,
    fontFamily: font.semi,
    color: "#8A9490",
    fontSize: 13,
    lineHeight: 18,
  },
});
