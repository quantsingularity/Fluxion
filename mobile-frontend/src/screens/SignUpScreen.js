import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Field from "../components/ui/Field";
import GradientButton from "../components/ui/GradientButton";
import { useAuth } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme/theme";
import AuthShell from "./AuthShell";

const passwordRules = [
  { label: "8+ characters", test: (v) => v.length >= 8 },
  { label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "Lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "A number", test: (v) => /\d/.test(v) },
  { label: "Special character", test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

const SignUpScreen = ({ navigation }) => {
  const { signUp, submitting } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const passed = useMemo(
    () => passwordRules.filter((r) => r.test(form.password)).length,
    [form.password],
  );
  const strengthPct = passed / passwordRules.length;
  const strengthColor =
    strengthPct >= 1
      ? colors.success
      : strengthPct >= 0.6
        ? colors.warning
        : colors.danger;

  const handleSubmit = async () => {
    setError("");
    if (passed < passwordRules.length) {
      setError("Please choose a stronger password.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!accept) {
      setError("You must accept the Terms and Privacy Policy.");
      return;
    }
    const result = await signUp({
      email: form.email,
      password: form.password,
      confirm_password: form.confirmPassword,
      first_name: form.firstName || undefined,
      last_name: form.lastName || undefined,
      terms_accepted: true,
      privacy_accepted: true,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join thousands of liquidity providers earning on Fluxion."
      onBack={() => navigation.goBack()}
    >
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.nameRow}>
        <Field
          label="First name"
          value={form.firstName}
          onChangeText={set("firstName")}
          placeholder="Ada"
          autoCapitalize="words"
          autoComplete="name-given"
          style={styles.half}
        />
        <Field
          label="Last name"
          value={form.lastName}
          onChangeText={set("lastName")}
          placeholder="Lovelace"
          autoCapitalize="words"
          autoComplete="name-family"
          style={styles.half}
        />
      </View>

      <Field
        label="Email address"
        value={form.email}
        onChangeText={set("email")}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoComplete="email"
        icon="mail"
      />

      <Field
        label="Password"
        value={form.password}
        onChangeText={set("password")}
        placeholder="Create a strong password"
        secureTextEntry
        icon="lock"
      />

      {form.password ? (
        <View style={styles.strengthWrap}>
          <View style={styles.strengthTrack}>
            <View
              style={[
                styles.strengthFill,
                {
                  width: `${strengthPct * 100}%`,
                  backgroundColor: strengthColor,
                },
              ]}
            />
          </View>
          <View style={styles.rulesGrid}>
            {passwordRules.map((rule) => {
              const ok = rule.test(form.password);
              return (
                <View key={rule.label} style={styles.ruleRow}>
                  <Feather
                    name={ok ? "check-circle" : "circle"}
                    size={12}
                    color={ok ? colors.success : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.ruleText,
                      { color: ok ? colors.success : colors.textMuted },
                    ]}
                  >
                    {rule.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      <Field
        label="Confirm password"
        value={form.confirmPassword}
        onChangeText={set("confirmPassword")}
        placeholder="Re-enter your password"
        secureTextEntry
        icon="lock"
        error={
          form.confirmPassword && form.confirmPassword !== form.password
            ? "Passwords do not match."
            : undefined
        }
      />

      <Pressable
        style={styles.termsRow}
        onPress={() => setAccept((a) => !a)}
        hitSlop={6}
      >
        <View style={[styles.checkbox, accept && styles.checkboxOn]}>
          {accept ? <Feather name="check" size={13} color="#fff" /> : null}
        </View>
        <Text style={styles.termsText}>
          I agree to the <Text style={styles.termsLink}>Terms of Service</Text>{" "}
          and <Text style={styles.termsLink}>Privacy Policy</Text>.
        </Text>
      </Pressable>

      <GradientButton
        label="Create account"
        onPress={handleSubmit}
        loading={submitting}
        style={styles.submit}
      />

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Pressable onPress={() => navigation.navigate("SignIn")} hitSlop={6}>
          <Text style={styles.footerLink}>Sign in</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
};

const styles = StyleSheet.create({
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { color: "#fca5a5", fontSize: 13 },
  nameRow: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1 },
  strengthWrap: { marginBottom: spacing.md, marginTop: -spacing.xs },
  strengthTrack: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.gray[700],
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  strengthFill: { height: 4, borderRadius: radius.pill },
  rulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 3,
    gap: 5,
  },
  ruleText: { fontSize: 11 },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: colors.brand[500],
    borderColor: colors.brand[500],
  },
  termsText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  termsLink: { color: colors.brand[300] },
  submit: { marginBottom: spacing.lg },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  footerText: { color: colors.textSecondary, fontSize: 14 },
  footerLink: { color: colors.brand[300], fontSize: 14, fontWeight: "700" },
});

export default SignUpScreen;
