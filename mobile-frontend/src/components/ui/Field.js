import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { Pressable } from "react-native";
import { TextInput } from "react-native-paper";
import { colors, radius, spacing } from "../../theme/theme";

// Labeled text input built on Paper's TextInput but styled to match the web
// form fields (dark input surface, brand focus ring, optional password reveal).
const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  autoComplete,
  icon,
  error,
  style,
}) => {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        mode="outlined"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={hidden}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textColor={colors.text}
        left={
          icon ? (
            <TextInput.Icon
              icon={() => (
                <Feather name={icon} size={18} color={colors.textMuted} />
              )}
            />
          ) : undefined
        }
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={() => (
                <Pressable onPress={() => setHidden((h) => !h)}>
                  <Feather
                    name={hidden ? "eye" : "eye-off"}
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
              )}
            />
          ) : undefined
        }
        outlineColor={colors.border}
        activeOutlineColor={colors.brand[500]}
        style={styles.input}
        outlineStyle={styles.outline}
        theme={{ colors: { background: colors.surface } }}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.gray[300],
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: colors.surface,
    fontSize: 15,
  },
  outline: {
    borderRadius: radius.md,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
});

export default Field;
