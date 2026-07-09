import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Field from "../components/ui/Field";
import GradientButton from "../components/ui/GradientButton";
import { useAuth } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme/theme";
import AuthShell from "./AuthShell";

const ForgotPasswordScreen = ({ navigation }) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    await forgotPassword(email);
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AuthShell title="Check your inbox" onBack={() => navigation.goBack()}>
        <View style={styles.successIcon}>
          <Feather name="check-circle" size={30} color={colors.success} />
        </View>
        <Text style={styles.successText}>
          If an account exists for <Text style={styles.email}>{email}</Text>,
          you will receive a password reset link shortly. Be sure to check your
          spam folder.
        </Text>
        <GradientButton
          label="Back to sign in"
          variant="outline"
          icon="arrow-left"
          onPress={() => navigation.navigate("SignIn")}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email tied to your account and we'll send you a reset link."
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

      <GradientButton
        label="Send reset link"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submit}
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
  submit: { marginTop: spacing.sm },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: "rgba(34,197,94,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  successText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  email: { color: colors.text, fontWeight: "700" },
});

export default ForgotPasswordScreen;
