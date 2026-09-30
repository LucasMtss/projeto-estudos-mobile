export const colors = {
  cream: "#FFF6E8",
  ink: "#1C2430",
  muted: "#5C6B7A",
  green: "#1FA971",
  greenDark: "#127A4E",
  orange: "#F5A623",
  orangeDark: "#D4890C",
  card: "#FFFFFF",
  line: "#F0E2CC",
  board: "#1B2430",
  peg: "#323A44",
  ok: "#3DDC97",
  bad: "#FF5C5C",
  white: "#FFFFFF",
};

export const font = {
  extra: "Nunito_800ExtraBold",
  bold: "Nunito_700Bold",
  semi: "Nunito_600SemiBold",
};

export const levelColor = ["#22C55E", "#3B82F6", "#F5A623", "#EF4444", "#7C5CFF"];

export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
