import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MiniBoard } from "@/components/MiniBoard";
import { UnlockPhaseModal, usePhaseUnlockOffer } from "@/components/UnlockPhaseModal";
import { isPuzzleUnlocked, nextLockedPuzzleId, puzzlesByStars } from "@/data/puzzles";
import { useAdUnlocks } from "@/store/adUnlocks";
import { useProgress } from "@/store/progress";
import { levelName, useT } from "@/i18n";
import { colors, font } from "@/theme/theme";

const boardArt = require("../../assets/home-board.png");
export default function LevelPuzzlesScreen() {
  const { stars } = useLocalSearchParams<{ stars: string }>();
  const level = Number(stars);
  const insets = useSafeAreaInsets();
  const t = useT();
  const records = useProgress((state) => state.records);
  const granted = useAdUnlocks((state) => state.ids);
  const offer = usePhaseUnlockOffer();
  const completedIds = Object.keys(records);
  const puzzles = puzzlesByStars(level);
  const unlocked = puzzles.some((puzzle) => isPuzzleUnlocked(puzzle.id, completedIds, granted));
  const nextLocked = nextLockedPuzzleId(completedIds, granted);
  const done = puzzles.filter((puzzle) => records[puzzle.id]).length;
  const progress = puzzles.length === 0 ? 0 : done / puzzles.length;
  const name = levelName(level, t);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.blob} />
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.kicker}>{t("phases.kicker", { level })}</Text>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.subtitle}>
          {level >= 5
            ? t("phases.completeLast", { count: puzzles.length })
            : t("phases.completeNext", { count: puzzles.length })}
        </Text>
        <Image source={boardArt} style={styles.art} resizeMode="contain" />
      </View>

      {unlocked ? (
        <FlatList
          data={puzzles}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          style={styles.sheet}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingTop: 8, gap: 12 }}
          ListHeaderComponent={
            <View style={styles.progressCard}>
              <Text style={styles.progressLabel}>{t("phases.progress")}</Text>
              <View style={styles.progressRow}>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
                </View>
                <Text style={styles.progressCount}>
                  {done}/{puzzles.length}
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const complete = Boolean(records[item.id]);
            const open = isPuzzleUnlocked(item.id, completedIds, granted);
            const canOffer = !open && item.id === nextLocked;
            return (
              <Pressable
                style={[styles.card, complete && styles.cardDone, !open && styles.cardLocked]}
                disabled={!open && !canOffer}
                onPress={() => {
                  if (open) router.push(`/play/${item.id}`);
                  else if (canOffer) offer.open(item.id);
                }}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.num, complete && styles.numDone]}>
                    <Text style={[styles.numText, complete && styles.numTextDone]}>{item.id}</Text>
                  </View>
                  {complete ? (
                    <Ionicons name="checkmark-circle" size={22} color="#1FA971" />
                  ) : open ? (
                    <View style={styles.numSpacer} />
                  ) : (
                    <Ionicons name="lock-closed" size={18} color="#9AA8A1" />
                  )}
                </View>
                <MiniBoard blockers={item.blockers} size={86} />
                <View style={styles.stars}>
                  {Array.from({ length: level }, (_, star) => (
                    <Ionicons key={star} name="star" size={14} color={complete ? "#F5C518" : "#D3D8DE"} />
                  ))}
                </View>
              </Pressable>
            );
          }}
        />
      ) : (
        <View style={styles.lockedWrap}>
          <Ionicons name="lock-closed" size={28} color="#9AA8A1" />
          <Text style={styles.locked}>{t("phases.locked")}</Text>
        </View>
      )}
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
    paddingBottom: 36,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 180,
    height: 140,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -20,
    right: -20,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: {
    marginTop: 14,
    color: "rgba(255,255,255,0.85)",
    fontFamily: font.bold,
    fontSize: 14,
  },
  title: {
    color: colors.white,
    fontFamily: font.extra,
    fontSize: 36,
  },
  subtitle: {
    marginTop: 4,
    maxWidth: 200,
    color: "rgba(255,255,255,0.9)",
    fontFamily: font.semi,
    fontSize: 14,
    lineHeight: 20,
  },
  art: {
    position: "absolute",
    width: 168,
    height: 168 / (1423 / 1105),
    right: -16,
    bottom: 26,
  },
  sheet: {
    flex: 1,
    marginTop: -18,
    backgroundColor: "#FFF6EA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
  },
  progressCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 6,
    marginTop: 4,
  },
  progressLabel: {
    fontFamily: font.bold,
    color: "#5C6B7A",
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 99,
    backgroundColor: "#E6EEE8",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#3DDC97",
  },
  progressCount: {
    fontFamily: font.extra,
    color: "#1C2430",
  },
  row: {
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFDF8",
    borderRadius: 22,
    padding: 12,
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  cardDone: {
    backgroundColor: "#E7F8EF",
    borderColor: "#1FA971",
  },
  cardLocked: {
    opacity: 0.55,
  },
  cardTop: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  num: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#F3F0E8",
    alignItems: "center",
    justifyContent: "center",
  },
  numDone: {
    backgroundColor: "#D8F5E6",
  },
  numText: {
    fontFamily: font.extra,
    fontSize: 13,
    color: "#1C2430",
  },
  numTextDone: {
    color: "#127A4E",
  },
  numSpacer: {
    width: 22,
    height: 22,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
    minHeight: 16,
  },
  lockedWrap: {
    flex: 1,
    marginTop: -18,
    backgroundColor: "#FFF6EA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  locked: {
    fontFamily: font.semi,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
});
