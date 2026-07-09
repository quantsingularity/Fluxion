import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AppCard from "../components/ui/AppCard";
import GradientButton from "../components/ui/GradientButton";
import Screen from "../components/ui/Screen";
import { colors, radius, spacing } from "../theme/theme";

const poolTypes = [
  { key: "weighted", label: "Weighted", desc: "Custom token weights" },
  { key: "stable", label: "Stable", desc: "For pegged assets" },
];

const feeTiers = ["0.05%", "0.30%", "1.00%"];
const tokenOptions = ["ETH", "USDC", "WBTC", "DAI", "LINK", "UNI", "USDT"];

const CreatePoolScreen = ({ navigation }) => {
  const [poolType, setPoolType] = useState("weighted");
  const [fee, setFee] = useState("0.30%");
  const [tokens, setTokens] = useState([
    { symbol: "ETH", weight: "50", amount: "" },
    { symbol: "USDC", weight: "50", amount: "" },
  ]);

  const updateToken = (index, key, value) => {
    setTokens((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [key]: value } : t)),
    );
  };

  const addToken = () => {
    if (tokens.length >= 8) return;
    const remaining = tokenOptions.find(
      (o) => !tokens.some((t) => t.symbol === o),
    );
    setTokens((prev) => [
      ...prev,
      { symbol: remaining || "TKN", weight: "0", amount: "" },
    ]);
  };

  const removeToken = (index) => {
    if (tokens.length <= 2) return;
    setTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const totalWeight = tokens.reduce(
    (sum, t) => sum + (Number(t.weight) || 0),
    0,
  );
  const weightValid = totalWeight === 100;

  const handleCreate = () => {
    if (poolType === "weighted" && !weightValid) {
      Alert.alert("Invalid weights", "Token weights must add up to 100%.");
      return;
    }
    Alert.alert(
      "Pool ready",
      "Your pool configuration is valid. Connect a wallet to deploy it on-chain.",
      [{ text: "Back to Pools", onPress: () => navigation.goBack() }],
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.title}>Create Pool</Text>
        <View style={styles.spacer} />
      </View>

      {/* Pool type */}
      <Text style={styles.label}>Pool Type</Text>
      <View style={styles.typeRow}>
        {poolTypes.map((type) => {
          const active = type.key === poolType;
          return (
            <Pressable
              key={type.key}
              onPress={() => setPoolType(type.key)}
              style={[styles.typeCard, active && styles.typeCardActive]}
            >
              <Text
                style={[styles.typeLabel, active && styles.typeLabelActive]}
              >
                {type.label}
              </Text>
              <Text style={styles.typeDesc}>{type.desc}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tokens */}
      <View style={styles.tokensHeader}>
        <Text style={styles.label}>Tokens</Text>
        {poolType === "weighted" ? (
          <Text
            style={[
              styles.weightTotal,
              { color: weightValid ? colors.success : colors.warning },
            ]}
          >
            Total: {totalWeight}%
          </Text>
        ) : null}
      </View>

      {tokens.map((token, index) => (
        <AppCard key={index} style={styles.tokenCard}>
          <View style={styles.tokenRow}>
            <View style={styles.tokenBadge}>
              <Text style={styles.tokenBadgeText}>
                {token.symbol.charAt(0)}
              </Text>
            </View>
            <View style={styles.tokenSelect}>
              <Text style={styles.tokenSymbol}>{token.symbol}</Text>
              <Text style={styles.tokenHint}>Token {index + 1}</Text>
            </View>
            {tokens.length > 2 ? (
              <Pressable onPress={() => removeToken(index)} hitSlop={8}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.tokenInputs}>
            {poolType === "weighted" ? (
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Weight %</Text>
                <TextInput
                  style={styles.input}
                  value={token.weight}
                  onChangeText={(v) => updateToken(index, "weight", v)}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            ) : null}
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Initial amount</Text>
              <TextInput
                style={styles.input}
                value={token.amount}
                onChangeText={(v) => updateToken(index, "amount", v)}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        </AppCard>
      ))}

      {tokens.length < 8 ? (
        <Pressable style={styles.addToken} onPress={addToken}>
          <Feather name="plus" size={18} color={colors.brand[300]} />
          <Text style={styles.addTokenText}>Add token</Text>
        </Pressable>
      ) : null}

      {/* Fee tier */}
      <Text style={[styles.label, styles.feeLabel]}>Swap Fee</Text>
      <View style={styles.feeRow}>
        {feeTiers.map((tier) => {
          const active = tier === fee;
          return (
            <Pressable
              key={tier}
              onPress={() => setFee(tier)}
              style={[styles.feeChip, active && styles.feeChipActive]}
            >
              <Text style={[styles.feeText, active && styles.feeTextActive]}>
                {tier}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Summary */}
      <AppCard style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pool type</Text>
          <Text style={styles.summaryValue}>
            {poolType === "weighted" ? "Weighted" : "Stable"}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tokens</Text>
          <Text style={styles.summaryValue}>
            {tokens.map((t) => t.symbol).join(" / ")}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Swap fee</Text>
          <Text style={styles.summaryValue}>{fee}</Text>
        </View>
      </AppCard>

      <GradientButton
        label="Create Pool"
        icon="check"
        onPress={handleCreate}
        style={styles.create}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: "800" },
  spacer: { width: 22 },
  label: {
    color: colors.gray[300],
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  typeRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  typeCard: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.md,
  },
  typeCardActive: {
    borderColor: colors.brand[500],
    backgroundColor: "rgba(0,128,255,0.08)",
  },
  typeLabel: { color: colors.text, fontSize: 15, fontWeight: "700" },
  typeLabelActive: { color: colors.brand[300] },
  typeDesc: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  tokensHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weightTotal: { fontSize: 13, fontWeight: "700" },
  tokenCard: { marginBottom: spacing.sm },
  tokenRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  tokenBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand[500],
    alignItems: "center",
    justifyContent: "center",
  },
  tokenBadgeText: { color: colors.text, fontWeight: "700" },
  tokenSelect: { flex: 1 },
  tokenSymbol: { color: colors.text, fontSize: 15, fontWeight: "700" },
  tokenHint: { color: colors.textMuted, fontSize: 11 },
  tokenInputs: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  inputWrap: { flex: 1 },
  inputLabel: { color: colors.textMuted, fontSize: 11, marginBottom: 4 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
  },
  addToken: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  addTokenText: { color: colors.brand[300], fontWeight: "600" },
  feeLabel: { marginTop: spacing.xs },
  feeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  feeChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  feeChipActive: {
    borderColor: colors.brand[500],
    backgroundColor: "rgba(0,128,255,0.08)",
  },
  feeText: { color: colors.textSecondary, fontWeight: "700" },
  feeTextActive: { color: colors.brand[300] },
  summary: { marginBottom: spacing.lg },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryLabel: { color: colors.textSecondary, fontSize: 13 },
  summaryValue: { color: colors.text, fontSize: 13, fontWeight: "600" },
  create: { marginBottom: spacing.xl },
});

export default CreatePoolScreen;
