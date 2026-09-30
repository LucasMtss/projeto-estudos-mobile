import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PUZZLES } from "@/data/puzzles";
import { useAuth } from "@/store/auth";
import { useProgress } from "@/store/progress";
import { levelName, useT } from "@/i18n";
import { colors, font } from "@/theme/theme";

const logo = require("../assets/home-logo.png");
const board = require("../assets/home-board.png");

const LOGO_RATIO = 1769 / 889;
const BOARD_RATIO = 1423 / 1105;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const inner = Math.max(240, width - 44);
  const artBudget = Math.max(200, height - insets.top - insets.bottom - 400);
  const logoWidth = Math.min(inner * 0.98, artBudget * 0.4 * LOGO_RATIO);
  const logoHeight = logoWidth / LOGO_RATIO;
  const boardWidth = Math.min(inner * 0.78, Math.max(120, artBudget - logoHeight) * BOARD_RATIO);
  const boardHeight = boardWidth / BOARD_RATIO;
  const t = useT();
  const records = useProgress((state) => state.records);
  const session = useAuth((state) => state.session);
  const completed = new Set(Object.keys(records).map(Number));
  const next = PUZZLES.find((puzzle) => !completed.has(puzzle.id));
  const focus = next ?? PUZZLES[0];
  const finishedAll = !next && PUZZLES.length > 0;
  const group = focus ? PUZZLES.filter((puzzle) => puzzle.stars === focus.stars) : [];
  const groupDone = group.filter((puzzle) => completed.has(puzzle.id)).length;
  const progressDone = finishedAll ? PUZZLES.length : groupDone;
  const progressTotal = finishedAll ? PUZZLES.length : group.length;
  const progress = progressTotal === 0 ? 0 : progressDone / progressTotal;

  function play() {
    if (focus) router.push(`/play/${focus.id}`);
    else router.push("/levels");
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobRight]} />
      <View style={[styles.blob, styles.blobBottom]} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 18 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.top}>
          <Pressable style={styles.round} onPress={() => router.push("/settings")}>
            <Ionicons name="settings-outline" size={22} color={colors.white} />
          </Pressable>
          <Pressable style={styles.round} onPress={() => router.push("/auth")}>
            <Ionicons name={session ? "person" : "person-outline"} size={22} color={colors.white} />
          </Pressable>
        </View>

        <Image source={logo} style={[styles.logo, { width: logoWidth, height: logoHeight }]} resizeMode="contain" />
        <Text style={styles.kicker}>{t("home.kicker")}</Text>
        <Text style={styles.subtitle}>{t("home.subtitle")}</Text>
        <Image source={board} style={[styles.board, { width: boardWidth, height: boardHeight }]} resizeMode="contain" />

        <Pressable style={styles.continueCard} onPress={play}>
          <View style={styles.continueTop}>
            <View style={styles.continueIcon}>
              <Ionicons name="stats-chart" size={18} color={colors.white} />
            </View>
            <View style={styles.continueCopy}>
              <Text style={styles.continueTitle}>{t("home.continue")}</Text>
              <Text style={styles.continueMeta}>
                {finishedAll
                  ? t("home.allDone")
                  : t("home.phaseMeta", { id: focus?.id ?? 1, level: levelName(focus?.stars ?? 1, t) })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8AA094" />
          </View>
          <View style={styles.progressRow}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            <Text style={styles.progressCount}>
              {progressDone}/{progressTotal}
            </Text>
          </View>
        </Pressable>

        <Pressable style={styles.play} onPress={play}>
          <Ionicons name="play" size={18} color="#163028" />
          <Text style={styles.playText}>{t("home.play")}</Text>
        </Pressable>
        <Pressable style={styles.levels} onPress={() => router.push("/levels")}>
          <Ionicons name="grid" size={16} color={colors.white} />
          <Text style={styles.levelsText}>{t("home.chooseLevel")}</Text>
        </Pressable>
        <Pressable style={styles.levels} onPress={() => router.push("/ranking")}>
          <Ionicons name="trophy" size={16} color={colors.white} />
          <Text style={styles.levelsText}>{t("home.ranking")}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#14b374",
  },
  blob: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  blobTop: {
    width: 220,
    height: 180,
    borderRadius: 90,
    top: -40,
    left: -50,
  },
  blobRight: {
    width: 160,
    height: 160,
    borderRadius: 80,
    top: 220,
    right: -60,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  blobBottom: {
    width: 240,
    height: 140,
    borderRadius: 80,
    bottom: -30,
    left: -40,
  },
  content: {
    paddingHorizontal: 22,
    flexGrow: 1,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  round: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    alignSelf: "center",
    marginTop: 4,
  },
  kicker: {
    color: colors.white,
    fontFamily: font.extra,
    fontSize: 22,
    textAlign: "center",
    marginTop: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.88)",
    fontFamily: font.semi,
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  board: {
    alignSelf: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  continueCard: {
    backgroundColor: "#F4FBF7",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 8,
  },
  continueTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  continueIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#1FA971",
    alignItems: "center",
    justifyContent: "center",
  },
  continueCopy: {
    flex: 1,
  },
  continueTitle: {
    fontFamily: font.extra,
    fontSize: 16,
    color: "#1C2430",
  },
  continueMeta: {
    fontFamily: font.semi,
    color: "#6D7C74",
    marginTop: 2,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 99,
    backgroundColor: "#E3EBE6",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#3DDC97",
  },
  progressCount: {
    fontFamily: font.bold,
    color: "#5C6B7A",
    minWidth: 36,
    textAlign: "right",
  },
  play: {
    marginTop: 14,
    backgroundColor: "#FFD84A",
    borderRadius: 28,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderBottomWidth: 5,
    borderBottomColor: "#E2A90A",
  },
  playText: {
    color: "#163028",
    fontFamily: font.extra,
    fontSize: 20,
  },
  levels: {
    marginTop: 12,
    borderRadius: 28,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.75)",
  },
  levelsText: {
    color: colors.white,
    fontFamily: font.extra,
    fontSize: 16,
  },
});
