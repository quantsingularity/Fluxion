import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../../theme/theme";

// Bordered surface card matching the web frontend's card treatment
// (gray.800 background with a subtle gray.700 border and generous radius).
const AppCard = ({ children, style, padded = true }) => (
  <View style={[styles.card, padded && styles.padded, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: {
    padding: spacing.lg,
  },
});

export default AppCard;
