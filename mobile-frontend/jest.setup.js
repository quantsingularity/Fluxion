// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
}));

// Mock expo-constants
jest.mock("expo-constants", () => ({
  default: {
    expoConfig: null,
    manifest: null,
  },
}));

// Mock expo-modules-core EventEmitter
jest.mock("expo-modules-core", () => ({
  EventEmitter: jest.fn(),
  Subscription: jest.fn(),
}));

// Mock react-native-modal-datetime-picker so tests can drive onConfirm/onCancel
// deterministically. The real modal renders nothing inspectable and its
// onConfirm is not reachable by pressing the "Add Timestamp" button.
jest.mock("react-native-modal-datetime-picker", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ isVisible, onConfirm, onCancel }) =>
      isVisible
        ? React.createElement(
            React.Fragment,
            null,
            React.createElement(
              Pressable,
              {
                testID: "datetime-confirm",
                onPress: () => onConfirm(new Date("2024-01-01T12:00:00")),
              },
              React.createElement(Text, null, "confirm"),
            ),
            React.createElement(
              Pressable,
              {
                testID: "datetime-cancel",
                onPress: () => onCancel && onCancel(),
              },
              React.createElement(Text, null, "cancel"),
            ),
          )
        : null,
  };
});

// Mock react-native-vector-icons
jest.mock(
  "react-native-vector-icons/MaterialCommunityIcons",
  () => "MaterialCommunityIcons",
);

// Global mocks for React Native
global.__DEV__ = true;

// Silence console warnings during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Mock expo-linear-gradient with a plain View so components using it render.
jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    LinearGradient: (props) => React.createElement(View, props, props.children),
  };
});

// Mock @expo/vector-icons Feather set with a simple Text stand-in.
jest.mock("@expo/vector-icons/Feather", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ name }) => React.createElement(Text, null, name),
  };
});
