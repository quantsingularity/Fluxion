import Feather from "@expo/vector-icons/Feather";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AppCard from "../components/ui/AppCard";
import { Sparkline } from "../components/ui/Charts";
import GradientButton from "../components/ui/GradientButton";
import Pill from "../components/ui/Pill";
import Screen from "../components/ui/Screen";
import { syntheticAssets } from "../data/mockData";
import { colors, radius, spacing } from "../theme/theme";

const categories = ["All", "Stocks", "Commodities", "Forex"];

const SyntheticsScreen = () => {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return syntheticAssets.filter((asset) => {
      const matchesCat = category === "All" || asset.category === category;
      const matchesSearch =
        !search ||
        asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
        asset.name.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [category, search]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Synthetic Assets</Text>
        <Text style={styles.subtitle}>
          Trade tokenized stocks, commodities and forex, 24/7.
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Feather name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search assets"
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
        {categories.map((cat) => {
          const active = cat === category;
          return (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filtered.map((asset) => (
        <AppCard key={asset.id} style={styles.assetCard}>
          <View style={styles.assetTop}>
            <View style={styles.assetLeft}>
              <View style={styles.assetBadge}>
                <Text style={styles.assetBadgeText}>
                  {asset.symbol.replace("s", "").charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                <Text style={styles.assetName}>{asset.name}</Text>
              </View>
            </View>
            <Sparkline
              data={asset.history}
              color={asset.up ? colors.success : colors.danger}
            />
          </View>

          <View style={styles.assetBottom}>
            <View>
              <Text style={styles.assetPrice}>{asset.price}</Text>
              <View style={styles.changeRow}>
                <Feather
                  name={asset.up ? "trending-up" : "trending-down"}
                  size={13}
                  color={asset.up ? colors.success : colors.danger}
                />
                <Text
                  style={[
                    styles.change,
                    { color: asset.up ? colors.success : colors.danger },
                  ]}
                >
                  {asset.change}
                </Text>
              </View>
            </View>
            <View style={styles.assetActions}>
              <Pill label={`${asset.collateral} collateral`} tone="neutral" />
              <GradientButton
                label="Trade"
                size="sm"
                style={styles.tradeBtn}
                onPress={() => {}}
              />
            </View>
          </View>
        </AppCard>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { marginTop: spacing.md, marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
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
  assetCard: { marginBottom: spacing.md },
  assetTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assetLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  assetBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[800],
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  assetBadgeText: { color: colors.accent[400], fontWeight: "800" },
  assetSymbol: { color: colors.text, fontSize: 16, fontWeight: "700" },
  assetName: { color: colors.textSecondary, fontSize: 12 },
  assetBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: spacing.md,
  },
  assetPrice: { color: colors.text, fontSize: 20, fontWeight: "800" },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  change: { fontSize: 13, fontWeight: "600" },
  assetActions: { alignItems: "flex-end", gap: spacing.sm },
  tradeBtn: { paddingHorizontal: spacing.xl },
});

export default SyntheticsScreen;
