import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import AppCard from "../components/ui/AppCard";
import GradientButton from "../components/ui/GradientButton";
import Pill from "../components/ui/Pill";
import Screen from "../components/ui/Screen";
import { useAuth } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme/theme";

const SettingRow = ({ icon, label, description, right, onPress, danger }) => (
  <Pressable
    style={styles.row}
    onPress={onPress}
    disabled={!onPress}
    android_ripple={onPress ? { color: colors.gray[700] } : undefined}
  >
    <View
      style={[
        styles.rowIcon,
        danger && { backgroundColor: "rgba(239,68,68,0.12)" },
      ]}
    >
      <Feather
        name={icon}
        size={17}
        color={danger ? colors.danger : colors.brand[300]}
      />
    </View>
    <View style={styles.rowText}>
      <Text style={[styles.rowLabel, danger && { color: colors.danger }]}>
        {label}
      </Text>
      {description ? <Text style={styles.rowDesc}>{description}</Text> : null}
    </View>
    {right}
  </Pressable>
);

const SettingsScreen = () => {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(true);

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.username || "Fluxion Trader";

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Manage your account and preferences.
        </Text>
      </View>

      {/* Profile */}
      <AppCard style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.first_name || user?.email || "F").charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>
            {user?.email || "trader@fluxion.finance"}
          </Text>
        </View>
        {user?.is_demo ? <Pill label="Demo" tone="warning" /> : null}
      </AppCard>

      {/* Preferences */}
      <Text style={styles.sectionLabel}>Preferences</Text>
      <AppCard padded={false} style={styles.group}>
        <SettingRow
          icon="bell"
          label="Push Notifications"
          description="Pool and position updates"
          right={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: colors.brand[500], false: colors.gray[700] }}
              thumbColor={colors.text}
            />
          }
        />
        <View style={styles.divider} />
        <SettingRow
          icon="trending-up"
          label="Price Alerts"
          description="Synthetic asset movements"
          right={
            <Switch
              value={priceAlerts}
              onValueChange={setPriceAlerts}
              trackColor={{ true: colors.brand[500], false: colors.gray[700] }}
              thumbColor={colors.text}
            />
          }
        />
        <View style={styles.divider} />
        <SettingRow
          icon="shield"
          label="Biometric Login"
          description="Face ID / fingerprint"
          right={
            <Switch
              value={biometric}
              onValueChange={setBiometric}
              trackColor={{ true: colors.brand[500], false: colors.gray[700] }}
              thumbColor={colors.text}
            />
          }
        />
      </AppCard>

      {/* Wallet & Network */}
      <Text style={styles.sectionLabel}>Wallet & Network</Text>
      <AppCard padded={false} style={styles.group}>
        <SettingRow
          icon="credit-card"
          label="Connect Wallet"
          description="Not connected"
          right={
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          }
          onPress={() => {}}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="globe"
          label="Network"
          description="Ethereum Mainnet"
          right={
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          }
          onPress={() => {}}
        />
      </AppCard>

      {/* Support */}
      <Text style={styles.sectionLabel}>Support</Text>
      <AppCard padded={false} style={styles.group}>
        <SettingRow
          icon="help-circle"
          label="Help Center"
          right={
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          }
          onPress={() => {}}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="file-text"
          label="Terms & Privacy"
          right={
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          }
          onPress={() => {}}
        />
      </AppCard>

      <GradientButton
        label="Sign out"
        variant="outline"
        icon="log-out"
        onPress={signOut}
        style={styles.signOut}
      />

      <Text style={styles.version}>Fluxion Mobile v1.0.0</Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { marginTop: spacing.md, marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brand[500],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.text, fontSize: 22, fontWeight: "800" },
  profileInfo: { flex: 1 },
  profileName: { color: colors.text, fontSize: 17, fontWeight: "700" },
  profileEmail: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  group: { marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: "rgba(0,128,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowLabel: { color: colors.text, fontSize: 15, fontWeight: "600" },
  rowDesc: { color: colors.textSecondary, fontSize: 12, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.border },
  signOut: { marginBottom: spacing.lg },
  version: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
});

export default SettingsScreen;
