import { LinearGradient } from "expo-linear-gradient";
import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, Text, View } from "react-native";
import { colors, gradients, radius, spacing } from "../../theme/theme";

// Wordmark used in headers and the auth screens: a gradient "droplet" mark
// alongside the Fluxion name.
export const Logo = ({ size = "md", showText = true }) => {
  const dim = size === "lg" ? 44 : size === "sm" ? 28 : 34;
  const fontSize = size === "lg" ? 24 : size === "sm" ? 16 : 20;
  return (
    <View style={styles.row}>
      <LinearGradient
        colors={gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.mark,
          { width: dim, height: dim, borderRadius: dim / 3 },
        ]}
      >
        <Feather name="droplet" size={dim * 0.5} color={colors.text} />
      </LinearGradient>
      {showText ? (
        <Text style={[styles.text, { fontSize }]}>Fluxion</Text>
      ) : null}
    </View>
  );
};

// Overlapping token circles used on pool cards (e.g. ETH / USDC).
export const TokenPair = ({ tokens = [], size = 30 }) => (
  <View style={styles.pairRow}>
    {tokens.map((token, i) => (
      <View
        key={`${token}-${i}`}
        style={[
          styles.token,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: i === 0 ? colors.brand[500] : colors.accent[500],
            marginLeft: i > 0 ? -size / 3 : 0,
            zIndex: tokens.length - i,
          },
        ]}
      >
        <Text style={[styles.tokenText, { fontSize: size * 0.4 }]}>
          {String(token).charAt(0)}
        </Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  mark: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  text: {
    color: colors.text,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  pairRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  token: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.card,
  },
  tokenText: {
    color: colors.text,
    fontWeight: "700",
  },
});

export default Logo;
