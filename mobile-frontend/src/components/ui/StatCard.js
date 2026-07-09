import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme/theme";
import AppCard from "./AppCard";

// Compact metric card: icon + label, a large value, and a coloured delta line.
const StatCard = ({ label, value, change, up = true, icon, style }) => (
  <AppCard style={[styles.card, style]}>
    <View style={styles.header}>
      {icon ? (
        <Feather name={icon} size={15} color={colors.brand[400]} />
      ) : null}
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
    <Text style={styles.value} numberOfLines={1}>
      {value}
    </Text>
    {change ? (
      <View style={styles.changeRow}>
        <Feather
          name={up ? "arrow-up-right" : "arrow-down-right"}
          size={13}
          color={up ? colors.success : colors.danger}
        />
        <Text
          style={[
            styles.change,
            { color: up ? colors.success : colors.danger },
          ]}
        >
          {change}
        </Text>
      </View>
    ) : null}
  </AppCard>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
    gap: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    flexShrink: 1,
  },
  value: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 3,
  },
  change: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default StatCard;
