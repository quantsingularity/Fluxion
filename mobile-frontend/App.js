import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DarkTheme,
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Feather from "@expo/vector-icons/Feather";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import AnalyticsScreen from "./src/screens/AnalyticsScreen";
import CreatePoolScreen from "./src/screens/CreatePoolScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import HomeScreen from "./src/screens/HomeScreen";
import PoolsScreen from "./src/screens/PoolsScreen";
import PortfolioScreen from "./src/screens/PortfolioScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import SyntheticsScreen from "./src/screens/SyntheticsScreen";
import { colors, paperTheme } from "./src/theme/theme";

const RootStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const navigationRef = createNavigationContainerRef();

// Fluxion-branded dark navigation theme.
const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.brand[500],
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent[500],
  },
};

const tabIcons = {
  Dashboard: "grid",
  Pools: "droplet",
  Synthetics: "dollar-sign",
  Portfolio: "pie-chart",
  Settings: "settings",
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.brand[400],
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        height: 62,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      tabBarIcon: ({ color, size }) => (
        <Feather name={tabIcons[route.name]} size={size - 2} color={color} />
      ),
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Pools" component={PoolsScreen} />
    <Tab.Screen name="Synthetics" component={SyntheticsScreen} />
    <Tab.Screen name="Portfolio" component={PortfolioScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

// The authenticated area: tabs plus screens presented above them.
const MainNavigator = () => (
  <MainStack.Navigator screenOptions={{ headerShown: false }}>
    <MainStack.Screen name="Tabs" component={MainTabs} />
    <MainStack.Screen name="Analytics" component={AnalyticsScreen} />
    <MainStack.Screen
      name="CreatePool"
      component={CreatePoolScreen}
      options={{ presentation: "modal" }}
    />
  </MainStack.Navigator>
);

const RootNavigator = () => {
  const { isAuthenticated, initializing } = useAuth();

  // When the user signs out anywhere in the app, return them to the homepage.
  useEffect(() => {
    if (!initializing && !isAuthenticated && navigationRef.isReady()) {
      const route = navigationRef.getCurrentRoute();
      if (route && route.name !== "Home") {
        navigationRef.reset({ index: 0, routes: [{ name: "Home" }] });
      }
    }
  }, [isAuthenticated, initializing]);

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.brand[400]} />
      </View>
    );
  }

  // Home is always the entry point; users move to the authenticated stack from
  // there via sign in / sign up.
  return (
    <RootStack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <RootStack.Screen name="Home" component={HomeScreen} />
      <RootStack.Screen name="SignIn" component={SignInScreen} />
      <RootStack.Screen name="SignUp" component={SignUpScreen} />
      <RootStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
      <RootStack.Screen name="Main" component={MainNavigator} />
    </RootStack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <NavigationContainer ref={navigationRef} theme={navTheme}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
