import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PhaseDropdown } from "@/components/PhaseDropdown";
import { PUZZLES } from "@/data/puzzles";
import { useT } from "@/i18n";
import { fetchPhaseRanking, fetchPlayerRanking, RankingError, type PhaseRank, type PlayerRank } from "@/services/ranking";
import { useAuth } from "@/store/auth";
import { colors, font, formatTime } from "@/theme/theme";

const FIRST_ID = PUZZLES[0]?.id ?? 1;

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const t = useT();
  const session = useAuth((state) => state.session);
  const nickname = useAuth((state) => state.nickname);
  const [tab, setTab] = useState<"players" | "phases">("players");
  const [phaseId, setPhaseId] = useState(FIRST_ID);
  const [players, setPlayers] = useState<PlayerRank[]>([]);
  const [times, setTimes] = useState<PhaseRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"failed" | "unavailable" | null>(null);

  const request = useRef(0);
  const load = useCallback(async (nextPhase: number) => {
    const ticket = request.current + 1;
    request.current = ticket;
    setLoading(true);
    setError(null);
    try {
      const [playerRows, phaseRows] = await Promise.all([
        fetchPlayerRanking(),
        fetchPhaseRanking(nextPhase),
      ]);
      if (ticket !== request.current) return;
      setPlayers(playerRows);
      setTimes(phaseRows);
    } catch (caught) {
      if (ticket !== request.current) return;
      setPlayers([]);
      setTimes([]);
      setError(caught instanceof RankingError && caught.code === "unavailable" ? "unavailable" : "failed");
    } finally {
      if (ticket === request.current) setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void load(phaseId);
  }, [load, phaseId]));

  const rows = tab === "players" ? players : times;
  const notice = !session ? t("ranking.login") : nickname ? null : t("ranking.setNickname");

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>{t("ranking.title")}</Text>
        <Text style={styles.subtitle}>{t("ranking.subtitle")}</Text>
      </View>

      <View style={styles.sheet}>
        <View style={styles.tabs}>
          <TabButton active={tab === "players"} label={t("ranking.players")} onPress={() => setTab("players")} />
          <TabButton active={tab === "phases"} label={t("ranking.phases")} onPress={() => setTab("phases")} />
        </View>

        {tab === "phases" ? <PhaseDropdown value={phaseId} onChange={setPhaseId} /> : null}

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        {loading ? (
          <ActivityIndicator color="#14b374" style={styles.loader} />
        ) : error ? (
          <View style={styles.emptyBox}>
            <Text style={styles.empty}>{error === "unavailable" ? t("ranking.unavailable") : t("ranking.error")}</Text>
            <Pressable style={styles.retry} onPress={() => void load(phaseId)}>
              <Text style={styles.retryText}>{t("ranking.retry")}</Text>
            </Pressable>
          </View>
        ) : rows.length === 0 ? (
          <Text style={styles.empty}>{tab === "players" ? t("ranking.empty") : t("ranking.emptyPhase")}</Text>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
            {tab === "players"
              ? players.map((row, index) => (
                <RankRow
                  key={row.nickname}
                  place={index + 1}
                  title={row.nickname}
                  detail={t("ranking.completed", { count: row.completedCount })}
                  extra={t("ranking.total", { time: formatTime(row.totalBestMs) })}
                  mine={sameNick(row.nickname, nickname)}
                  you={t("ranking.you")}
                />
              ))
              : times.map((row, index) => (
                <RankRow
                  key={row.nickname}
                  place={index + 1}
                  title={row.nickname}
                  detail={formatTime(row.bestTimeMs)}
                  mine={sameNick(row.nickname, nickname)}
                  you={t("ranking.you")}
                />
              ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

function sameNick(left: string, right: string | null) {
  return Boolean(right) && left.toLowerCase() === right?.toLowerCase();
}

function TabButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.tab, active ? styles.tabOn : null]} onPress={onPress}>
      <Text style={[styles.tabText, active ? styles.tabTextOn : null]}>{label}</Text>
    </Pressable>
  );
}

function RankRow({
  place,
  title,
  detail,
  extra,
  mine,
  you,
}: {
  place: number;
  title: string;
  detail: string;
  extra?: string;
  mine: boolean;
  you: string;
}) {
  const medal = place === 1 ? "#F5C518" : place === 2 ? "#C5CDD6" : place === 3 ? "#E0A36A" : "#F4F1EA";
  const medalText = place <= 3 ? "#1C2430" : "#5C6B7A";
  return (
    <View style={[styles.row, mine ? styles.rowMine : null]}>
      <View style={[styles.place, { backgroundColor: medal }]}>
        <Text style={[styles.placeText, { color: medalText }]}>{place}</Text>
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.nick} numberOfLines={1}>{title}</Text>
        {extra ? <Text style={styles.extra}>{extra}</Text> : null}
      </View>
      <View style={styles.rowEnd}>
        {mine ? <Text style={styles.you}>{you}</Text> : null}
        <Text style={styles.detail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#14b374",
  },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 28,
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
    marginTop: 14,
    color: colors.white,
    fontFamily: font.extra,
    fontSize: 36,
  },
  subtitle: {
    marginTop: 4,
    color: "rgba(255,255,255,0.9)",
    fontFamily: font.semi,
    fontSize: 14,
  },
  sheet: {
    flex: 1,
    backgroundColor: "#FFF6EA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#F4EFE6",
    borderRadius: 16,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabOn: {
    backgroundColor: colors.white,
  },
  tabText: {
    fontFamily: font.bold,
    color: "#8B97A3",
    fontSize: 13,
  },
  tabTextOn: {
    color: "#1C2430",
  },
  notice: {
    fontFamily: font.semi,
    color: "#5C6B7A",
    marginBottom: 12,
    lineHeight: 18,
  },
  loader: {
    marginTop: 28,
  },
  emptyBox: {
    alignItems: "center",
  },
  empty: {
    marginTop: 18,
    textAlign: "center",
    fontFamily: font.semi,
    color: "#5C6B7A",
    lineHeight: 20,
  },
  retry: {
    marginTop: 14,
    backgroundColor: "#14b374",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.white,
    fontFamily: font.extra,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  rowMine: {
    borderWidth: 2,
    borderColor: "#14b374",
  },
  place: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  placeText: {
    fontFamily: font.extra,
    fontSize: 15,
  },
  rowCopy: {
    flex: 1,
  },
  nick: {
    fontFamily: font.extra,
    fontSize: 16,
    color: "#1C2430",
  },
  extra: {
    marginTop: 2,
    fontFamily: font.semi,
    fontSize: 12,
    color: "#8B97A3",
  },
  rowEnd: {
    alignItems: "flex-end",
  },
  you: {
    fontFamily: font.bold,
    fontSize: 11,
    color: "#0E7A4B",
    marginBottom: 2,
  },
  detail: {
    fontFamily: font.extra,
    fontSize: 14,
    color: "#1C2430",
  },
});
