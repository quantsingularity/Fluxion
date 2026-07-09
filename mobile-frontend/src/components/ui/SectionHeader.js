import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme/theme";

// A titled section header with an optional right-aligned action link, used to
// group content on the Dashboard, Portfolio and other data-heavy screens.
const SectionHeader = ({ title, subtitle, actionLabel, onActionPress }) => (
  <View style={styles.row}>
    <View style={styles.flex}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {actionLabel ? (
      <Pressable onPress={onActionPress} hitSlop={8}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  flex: { flex: 1 },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  action: {
    color: colors.brand[300],
    fontSize: 13,
    fontWeight: "600",
  },
});

export default SectionHeader;
