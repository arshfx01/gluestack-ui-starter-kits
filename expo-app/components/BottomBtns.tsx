import React from "react";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Home, QrCode, Scan, Settings } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

type Props = {};

const BottomBtns = (props: Props) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-transparent backdrop-blur-lg p-4 px-8  border-gray-200">
      <HStack className="flex items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            router.push("settings");
          }}
        >
          <Home color="#5c5c5c" size={24} />
        </TouchableOpacity>

        <Button
          className="h-14 bg-black flex gap-4 w-[70%] rounded-2xl"
          onPress={() => {
            router.push("scan");
          }}
          variant="solid"
          action="primary"
        >
          <ButtonText className="font-bold">Scan Now</ButtonText>
          <ButtonIcon>
            <Scan size={20} strokeWidth={3} color="white" />
          </ButtonIcon>
        </Button>

        <Settings color="#5c5c5c" size={24} />
      </HStack>
    </View>
  );
};

export default BottomBtns;
