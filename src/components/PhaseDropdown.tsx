import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PUZZLES } from "@/data/puzzles";
import { levelName, useT } from "@/i18n";
import { colors, font } from "@/theme/theme";

const ROW = 52;

export function PhaseDropdown({
  value,
  onChange,
}: {
  value: number;
  onChange: (id: number) => void;
}) {
  const t = useT();
  const { height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const selected = PUZZLES.find((puzzle) => puzzle.id === value);
  const index = Math.max(0, PUZZLES.findIndex((puzzle) => puzzle.id === value));
  const label = `${t("ranking.phase", { id: value })}${selected ? ` • ${levelName(selected.stars, t)}` : ""}`;

  return (
    <>
      <Pressable
        style={styles.trigger}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={styles.triggerText} numberOfLines={1}>{label}</Text>
        <Ionicons name="chevron-down" size={18} color="#1C2430" />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel={t("ranking.close")} />
          <View style={[styles.menu, { maxHeight: Math.min(height * 0.62, 520) }]}>
            <Text style={styles.menuTitle}>{t("ranking.choosePhase")}</Text>
            <FlatList
              data={PUZZLES}
              keyExtractor={(item) => String(item.id)}
              initialScrollIndex={index}
              getItemLayout={(_, itemIndex) => ({ length: ROW, offset: ROW * itemIndex, index: itemIndex })}
              onScrollToIndexFailed={() => undefined}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const active = item.id === value;
                return (
                  <Pressable
                    style={[styles.option, active ? styles.optionOn : null]}
                    onPress={() => {
                      onChange(item.id);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionPhase, active ? styles.optionPhaseOn : null]}>
                      {t("ranking.phase", { id: item.id })}
                    </Text>
                    <Text style={styles.optionLevel}>{levelName(item.stars, t)}</Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  triggerText: {
    flex: 1,
    fontFamily: font.extra,
    fontSize: 16,
    color: "#1C2430",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(22, 32, 28, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  menu: {
    backgroundColor: "#FFF6EA",
    borderRadius: 22,
    paddingTop: 16,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  menuTitle: {
    fontFamily: font.extra,
    fontSize: 16,
    color: "#1C2430",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  option: {
    height: ROW,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionOn: {
    backgroundColor: "#E7F8EF",
  },
  optionPhase: {
    fontFamily: font.extra,
    fontSize: 15,
    color: "#1C2430",
  },
  optionPhaseOn: {
    color: "#0E7A4B",
  },
  optionLevel: {
    fontFamily: font.semi,
    fontSize: 13,
    color: "#8B97A3",
  },
});
