import { LinearGradient } from "expo-linear-gradient";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "../components/ui/Logo";
import { colors, spacing } from "../theme/theme";

// Shared chrome for the sign in / sign up / forgot password screens: a branded
// header, a back affordance, and a keyboard-aware scroll area.
const AuthShell = ({ title, subtitle, onBack, children }) => (
  <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
    <LinearGradient
      colors={["#0d1117", "#111827", "#001a33"]}
      style={StyleSheet.absoluteFill}
    />
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {onBack ? (
          <Pressable onPress={onBack} style={styles.back} hitSlop={10}>
            <Feather name="arrow-left" size={22} color={colors.textSecondary} />
          </Pressable>
        ) : null}

        <View style={styles.logoWrap}>
          <Logo size="lg" />
        </View>

        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <View style={styles.form}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
    flexGrow: 1,
  },
  back: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  logoWrap: {
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: spacing.xl,
  },
  form: { flex: 1 },
});

export default AuthShell;
