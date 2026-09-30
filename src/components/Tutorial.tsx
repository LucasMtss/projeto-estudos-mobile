import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "@/i18n";
import { colors, font } from "@/theme/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  onNever: () => void;
};

export function Tutorial({ visible, onClose, onNever }: Props) {
  const insets = useSafeAreaInsets();
  const t = useT();

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.blobLeft} />
        <View style={styles.blobRight} />
        <Pressable style={[styles.skip, { top: insets.top + 10 }]} onPress={onClose}>
          <Text style={styles.skipText}>{t("tutorial.skip")}</Text>
        </Pressable>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 58, paddingBottom: 16 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.kicker}>{t("tutorial.kicker")}</Text>
          <Text style={styles.title}>{t("tutorial.title")}</Text>
          <Text style={styles.subtitle}>{t("tutorial.subtitle")}</Text>

          <View style={styles.card}>
            <View style={styles.copy}>
              <Badge n="1" />
              <Text style={styles.cardTitle}>{t("tutorial.dragTitle")}</Text>
              <Text style={styles.cardBody}>{t("tutorial.dragBody")}</Text>
            </View>
            <DragArt />
          </View>

          <View style={styles.card}>
            <View style={styles.copy}>
              <Badge n="2" />
              <Text style={styles.cardTitle}>{t("tutorial.rotateTitle")}</Text>
              <Text style={styles.cardBody}>{t("tutorial.rotateBody")}</Text>
            </View>
            <RotateArt />
          </View>

          <View style={styles.card}>
            <View style={styles.copy}>
              <Badge n="3" />
              <Text style={styles.cardTitle}>{t("tutorial.fillTitle")}</Text>
              <Text style={styles.cardBody}>{t("tutorial.fillBody")}</Text>
            </View>
            <FillArt />
          </View>

          <View style={styles.card}>
            <View style={styles.copy}>
              <Badge n="4" />
              <Text style={styles.cardTitle}>{t("tutorial.winTitle")}</Text>
              <Text style={styles.cardBody}>{t("tutorial.winBody")}</Text>
            </View>
            <WinArt />
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
          <Pressable style={styles.done} onPress={onClose}>
            <Text style={styles.doneText}>{t("tutorial.done")}</Text>
          </Pressable>
          <Pressable style={styles.never} onPress={onNever}>
            <Text style={styles.neverText}>{t("tutorial.never")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Badge({ n }: { n: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{n}</Text>
    </View>
  );
}

function DragArt() {
  return (
    <View style={styles.dragWrap}>
      <View style={styles.miniBoard}>
        <View style={[styles.block, { left: 5, top: 5, width: 42, height: 26, backgroundColor: "#F5C518" }]} />
        <View style={[styles.block, { left: 50, top: 5, width: 10, height: 40, backgroundColor: "#F4F4F4" }]} />
        <View style={[styles.block, { left: 63, top: 5, width: 36, height: 16, backgroundColor: "#E23B3B" }]} />
        <View style={[styles.block, { left: 63, top: 24, width: 18, height: 18, backgroundColor: "#3D7BFF" }]} />
        <View style={[styles.block, { left: 5, top: 34, width: 42, height: 14, backgroundColor: "#F6D34D" }]} />
        <View style={styles.dropHint} />
      </View>
      <View style={styles.dragPiece} />
      <Ionicons name="arrow-up" size={18} color="#14b374" style={styles.dragArrow} />
    </View>
  );
}

function RotateArt() {
  return (
    <View style={styles.rotateWrap}>
      <View style={styles.rotateBar} />
      <View style={styles.rotateBadge}>
        <Ionicons name="refresh" size={18} color="#14b374" />
      </View>
      <View style={styles.rotateBarTall} />
    </View>
  );
}

function FillArt() {
  return (
    <View style={styles.fillWrap}>
      <View style={[styles.spark, { top: 0, left: 8, backgroundColor: "#3DDC97" }]} />
      <View style={[styles.spark, { top: 6, right: 4, backgroundColor: "#F25C5C" }]} />
      <View style={styles.miniBoard}>
        <View style={[styles.block, { left: 6, top: 6, width: 28, height: 22, backgroundColor: "#F5C518" }]} />
        <View style={[styles.block, { left: 36, top: 6, width: 22, height: 22, backgroundColor: "#F4F4F4" }]} />
        <View style={[styles.block, { left: 60, top: 6, width: 28, height: 22, backgroundColor: "#E23B3B" }]} />
        <View style={[styles.block, { left: 60, top: 30, width: 28, height: 22, backgroundColor: "#3D7BFF" }]} />
        <View style={[styles.block, { left: 8, top: 40, width: 48, height: 16, backgroundColor: "#F6D34D" }]} />
      </View>
    </View>
  );
}

function WinArt() {
  return (
    <View style={styles.winWrap}>
      <View style={[styles.spark, { top: 8, left: 6, backgroundColor: "#3DDC97" }]} />
      <View style={[styles.spark, { top: 4, right: 10, backgroundColor: "#3D7BFF" }]} />
      <View style={[styles.spark, { bottom: 10, left: 16, backgroundColor: "#F25C5C" }]} />
      <View style={[styles.spark, { bottom: 14, right: 8, backgroundColor: "#F5C518" }]} />
      <Ionicons name="trophy" size={58} color="#F5C518" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF6EA",
  },
  blobLeft: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(20, 179, 116, 0.08)",
    top: 40,
    left: -50,
  },
  blobRight: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(20, 179, 116, 0.06)",
    top: 120,
    right: -40,
  },
  skip: {
    position: "absolute",
    right: 16,
    zIndex: 2,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  skipText: {
    fontFamily: font.bold,
    color: "#1C2430",
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 18,
  },
  kicker: {
    textAlign: "center",
    color: "#14b374",
    fontFamily: font.extra,
    fontSize: 13,
    letterSpacing: 1.2,
  },
  title: {
    textAlign: "center",
    color: "#1C2430",
    fontFamily: font.extra,
    fontSize: 34,
    marginTop: 2,
  },
  subtitle: {
    textAlign: "center",
    color: "#8B97A3",
    fontFamily: font.semi,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 18,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  copy: {
    flex: 1,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#14b374",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  badgeText: {
    color: colors.white,
    fontFamily: font.extra,
    fontSize: 16,
  },
  cardTitle: {
    fontFamily: font.extra,
    fontSize: 20,
    color: "#1C2430",
    lineHeight: 24,
  },
  cardBody: {
    marginTop: 4,
    fontFamily: font.semi,
    fontSize: 13,
    lineHeight: 18,
    color: "#8B97A3",
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 8,
    backgroundColor: "#FFF6EA",
  },
  done: {
    backgroundColor: "#14b374",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  doneText: {
    color: colors.white,
    fontFamily: font.extra,
    fontSize: 17,
  },
  never: {
    paddingVertical: 12,
    alignItems: "center",
  },
  neverText: {
    color: "#5C6B7A",
    fontFamily: font.bold,
    fontSize: 15,
  },
  dragWrap: {
    width: 118,
    height: 112,
    position: "relative",
  },
  miniBoard: {
    width: 104,
    height: 78,
    borderRadius: 14,
    backgroundColor: "#1B2430",
    overflow: "hidden",
    position: "relative",
  },
  block: {
    position: "absolute",
    borderRadius: 5,
  },
  dropHint: {
    position: "absolute",
    left: 76,
    top: 52,
    width: 23,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#3DDC97",
  },
  dragPiece: {
    position: "absolute",
    left: 8,
    bottom: 0,
    width: 36,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#3D7BFF",
  },
  dragArrow: {
    position: "absolute",
    left: 46,
    bottom: 16,
  },
  rotateWrap: {
    width: 118,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  rotateBar: {
    width: 40,
    height: 18,
    borderRadius: 6,
    backgroundColor: "#E23B3B",
  },
  rotateBarTall: {
    width: 18,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#E23B3B",
  },
  rotateBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E7F8EF",
    alignItems: "center",
    justifyContent: "center",
  },
  fillWrap: {
    width: 118,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  winWrap: {
    width: 100,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  spark: {
    position: "absolute",
    width: 8,
    height: 12,
    borderRadius: 4,
  },
});
