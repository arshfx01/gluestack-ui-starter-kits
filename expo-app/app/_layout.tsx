import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/app-header";
import BottomBtns from "@/components/BottomBtns";
import "../global.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { router } from "expo-router";
import { LoadingScreen } from "@/components/LoadingScreen";
import * as NavigationBar from "expo-navigation-bar";
import { Platform } from "react-native";
import ConnectionBanner from "@/components/ConnectionBanner";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    InterMedium: require("../assets/fonts/InterTight-Medium.ttf"),
    InterSemiBold: require("../assets/fonts/InterTight-SemiBold.ttf"),
    InterBold: require("../assets/fonts/InterTight-Bold.ttf"),
    BGSB: require("../assets/fonts/BricolageGrotesqueSemiBold.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { user, loading } = useAuth();

  // This useEffect handles the navigation bar color, runs once on mount
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("white");
    }
  }, []); // Empty dependency array

  // This useEffect handles the authentication-based routing
  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth/splash-screen");
      }
    }
  }, [user, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode="light">
        <ThemeProvider value={DefaultTheme}>
          <StatusBar style="dark" />
          <SafeAreaView style={{ flex: 1 }}>
            <ConnectionBanner />
            {user && <AppHeader />}
            <Stack screenOptions={{ headerShown: false }}></Stack>
            {user && <BottomBtns />}
          </SafeAreaView>
        </ThemeProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
