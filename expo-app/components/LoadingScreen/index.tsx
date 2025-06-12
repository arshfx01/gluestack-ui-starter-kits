import React, { useEffect } from "react";
import { View, Animated, Easing } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Image } from "@/components/ui/image";

export const LoadingScreen = () => {
  const spinValue = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Start spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Start fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: fadeAnim }],
        }}
      >
        <VStack space="lg" className="items-center">
          <View className="w-20 h-20 rounded-2xl bg-primary-50 items-center justify-center">
            <Animated.View
              style={{
                transform: [{ rotate: spin }],
              }}
            >
              <Image
                source={{
                  uri: "https://img.freepik.com/free-photo/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner_1258-100541.jpg?semt=ais_hybrid&w=740",
                }}
                alt="logo"
                className="w-12 h-12 rounded-xl"
              />
            </Animated.View>
          </View>

          <VStack space="sm" className="items-center">
            <Text className="text-2xl font-bold text-background-950">Orb</Text>
            <Text className="text-sm text-typography-400">
              Loading your experience...
            </Text>
          </VStack>

          <View className="w-32 h-1 bg-background-100 rounded-full overflow-hidden">
            <Animated.View
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#2563eb",
                transform: [
                  {
                    translateX: spinValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 100],
                    }),
                  },
                ],
              }}
            />
          </View>
        </VStack>
      </Animated.View>
    </View>
  );
};
