import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, BackHandler, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bannerVisible, showPhaseInterstitial } from "@/ads/AdService";
import { AdBanner } from "@/components/AdBanner";
import { Board } from "@/components/Board";
import { PieceShape } from "@/components/PieceShape";
import { Tray } from "@/components/Tray";
import { Tutorial } from "@/components/Tutorial";
import { WinModal } from "@/components/WinModal";
import { hideTutorialForever } from "@/services/tutorialPref";
import { cellsOf } from "@/game/logic";
import { footprint } from "@/game/pieces";
import type { PieceId } from "@/game/types";
import { useGame } from "@/hooks/useGame";
import { getPuzzle, isPuzzleUnlocked } from "@/data/puzzles";
import { useAdUnlocks } from "@/store/adUnlocks";
import { useProgress } from "@/store/progress";
import { useT } from "@/i18n";
import { useEntitlement } from "@/store/entitlement";
import { colors, font, formatTime } from "@/theme/theme";

export default function PlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlayBody key={String(id)} puzzleId={Number(id)} />;
}

function PlayBody({ puzzleId }: { puzzleId: number }) {
  const game = useGame(puzzleId);
  const progressReady = useProgress((state) => state.ready);
  const records = useProgress((state) => state.records);
  const unlocksReady = useAdUnlocks((state) => state.ready);
  const granted = useAdUnlocks((state) => state.ids);
  const t = useT();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const entitlementReady = useEntitlement((state) => state.ready);
  const adsRemoved = useEntitlement((state) => state.adsRemoved);
  const showBanner = entitlementReady && !adsRemoved && bannerVisible();
  const headerBlock = insets.top + 64;
  const bannerSpace = showBanner ? 50 + 12 + Math.max(insets.bottom, 6) : 0;
  const chrome = headerBlock + (showBanner ? 0 : insets.bottom) + bannerSpace + 56 + 36 + 148 + 36;
  const boardBudget = Math.max(240, height - chrome);
  const cell = Math.max(26, Math.floor(Math.min((width - 48) / 8, (boardBudget - 24) / 8)));
  const trayCell = Math.max(28, Math.min(46, cell - 6));
  const [preview, setPreview] = useState<{ cells: number[]; ok: boolean } | null>(null);
  const [ghost, setGhost] = useState<{ id: PieceId; x: number; y: number } | null>(null);
  const [hiddenId, setHiddenId] = useState<PieceId | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const origin = useRef({ x: 0, y: 0, size: cell * 8 });
  const screen = useRef({ x: 0, y: 0 });
  const screenView = useRef<View>(null);

  useEffect(() => {
    if (!progressReady || !unlocksReady) return;
    if (!getPuzzle(puzzleId) || !isPuzzleUnlocked(puzzleId, Object.keys(records), granted)) {
      router.replace("/levels");
    }
  }, [progressReady, unlocksReady, puzzleId, records, granted]);

  useEffect(() => {
    let alive = true;
    void showPhaseInterstitial().finally(() => {
      if (alive) game.resume();
    });
    return () => {
      alive = false;
    };
    // O anúncio abre uma vez quando a fase entra na tela. O cronômetro começa depois.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        setLeaveOpen(true);
        return true;
      });
      return () => sub.remove();
    }, []),
  );

  function anchor(id: PieceId, absX: number, absY: number) {
    const { w, h } = footprint(id, game.rotOf(id));
    const localX = absX - origin.current.x;
    const localY = absY - origin.current.y;
    const col = Math.round(localX / cell - w / 2);
    const row = Math.round(localY / cell - h / 2);
    return { row, col, w, h };
  }

  function onDrag(id: PieceId, absX: number, absY: number, phase: "start" | "move" | "end") {
    const { row, col, w, h } = anchor(id, absX, absY);
    if (phase === "start") {
      game.setSelected(id);
      setHiddenId(id);
      setDragging(true);
    }
    if (phase !== "end") {
      setPreview(game.previewAt(id, row, col));
      setGhost({
        id,
        x: absX - screen.current.x - (w * cell) / 2,
        y: absY - screen.current.y - (h * cell) / 2,
      });
      return;
    }
    const spot = game.previewAt(id, row, col);
    if (!spot?.ok) game.tryPlace(id, -1, -1);
    else game.tryPlace(id, row, col);
    setPreview(null);
    setGhost(null);
    setHiddenId(null);
    setDragging(false);
  }

  function askLeave() {
    setLeaveOpen(true);
  }

  function confirmLeave() {
    setLeaveOpen(false);
    router.replace("/");
  }

  function onBoardDrag(id: PieceId, row: number, col: number, phase: "start" | "move" | "end") {
    if (phase === "start") {
      game.setSelected(id);
      setHiddenId(id);
      setDragging(true);
    }
    if (phase !== "end") {
      setPreview(game.previewAt(id, row, col));
      return;
    }
    const spot = game.previewAt(id, row, col);
    const currentPlace = game.placed.find((piece) => piece.id === id);
    const moved = !currentPlace || currentPlace.r !== row || currentPlace.c !== col;
    if (spot?.ok && moved) game.tryPlace(id, row, col);
    setPreview(null);
    setHiddenId(null);
    setDragging(false);
  }

  function onTapCell(row: number, col: number) {
    const index = row * 8 + col;
    const occupant = game.placed.find((piece) => cellsOf(piece).includes(index));
    if (occupant) {
      game.setSelected(occupant.id);
      return;
    }
    if (!game.selected) return;
    game.tryPlace(game.selected, row, col);
  }

  if (!game.puzzle) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>{t("play.missing")}</Text>
      </View>
    );
  }

  const nextId = getPuzzle(puzzleId + 1)?.id;
  const selectedId = game.selected;
  const selectedOnBoard = selectedId !== null && game.placed.some((piece) => piece.id === selectedId);
  const canRotate = selectedId !== null && footprint(selectedId, 0).w !== footprint(selectedId, 0).h;

  return (
    <View
      ref={screenView}
      style={styles.screen}
      onLayout={() => {
        screenView.current?.measureInWindow?.((x, y) => {
          screen.current = { x, y };
        });
      }}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerSide}>
          <IconButton icon="chevron-back" onPress={askLeave} />
          <IconButton icon="help-circle-outline" onPress={() => setHelpOpen(true)} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.phase}>{t("play.phase", { id: game.puzzle.id })}</Text>
          <Text style={styles.timer}>{formatTime(game.elapsed)}</Text>
        </View>
        <View style={[styles.headerSide, styles.headerSideEnd]}>
          <IconButton icon="arrow-undo" onPress={game.undo} />
          <IconButton icon="reload" onPress={game.restart} />
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: showBanner ? 16 : insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        scrollEnabled={!dragging}
      >
        <Board
          cell={cell}
          blockers={game.puzzle.blockers}
          placed={hiddenId ? game.placed.filter((piece) => piece.id !== hiddenId) : game.placed}
          preview={preview}
          selectedId={game.selected}
          onTapCell={onTapCell}
          onDragPiece={onBoardDrag}
          onMeasure={(x, y, size) => {
            origin.current = { x, y, size };
          }}
        />

        <View style={styles.actions}>
          <ActionButton icon="refresh" label={t("play.rotate")} disabled={!canRotate} onPress={game.rotateSelected} />
          <ActionButton icon="remove-circle-outline" label={t("play.remove")} disabled={!selectedOnBoard} onPress={game.removeSelected} />
        </View>
        <Text style={styles.hint}>{t("play.hint")}</Text>
        <View style={styles.trayCard}>
          <Text style={styles.trayTitle}>{t("play.tray")}</Text>
          {game.tray.length > 0 ? (
            <Tray
              ids={game.tray}
              cell={trayCell}
              selectedId={game.selected}
              rotOf={game.rotOf}
              hiddenId={hiddenId}
              onPress={game.onTrayPress}
              onDrag={onDrag}
            />
          ) : (
            <Text style={styles.trayEmpty}>{t("play.trayEmpty")}</Text>
          )}
        </View>
      </ScrollView>

      {showBanner ? (
        <View style={[styles.adFooter, { paddingBottom: Math.max(insets.bottom, 6) }]}>
          <AdBanner size="banner" />
        </View>
      ) : null}

      {ghost ? (
        <View pointerEvents="none" style={styles.ghost}>
          <View style={{ position: "absolute", left: ghost.x, top: ghost.y }}>
            <PieceShape id={ghost.id} rot={game.rotOf(ghost.id)} cell={cell} selected />
          </View>
        </View>
      ) : null}

      <WinModal
        visible={game.won ?? false}
        timeMs={game.finalMs}
        isRecord={game.isRecord}
        stars={game.puzzle.stars}
        onLevels={() => router.replace("/levels")}
        onNext={
          nextId
            ? () => {
                router.replace(`/play/${nextId}`);
              }
            : undefined
        }
      />
      <Tutorial
        visible={helpOpen}
        onClose={() => setHelpOpen(false)}
        onNever={() => {
          setHelpOpen(false);
          void hideTutorialForever();
        }}
      />
      <Modal visible={leaveOpen} transparent animationType="fade" onRequestClose={() => setLeaveOpen(false)}>
        <View style={styles.leaveBackdrop}>
          <View style={styles.leaveCard}>
            <View style={styles.leaveBadgeWrap}>
              <View style={[styles.leaveDash, styles.leaveDashLeft]} />
              <View style={[styles.leaveDash, styles.leaveDashRight]} />
              <View style={[styles.leaveDash, styles.leaveDashFar]} />
              <View style={styles.leaveBadge}>
                <Ionicons name="exit-outline" size={30} color="#FF5C7A" />
              </View>
            </View>
            <Text style={styles.leaveTitle}>{t("play.leaveTitle")}</Text>
            <Text style={styles.leaveText}>{game.won ? t("play.leaveSaved") : t("play.leaveLose")}</Text>
            <Pressable style={styles.leaveGo} onPress={confirmLeave}>
              <Text style={styles.leaveGoText}>{t("play.leaveConfirm")}</Text>
            </Pressable>
            <Pressable style={styles.leaveStay} onPress={() => setLeaveOpen(false)}>
              <Text style={styles.leaveStayText}>{t("play.leaveStay")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function IconButton({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable style={styles.icon} onPress={onPress}>
      <Ionicons name={icon} size={22} color={colors.ink} />
    </Pressable>
  );
}

function ActionButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.action, disabled && styles.actionOff]} disabled={disabled} onPress={onPress}>
      <Ionicons name={icon} size={18} color={disabled ? "#9AA3AD" : colors.ink} />
      <Text style={[styles.actionText, disabled && styles.actionTextOff]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF6EA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#14b374",
  },
  headerSide: {
    width: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerSideEnd: {
    justifyContent: "flex-end",
    gap: 8,
  },
  titleBlock: {
    flex: 1,
    alignItems: "center",
  },
  phase: {
    fontFamily: font.bold,
    fontSize: 13,
    color: "rgba(255,255,255,0.88)",
  },
  timer: {
    fontFamily: font.extra,
    fontSize: 26,
    color: colors.white,
    marginTop: -2,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
  },
  adFooter: {
    alignItems: "center",
    backgroundColor: "#FFF6EA",
    paddingTop: 6,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: "#E7E0D4",
  },
  actionOff: {
    backgroundColor: "#F7F4EE",
  },
  actionText: {
    fontFamily: font.bold,
    color: colors.ink,
    fontSize: 16,
  },
  actionTextOff: {
    color: "#9AA3AD",
  },
  hint: {
    textAlign: "center",
    color: "#8B97A3",
    fontFamily: font.semi,
    fontSize: 14,
    marginTop: 14,
    marginHorizontal: 20,
  },
  trayCard: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#EFE6D8",
    paddingTop: 14,
    paddingBottom: 12,
  },
  trayTitle: {
    fontFamily: font.extra,
    fontSize: 16,
    color: colors.ink,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  trayEmpty: {
    fontFamily: font.semi,
    color: colors.muted,
    marginHorizontal: 16,
    marginBottom: 6,
  },
  ghost: {
    ...StyleSheet.absoluteFill,
  },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cream,
  },
  missingText: {
    fontFamily: font.bold,
    color: colors.ink,
  },
  leaveBackdrop: {
    flex: 1,
    backgroundColor: "rgba(28, 32, 38, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  leaveCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFF9F0",
    borderRadius: 28,
    paddingTop: 48,
    paddingBottom: 18,
    paddingHorizontal: 22,
    alignItems: "center",
    position: "relative",
  },
  leaveBadgeWrap: {
    position: "absolute",
    top: -32,
    left: "50%",
    marginLeft: -54,
    width: 108,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
  },
  leaveBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FFE4EC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFF9F0",
  },
  leaveDash: {
    position: "absolute",
    width: 8,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#FF8AA3",
  },
  leaveDashLeft: {
    left: 6,
    top: 22,
    transform: [{ rotate: "-32deg" }],
  },
  leaveDashRight: {
    right: 8,
    top: 10,
    transform: [{ rotate: "28deg" }],
  },
  leaveDashFar: {
    right: 0,
    top: 30,
    width: 6,
    height: 11,
    transform: [{ rotate: "18deg" }],
  },
  leaveTitle: {
    fontFamily: font.extra,
    fontSize: 26,
    color: "#1C2430",
    textAlign: "center",
  },
  leaveText: {
    fontFamily: font.semi,
    color: "#8B97A3",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 18,
    lineHeight: 22,
    fontSize: 15,
  },
  leaveGo: {
    alignSelf: "stretch",
    backgroundColor: "#14b374",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  leaveGoText: {
    color: colors.white,
    fontFamily: font.extra,
    fontSize: 16,
  },
  leaveStay: {
    alignSelf: "stretch",
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#FFF4DE",
  },
  leaveStayText: {
    color: "#1C2430",
    fontFamily: font.extra,
    fontSize: 16,
  },
});
