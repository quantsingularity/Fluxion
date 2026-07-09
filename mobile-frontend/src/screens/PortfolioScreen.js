import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, Text, View } from "react-native";
import AppCard from "../components/ui/AppCard";
import { AreaChartMini, DonutChart } from "../components/ui/Charts";
import GradientButton from "../components/ui/GradientButton";
import Pill from "../components/ui/Pill";
import Screen from "../components/ui/Screen";
import SectionHeader from "../components/ui/SectionHeader";
import StatCard from "../components/ui/StatCard";
import {
  allocation,
  holdings,
  portfolioPerformance,
  portfolioSummary,
} from "../data/mockData";
import { colors, spacing } from "../theme/theme";

const typeTone = {
  Liquidity: "brand",
  Synthetic: "purple",
  Wallet: "neutral",
};

const PortfolioScreen = ({ navigation }) => {
  const totalAlloc = allocation.reduce((sum, a) => sum + a.value, 0);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio</Text>
        <Text style={styles.subtitle}>
          Your positions across pools and synthetic assets.
        </Text>
      </View>

      {/* Value card */}
      <AppCard style={styles.valueCard}>
        <View style={styles.valueTop}>
          <Text style={styles.valueLabel}>Total Value</Text>
          <Pill label={portfolioSummary.pnlPct} tone="success" />
        </View>
        <Text style={styles.value}>{portfolioSummary.value}</Text>
        <Text style={styles.pnl}>{portfolioSummary.pnl} all time</Text>
        <AreaChartMini data={portfolioPerformance} height={100} />
      </AppCard>

      {/* Quick stats */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Total P&L"
          value={portfolioSummary.pnl}
          change="+8.2% (24h)"
          up
          icon="trending-up"
          style={styles.statHalf}
        />
        <StatCard
          label="Est. Yearly Yield"
          value={portfolioSummary.yearlyYield}
          change="7.98% APY"
          up
          icon="pie-chart"
          style={styles.statHalf}
        />
      </View>

      {/* Allocation */}
      <AppCard style={styles.allocCard}>
        <Text style={styles.cardTitle}>Allocation</Text>
        <View style={styles.allocRow}>
          <DonutChart data={allocation} size={130} />
          <View style={styles.legend}>
            {allocation.map((item) => (
              <View key={item.name} style={styles.legendRow}>
                <View
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <Text style={styles.legendLabel} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.legendValue}>
                  {Math.round((item.value / totalAlloc) * 100)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </AppCard>

      {/* Holdings */}
      <View style={styles.block}>
        <SectionHeader
          title="Holdings"
          actionLabel="Transactions"
          onActionPress={() => navigation.navigate("Dashboard")}
        />
        <AppCard padded={false} style={styles.holdingsCard}>
          {holdings.map((h, i) => (
            <View
              key={h.asset}
              style={[styles.holdingRow, i > 0 && styles.holdingBorder]}
            >
              <View style={styles.holdingLeft}>
                <Text style={styles.holdingAsset}>{h.asset}</Text>
                <Pill
                  label={h.type}
                  tone={typeTone[h.type] || "neutral"}
                  style={styles.holdingPill}
                />
              </View>
              <View style={styles.holdingRight}>
                <Text style={styles.holdingValue}>{h.value}</Text>
                <View style={styles.holdingPnlRow}>
                  <Feather
                    name={h.up ? "arrow-up-right" : "arrow-down-right"}
                    size={12}
                    color={h.up ? colors.success : colors.danger}
                  />
                  <Text
                    style={[
                      styles.holdingPnl,
                      { color: h.up ? colors.success : colors.danger },
                    ]}
                  >
                    {h.pnl}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </AppCard>
      </View>

      <View style={styles.ctaRow}>
        <GradientButton
          label="Add Liquidity"
          variant="outline"
          style={styles.flex}
          onPress={() => navigation.navigate("Pools")}
        />
        <GradientButton
          label="Trade"
          style={styles.flex}
          onPress={() => navigation.navigate("Synthetics")}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { marginTop: spacing.md, marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  valueCard: { marginBottom: spacing.lg },
  valueTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valueLabel: { color: colors.textSecondary, fontSize: 13 },
  value: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  pnl: { color: colors.success, fontSize: 13, marginBottom: spacing.sm },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  statHalf: { width: "48.5%", marginBottom: spacing.md },
  allocCard: { marginBottom: spacing.md },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  allocRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  legend: { flex: 1, gap: spacing.sm },
  legendRow: { flexDirection: "row", alignItems: "center" },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  legendLabel: { color: colors.textSecondary, fontSize: 13, flex: 1 },
  legendValue: { color: colors.text, fontSize: 13, fontWeight: "600" },
  block: { marginTop: spacing.sm },
  holdingsCard: { padding: spacing.md },
  holdingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  holdingBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  holdingLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  holdingAsset: { color: colors.text, fontSize: 14, fontWeight: "600" },
  holdingPill: {},
  holdingRight: { alignItems: "flex-end" },
  holdingValue: { color: colors.text, fontSize: 14, fontWeight: "700" },
  holdingPnlRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  holdingPnl: { fontSize: 12, fontWeight: "600" },
  ctaRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
});

export default PortfolioScreen;
