import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import * as Network from "expo-network";
import { Text } from "./ui/text"; // assuming Tailwind-compatible component

export default function ConnectionBanner() {
  const [isConnected, setIsConnected] = useState(true);
  const animatedValue = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const checkConnection = async () => {
      const status = await Network.getNetworkStateAsync();
      const connected =
        !!status.isConnected && status.isInternetReachable !== false;

      setIsConnected(connected);

      Animated.timing(animatedValue, {
        toValue: connected ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, []);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0],
  });

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY }] }]}
      pointerEvents={isConnected ? "none" : "auto"}
    >
      <Text className="text-black ">🔌 No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    width: "100%",
    backgroundColor: "#a2a2a2", // Tailwind red-500
    paddingVertical: 12,
    paddingTop: 20, // adjust if needed to account for status bar
    zIndex: 1000,
    alignItems: "center",
  },
});
