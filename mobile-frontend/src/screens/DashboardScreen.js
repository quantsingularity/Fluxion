import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppCard from "../components/ui/AppCard";
import { AreaChartMini } from "../components/ui/Charts";
import { TokenPair } from "../components/ui/Logo";
import Pill from "../components/ui/Pill";
import Screen from "../components/ui/Screen";
import SectionHeader from "../components/ui/SectionHeader";
import StatCard from "../components/ui/StatCard";
import { useAuth } from "../context/AuthContext";
import {
  featuredPools,
  marketStats,
  portfolioPerformance,
  portfolioSummary,
  transactions,
} from "../data/mockData";
import { colors, radius, spacing } from "../theme/theme";

const quickActions = [
  { icon: "plus-circle", label: "Add Liquidity", target: "Pools" },
  { icon: "repeat", label: "Trade", target: "Synthetics" },
  { icon: "pie-chart", label: "Portfolio", target: "Portfolio" },
  { icon: "bar-chart-2", label: "Analytics", target: "Analytics" },
];

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const greeting = user?.first_name ? `Hi, ${user.first_name}` : "Welcome back";

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.brand[400]}
        />
      }
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtitle}>Here is your market overview.</Text>
        </View>
        <Pressable
          style={styles.bell}
          onPress={() => navigation.navigate("Settings")}
        >
          <Feather name="bell" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Portfolio value card */}
      <AppCard style={styles.portfolioCard}>
        <View style={styles.portfolioTop}>
          <Text style={styles.portfolioLabel}>Portfolio Value</Text>
          <Pill label={portfolioSummary.pnlPct} tone="success" />
        </View>
        <Text style={styles.portfolioValue}>{portfolioSummary.value}</Text>
        <Text style={styles.portfolioPnl}>{portfolioSummary.pnl} all time</Text>
        <AreaChartMini data={portfolioPerformance} height={90} />
      </AppCard>

      {/* Quick actions */}
      <View style={styles.actionsRow}>
        {quickActions.map((action) => (
          <Pressable
            key={action.label}
            style={styles.action}
            onPress={() => navigation.navigate(action.target)}
          >
            <View style={styles.actionIcon}>
              <Feather name={action.icon} size={20} color={colors.brand[400]} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Market stats */}
      <Text style={styles.blockTitle}>Market</Text>
      <View style={styles.statsGrid}>
        <StatCard
          label="Total TVL"
          value={marketStats.tvl}
          change="+12.4%"
          up
          icon="dollar-sign"
          style={styles.statHalf}
        />
        <StatCard
          label="24h Volume"
          value={marketStats.volume24h}
          change="+5.1%"
          up
          icon="activity"
          style={styles.statHalf}
        />
        <StatCard
          label="Active Pools"
          value={String(marketStats.activePools)}
          change="+8 new"
          up
          icon="droplet"
          style={styles.statHalf}
        />
        <StatCard
          label="Avg APY"
          value={marketStats.avgApy}
          change="+0.3%"
          up
          icon="trending-up"
          style={styles.statHalf}
        />
      </View>

      {/* Top pools */}
      <View style={styles.block}>
        <SectionHeader
          title="Top Pools"
          actionLabel="View all"
          onActionPress={() => navigation.navigate("Pools")}
        />
        {featuredPools.slice(0, 3).map((pool) => (
          <Pressable key={pool.id} onPress={() => navigation.navigate("Pools")}>
            <AppCard style={styles.poolRow}>
              <View style={styles.poolLeft}>
                <TokenPair tokens={pool.assets} size={28} />
                <View style={styles.poolInfo}>
                  <Text style={styles.poolName}>{pool.name}</Text>
                  <Text style={styles.poolMeta}>
                    TVL {pool.tvl} · {pool.fee}
                  </Text>
                </View>
              </View>
              <View style={styles.poolRight}>
                <Text style={styles.poolApy}>{pool.apy}</Text>
                <Text style={styles.poolApyLabel}>APY</Text>
              </View>
            </AppCard>
          </Pressable>
        ))}
      </View>

      {/* Recent activity */}
      <View style={styles.block}>
        <SectionHeader
          title="Recent Activity"
          actionLabel="See all"
          onActionPress={() => navigation.navigate("Portfolio")}
        />
        <AppCard padded={false} style={styles.activityCard}>
          {transactions.slice(0, 4).map((tx, i) => (
            <View key={tx.id} style={[styles.txRow, i > 0 && styles.txBorder]}>
              <View style={styles.txIcon}>
                <Feather
                  name={
                    tx.type === "Swap"
                      ? "repeat"
                      : tx.amount.startsWith("+")
                        ? "arrow-down-left"
                        : "arrow-up-right"
                  }
                  size={15}
                  color={colors.brand[300]}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txType}>{tx.type}</Text>
                <Text style={styles.txDetail}>{tx.detail}</Text>
              </View>
              <View style={styles.txMeta}>
                <Text
                  style={[
                    styles.txAmount,
                    {
                      color: tx.amount.startsWith("+")
                        ? colors.success
                        : colors.text,
                    },
                  ]}
                >
                  {tx.amount}
                </Text>
                <Text style={styles.txTime}>{tx.time}</Text>
              </View>
            </View>
          ))}
        </AppCard>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  greeting: { color: colors.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  bell: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  portfolioCard: { marginBottom: spacing.lg },
  portfolioTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  portfolioLabel: { color: colors.textSecondary, fontSize: 13 },
  portfolioValue: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  portfolioPnl: {
    color: colors.success,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  action: { alignItems: "center", width: "23%" },
  actionIcon: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: "center",
  },
  blockTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statHalf: { width: "48.5%", marginBottom: spacing.md },
  block: { marginTop: spacing.md },
  poolRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  poolLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  poolInfo: { justifyContent: "center" },
  poolName: { color: colors.text, fontSize: 15, fontWeight: "700" },
  poolMeta: { color: colors.textSecondary, fontSize: 12 },
  poolRight: { alignItems: "flex-end" },
  poolApy: { color: colors.success, fontSize: 17, fontWeight: "800" },
  poolApyLabel: { color: colors.textMuted, fontSize: 10 },
  activityCard: { padding: spacing.md },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  txBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  txIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: "rgba(0,128,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  txInfo: { flex: 1 },
  txType: { color: colors.text, fontSize: 14, fontWeight: "600" },
  txDetail: { color: colors.textSecondary, fontSize: 12 },
  txMeta: { alignItems: "flex-end" },
  txAmount: { fontSize: 14, fontWeight: "700" },
  txTime: { color: colors.textMuted, fontSize: 11 },
});

export default DashboardScreen;
