import React from "react";
import { View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { router } from "expo-router";

// An example SVG — you can swap this with your own
import { LockIcon } from "lucide-react-native";

const NotLoggedIn = () => {
  return (
    <VStack
      className="flex-1 items-center justify-center p-6 space-y-4"
      space="lg"
    >
      {/* SVG icon or illustration */}
      <View className="w-40 p-6 h-40 items-center justify-center rounded-full bg-gray-200">
        <LockIcon color="#555" size={100} />
      </View>

      {/* Title */}
      <Text
        className="text-2xl text-typography-950"
        style={{ fontFamily: "BGSB" }}
      >
        Oops! You're not logged in
      </Text>

      {/* Description */}
      <Text className="text-typography-500 text-center px-4">
        Please login to view your attendance, schedules, or track your progress.
      </Text>

      {/* Call to Action */}

      <Button
        variant="solid"
        className="w-full rounded-2xl bg-[#000] h-14"
        onPress={() => router.push("/auth/splash-screen")}
      >
        <ButtonText style={{ fontFamily: "BGSB" }}>Go to Sign in</ButtonText>
      </Button>
    </VStack>
  );
};

export default NotLoggedIn;
