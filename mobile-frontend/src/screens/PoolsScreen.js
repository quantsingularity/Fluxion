import Feather from "@expo/vector-icons/Feather";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { fetchPools } from "../api/client";
import AppCard from "../components/ui/AppCard";
import GradientButton from "../components/ui/GradientButton";
import { TokenPair } from "../components/ui/Logo";
import Pill from "../components/ui/Pill";
import Screen from "../components/ui/Screen";
import { featuredPools } from "../data/mockData";
import { colors, radius, spacing } from "../theme/theme";

const filters = ["All", "Weighted", "Stable", "Low Risk"];

// Normalise a backend pool record into the shape the card expects, tolerating
// missing fields so live and demo data render identically.
const normalizePool = (pool, index) => ({
  id: pool.id || pool.address || `pool-${index}`,
  name:
    pool.name || (pool.assets ? pool.assets.join("-") : `Pool ${index + 1}`),
  assets: pool.assets || pool.tokens || ["TKN", "TKN"],
  apy: pool.apy ? `${Number(pool.apy).toFixed(1)}%` : "-",
  tvl: pool.tvl || pool.total_value_locked || "-",
  volume24h: pool.volume24h || pool.volume_24h || "-",
  fee: pool.fee || pool.swap_fee || "0.30%",
  type: pool.type || "Weighted",
  risk: pool.risk || "Medium",
  utilization: pool.utilization ?? 60,
});

const riskTone = { Low: "success", Medium: "warning", High: "danger" };

const PoolsScreen = ({ navigation }) => {
  const [pools, setPools] = useState(featuredPools);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await fetchPools();
      if (Array.isArray(data) && data.length) {
        setPools(data.map(normalizePool));
      }
    } catch {
      setPools(featuredPools);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    return pools.filter((pool) => {
      const matchesSearch =
        !search || pool.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Low Risk"
          ? pool.risk === "Low"
          : pool.type === activeFilter);
      return matchesSearch && matchesFilter;
    });
  }, [pools, search, activeFilter]);

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
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={styles.title}>Liquidity Pools</Text>
          <Text style={styles.subtitle}>
            Provide liquidity and earn trading fees.
          </Text>
        </View>
        <Pressable
          style={styles.createBtn}
          onPress={() => navigation.navigate("CreatePool")}
        >
          <Feather name="plus" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <Feather name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pools"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        {filters.map((filter) => {
          const active = filter === activeFilter;
          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filtered.map((pool) => (
        <AppCard key={pool.id} style={styles.poolCard}>
          <View style={styles.poolTop}>
            <View style={styles.poolLeft}>
              <TokenPair tokens={pool.assets} />
              <View style={styles.poolNameWrap}>
                <Text style={styles.poolName}>{pool.name}</Text>
                <View style={styles.tagRow}>
                  <Pill
                    label={pool.type}
                    tone={pool.type === "Stable" ? "purple" : "brand"}
                  />
                  <Pill
                    label={pool.risk}
                    tone={riskTone[pool.risk] || "neutral"}
                  />
                </View>
              </View>
            </View>
            <View style={styles.apyWrap}>
              <Text style={styles.apy}>{pool.apy}</Text>
              <Text style={styles.apyLabel}>APY</Text>
            </View>
          </View>

          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>TVL</Text>
              <Text style={styles.metricValue}>{pool.tvl}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>24h Vol</Text>
              <Text style={styles.metricValue}>{pool.volume24h}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Fee</Text>
              <Text style={styles.metricValue}>{pool.fee}</Text>
            </View>
          </View>

          <View style={styles.utilRow}>
            <Text style={styles.utilLabel}>Utilization</Text>
            <Text style={styles.utilValue}>{pool.utilization}%</Text>
          </View>
          <View style={styles.utilTrack}>
            <View
              style={[styles.utilFill, { width: `${pool.utilization}%` }]}
            />
          </View>

          <View style={styles.actions}>
            <GradientButton
              label="Add Liquidity"
              size="sm"
              style={styles.flex}
              onPress={() => navigation.navigate("CreatePool")}
            />
            <GradientButton
              label="Details"
              variant="outline"
              size="sm"
              style={styles.detailBtn}
              onPress={() => navigation.navigate("CreatePool")}
            />
          </View>
        </AppCard>
      ))}

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="inbox" size={28} color={colors.textMuted} />
          <Text style={styles.emptyText}>No pools match your filters.</Text>
        </View>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  createBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: 10,
    fontSize: 15,
  },
  chipsRow: { marginBottom: spacing.lg },
  chipsContent: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.brand[500],
    borderColor: colors.brand[500],
  },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: colors.text },
  poolCard: { marginBottom: spacing.md },
  poolTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  poolLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  poolNameWrap: { flex: 1 },
  poolName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  tagRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  apyWrap: { alignItems: "flex-end" },
  apy: { color: colors.success, fontSize: 20, fontWeight: "800" },
  apyLabel: { color: colors.textMuted, fontSize: 10 },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  metric: { flex: 1 },
  metricLabel: { color: colors.textMuted, fontSize: 11 },
  metricValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  utilRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  utilLabel: { color: colors.textMuted, fontSize: 11 },
  utilValue: { color: colors.textSecondary, fontSize: 11, fontWeight: "600" },
  utilTrack: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.gray[700],
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  utilFill: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.brand[500],
  },
  actions: { flexDirection: "row", gap: spacing.sm },
  detailBtn: { paddingHorizontal: spacing.lg },
  empty: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: { color: colors.textMuted },
});

export default PoolsScreen;
