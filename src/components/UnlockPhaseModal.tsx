import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { rewardedAvailable, showRewardedAd } from "@/ads/AdService";
import { useT } from "@/i18n";
import { useAdUnlocks } from "@/store/adUnlocks";
import { useEntitlement } from "@/store/entitlement";
import { colors, font } from "@/theme/theme";

export function usePhaseUnlockOffer() {
  const t = useT();
  const grant = useAdUnlocks((state) => state.grant);
  const adsRemoved = useEntitlement((state) => state.adsRemoved);
  const [phaseId, setPhaseId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function open(id: number) {
    if (busy) return;
    setError("");
    setPhaseId(id);
  }

  function close() {
    if (busy) return;
    setPhaseId(null);
    setError("");
  }

  async function watch() {
    if (phaseId === null || busy) return;
    setBusy(true);
    setError("");
    const result = await showRewardedAd();
    if (result === "earned") {
      await grant(phaseId);
      setPhaseId(null);
    } else if (result === "skipped") {
      setError(t("phases.unlockSkipped"));
    } else {
      setError(t("phases.unlockFailed"));
    }
    setBusy(false);
  }

  return {
    phaseId,
    busy,
    error,
    canWatch: !adsRemoved && rewardedAvailable(),
    open,
    close,
    watch,
  };
}

type Props = {
  phaseId: number | null;
  busy: boolean;
  error: string;
  canWatch: boolean;
  onClose: () => void;
  onWatch: () => void;
};

export function UnlockPhaseModal({ phaseId, busy, error, canWatch, onClose, onWatch }: Props) {
  const t = useT();
  return (
    <Modal visible={phaseId !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Ionicons name="lock-closed" size={28} color="#E2A90A" />
          </View>
          <Text style={styles.title}>{t("phases.unlockTitle", { id: phaseId ?? "" })}</Text>
          <Text style={styles.body}>{canWatch ? t("phases.unlockBody") : t("phases.unlockBodyOnly")}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {canWatch ? (
            <Pressable style={[styles.primary, busy && styles.primaryBusy]} disabled={busy} onPress={onWatch}>
              <Ionicons name="play-circle" size={18} color={colors.white} />
              <Text style={styles.primaryText}>{busy ? t("phases.unlockWatching") : t("phases.unlockAd")}</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.later} disabled={busy} onPress={onClose}>
            <Text style={styles.laterText}>{t("phases.unlockLater")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(18, 24, 32, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF4DE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily: font.extra,
    fontSize: 22,
    color: "#1C2430",
    textAlign: "center",
  },
  body: {
    marginTop: 8,
    fontFamily: font.semi,
    fontSize: 15,
    lineHeight: 22,
    color: "#5C6B7A",
    textAlign: "center",
  },
  error: {
    marginTop: 10,
    fontFamily: font.semi,
    color: "#B42318",
    textAlign: "center",
  },
  primary: {
    marginTop: 18,
    alignSelf: "stretch",
    backgroundColor: "#14b374",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBusy: {
    opacity: 0.7,
  },
  primaryText: {
    color: colors.white,
    fontFamily: font.extra,
    fontSize: 16,
  },
  later: {
    marginTop: 10,
    paddingVertical: 10,
  },
  laterText: {
    fontFamily: font.extra,
    color: "#5C6B7A",
    fontSize: 15,
  },
});
