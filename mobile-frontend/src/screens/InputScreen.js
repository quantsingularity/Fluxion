import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Snackbar, useTheme } from "react-native-paper";
import { predictEnergy } from "../api/client";
import LoadingIndicator from "../components/LoadingIndicator";
import PredictionForm from "../components/PredictionForm";

const InputScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const handlePredictionSubmit = async (
    timestamps,
    meterIds,
    contextFeatures,
  ) => {
    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      // Use the predictEnergy function from our API client
      const results = await predictEnergy(
        timestamps,
        meterIds,
        contextFeatures,
      );

      // Navigate to results screen with the prediction data
      navigation.navigate("Results", { predictionData: results });
    } catch (err) {
      console.error("API Error:", err);
      setError(
        err.message ||
          "Could not fetch prediction. Please check API connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {isLoading ? (
        <LoadingIndicator message="Fetching prediction..." />
      ) : (
        <PredictionForm
          onSubmit={handlePredictionSubmit}
          isLoading={isLoading}
        />
      )}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        action={{
          label: "Dismiss",
          onPress: () => {
            setError(null);
          },
        }}
        duration={Snackbar.DURATION_LONG}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default InputScreen;
