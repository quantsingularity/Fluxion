import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { colors, gradients, radius, spacing } from "../../theme/theme";

// Primary call-to-action button using the brand gradient. A `variant="outline"`
// renders a bordered, transparent button that matches the web's secondary CTA.
const GradientButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  iconRight,
  variant = "solid",
  size = "lg",
  style,
}) => {
  const isDisabled = disabled || loading;
  const height = size === "sm" ? 40 : size === "md" ? 48 : 54;
  const fontSize = size === "sm" ? 14 : 16;

  const content = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? colors.brand[300] : colors.text}
          size="small"
        />
      ) : (
        <>
          {icon && (
            <Feather
              name={icon}
              size={fontSize + 2}
              color={variant === "outline" ? colors.brand[300] : colors.text}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.label,
              { fontSize },
              variant === "outline" && styles.outlineLabel,
            ]}
          >
            {label}
          </Text>
          {iconRight && (
            <Feather
              name={iconRight}
              size={fontSize + 2}
              color={variant === "outline" ? colors.brand[300] : colors.text}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </View>
  );

  if (variant === "outline") {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.outline,
          { height, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
          style,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        { opacity: isDisabled ? 0.6 : pressed ? 0.9 : 1 },
        style,
      ]}
    >
      <LinearGradient
        colors={gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, { height }]}
      >
        {content}
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  outline: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.brand[600],
    backgroundColor: "transparent",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.text,
    fontWeight: "700",
  },
  outlineLabel: {
    color: colors.brand[300],
  },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
});

export default GradientButton;
