import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import AppCard from "../components/ui/AppCard";
import { AreaChartMini } from "../components/ui/Charts";
import GradientButton from "../components/ui/GradientButton";
import { Logo, TokenPair } from "../components/ui/Logo";
import Pill from "../components/ui/Pill";
import SectionHeader from "../components/ui/SectionHeader";
import { useAuth } from "../context/AuthContext";
import { featuredPools, tvlHistory } from "../data/mockData";
import { colors, radius, spacing } from "../theme/theme";

const features = [
  {
    icon: "droplet",
    title: "Flexible Liquidity",
    text: "Custom-weighted pools with up to 8 tokens and your own fees.",
    color: colors.brand[400],
  },
  {
    icon: "dollar-sign",
    title: "Synthetic Assets",
    text: "Trade stocks, commodities and forex on-chain, 24/7.",
    color: colors.accent[400],
  },
  {
    icon: "bar-chart-2",
    title: "Deep Analytics",
    text: "Live APY, risk and volume metrics for every position.",
    color: colors.success,
  },
  {
    icon: "shield",
    title: "Non-Custodial",
    text: "Your keys, your assets. Everything settles on-chain.",
    color: colors.purple,
  },
];

const HomeScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();

  const goPrimary = () =>
    navigation.navigate(isAuthenticated ? "Main" : "SignUp");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Logo />
          {!isAuthenticated ? (
            <GradientButton
              label="Sign in"
              variant="outline"
              size="sm"
              style={styles.signInBtn}
              onPress={() => navigation.navigate("SignIn")}
            />
          ) : null}
        </View>

        {/* Hero */}
        <LinearGradient
          colors={["#111827", "#0d1117", "#001a33"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Pill label="Next-Gen DeFi Protocol" tone="brand" />
          <Text style={styles.heroTitle}>
            The Future of{"\n"}
            <Text style={styles.heroTitleAccent}>Decentralised Liquidity</Text>
          </Text>
          <Text style={styles.heroText}>
            Provide liquidity with custom-weighted pools, mint synthetic assets,
            and earn competitive yields in one non-custodial platform.
          </Text>

          <GradientButton
            label={isAuthenticated ? "Go to Dashboard" : "Get Started"}
            iconRight="arrow-right"
            onPress={goPrimary}
            style={styles.heroCta}
          />
          {!isAuthenticated ? (
            <GradientButton
              label="I already have an account"
              variant="outline"
              onPress={() => navigation.navigate("SignIn")}
              style={styles.heroSecondary}
            />
          ) : null}

          {/* TVL card */}
          <AppCard style={styles.tvlCard}>
            <View style={styles.tvlHeader}>
              <Text style={styles.tvlLabel}>Total Value Locked</Text>
              <Pill label="+67.5%" tone="success" />
            </View>
            <Text style={styles.tvlValue}>$142.5M</Text>
            <AreaChartMini data={tvlHistory} height={110} />
          </AppCard>
        </LinearGradient>

        {/* Featured pools */}
        <View style={styles.section}>
          <SectionHeader
            title="Featured Pools"
            actionLabel={isAuthenticated ? "View all" : "Sign in"}
            onActionPress={() =>
              navigation.navigate(isAuthenticated ? "Main" : "SignIn")
            }
          />
          {featuredPools.slice(0, 3).map((pool) => (
            <AppCard key={pool.id} style={styles.poolCard}>
              <View style={styles.poolTop}>
                <View style={styles.poolLeft}>
                  <TokenPair tokens={pool.assets} />
                  <View style={styles.poolNameWrap}>
                    <Text style={styles.poolName}>{pool.name}</Text>
                    <Text style={styles.poolTvl}>TVL {pool.tvl}</Text>
                  </View>
                </View>
                <Pill
                  label={pool.type}
                  tone={pool.type === "Stable" ? "purple" : "brand"}
                />
              </View>
              <View style={styles.poolBottom}>
                <View>
                  <Text style={styles.poolApyLabel}>APY</Text>
                  <Text style={styles.poolApy}>{pool.apy}</Text>
                </View>
                <GradientButton
                  label="Add Liquidity"
                  variant="outline"
                  size="sm"
                  onPress={() =>
                    navigation.navigate(isAuthenticated ? "Main" : "SignUp")
                  }
                />
              </View>
            </AppCard>
          ))}
        </View>

        {/* Why Fluxion */}
        <View style={styles.section}>
          <Text style={styles.whyTitle}>Why Fluxion?</Text>
          <Text style={styles.whySub}>
            Everything you need for the next generation of DeFi.
          </Text>
          <View style={styles.featureGrid}>
            {features.map((f) => (
              <AppCard key={f.title} style={styles.featureCard}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: `${f.color}22` },
                  ]}
                >
                  <Feather name={f.icon} size={18} color={f.color} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </AppCard>
            ))}
          </View>
        </View>

        {/* CTA */}
        <LinearGradient
          colors={["#001a33", "#111827"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaBanner}
        >
          <Feather name="activity" size={28} color={colors.brand[400]} />
          <Text style={styles.ctaTitle}>Start earning today</Text>
          <Text style={styles.ctaText}>
            Join thousands of liquidity providers earning competitive yields. No
            minimums, no lock-ups.
          </Text>
          <GradientButton
            label={isAuthenticated ? "Open Dashboard" : "Create Free Account"}
            onPress={goPrimary}
            style={styles.ctaBtn}
          />
        </LinearGradient>

        <Text style={styles.footer}>
          © {new Date().getFullYear()} Fluxion Protocol
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  signInBtn: { paddingHorizontal: spacing.lg },
  hero: {
    margin: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    marginTop: spacing.md,
  },
  heroTitleAccent: { color: colors.brand[400] },
  heroText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.md,
  },
  heroCta: { marginTop: spacing.xl },
  heroSecondary: { marginTop: spacing.md },
  tvlCard: { marginTop: spacing.xl },
  tvlHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  tvlLabel: { color: colors.gray[300], fontWeight: "700" },
  tvlValue: {
    color: colors.brand[400],
    fontSize: 28,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  poolCard: { marginBottom: spacing.md },
  poolTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  poolLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  poolNameWrap: { justifyContent: "center" },
  poolName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  poolTvl: { color: colors.textSecondary, fontSize: 12 },
  poolBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  poolApyLabel: { color: colors.textSecondary, fontSize: 11 },
  poolApy: { color: colors.success, fontSize: 20, fontWeight: "800" },
  whyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  whySub: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: "48.5%",
    marginBottom: spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  featureTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  featureText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  ctaBanner: {
    margin: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.brand[800],
  },
  ctaTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  ctaText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  ctaBtn: { marginTop: spacing.lg, alignSelf: "stretch" },
  footer: {
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 12,
    marginTop: spacing.lg,
  },
});

export default HomeScreen;
