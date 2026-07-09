import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Field from "../components/ui/Field";
import GradientButton from "../components/ui/GradientButton";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme/theme";
import AuthShell from "./AuthShell";

const SignInScreen = ({ navigation }) => {
  const { signIn, submitting } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    const result = await signIn({ email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your dashboard, pools and positions."
      onBack={() => navigation.goBack()}
    >
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Field
        label="Email address"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoComplete="email"
        icon="mail"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        icon="lock"
      />

      <Pressable
        onPress={() => navigation.navigate("ForgotPassword")}
        style={styles.forgot}
        hitSlop={8}
      >
        <Text style={styles.forgotText}>Forgot password?</Text>
      </Pressable>

      <GradientButton
        label="Sign in"
        onPress={handleSubmit}
        loading={submitting}
        style={styles.submit}
      />

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>NEW TO FLUXION</Text>
        <View style={styles.divider} />
      </View>

      <GradientButton
        label="Create an account"
        variant="outline"
        onPress={() => navigation.navigate("SignUp")}
      />
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
  forgot: { alignSelf: "flex-end", marginBottom: spacing.lg },
  forgotText: { color: colors.brand[300], fontSize: 13, fontWeight: "600" },
  submit: { marginBottom: spacing.lg },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 11, fontWeight: "600" },
});

export default SignInScreen;
