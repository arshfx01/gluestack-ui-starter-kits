import React from "react";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import {
  Home,
  QrCode,
  QrCodeIcon,
  Scan,
  Settings,
  SparkleIcon,
  Sparkles,
} from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

type Props = {};

const BottomBtns = (props: Props) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-transparent backdrop-blur-lg p-4 px-6  border-gray-200">
      <HStack className="flex items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            router.push("settings");
          }}
          className=" border border-background-200 rounded-full p-4 hover:bg-background-200 flex items-center justify-center"
        >
          <Home color="#5c5c5c" size={24} />
        </TouchableOpacity>

        <Button
          className="h-14 bg-black flex gap-4 w-[60%] rounded-2xl"
          onPress={() => {
            router.push("scan");
          }}
          variant="solid"
          action="primary"
        >
          <ButtonIcon>
            <Sparkles size={18} strokeWidth={2} color="white" />
          </ButtonIcon>
          <ButtonText className="font-bold">Generate Qr</ButtonText>
          <ButtonIcon>
            <QrCodeIcon size={20} strokeWidth={2} color="white" />
          </ButtonIcon>
        </Button>
        <TouchableOpacity
          onPress={() => {
            router.push("settings");
          }}
          className=" border border-background-200 rounded-full p-4 hover:bg-background-200 flex items-center justify-center"
        >
          <Settings color="#5c5c5c" size={24} />
        </TouchableOpacity>
      </HStack>
    </View>
  );
};

export default BottomBtns;
