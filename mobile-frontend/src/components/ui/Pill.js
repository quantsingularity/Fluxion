import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../theme/theme";

const toneMap = {
  brand: { bg: "rgba(0,128,255,0.15)", fg: colors.brand[300] },
  accent: { bg: "rgba(255,112,0,0.15)", fg: colors.accent[300] },
  success: { bg: "rgba(34,197,94,0.15)", fg: colors.success },
  danger: { bg: "rgba(239,68,68,0.15)", fg: colors.danger },
  warning: { bg: "rgba(234,179,8,0.15)", fg: colors.warning },
  purple: { bg: "rgba(168,85,247,0.15)", fg: colors.purple },
  neutral: { bg: "rgba(148,163,184,0.15)", fg: colors.textSecondary },
};

// Compact status/label badge with tone-based colouring.
const Pill = ({ label, tone = "brand", style }) => {
  const palette = toneMap[tone] || toneMap.brand;
  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }, style]}>
      <Text style={[styles.text, { color: palette.fg }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
  },
});

export default Pill;
