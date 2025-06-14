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
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { HomeIcon } from "./HomeIcon";

type Props = {};

const BottomBtns = (props: Props) => {
  return (
    <LinearGradient
      colors={["transparent", "#FFFFFF", "#FFFFFF"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      className="absolute  bottom-0 left-0 right-0  px-6 "
    >
      <HStack className="flex items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            router.push("/(tabs)");
          }}
          className=" bg-white/50 border border-background-200 rounded-full p-4 hover:bg-background-200 flex items-center justify-center"
        >
          <HomeIcon color="#5c5c5c" width={24} height={24} />
        </TouchableOpacity>

        <Button
          className="h-14 bg-black flex gap-4 w-[60%] rounded-2xl"
          onPress={() => {
            router.push("/scan");
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
            router.push("/settings");
          }}
          className="bg-white-50 border border-background-200 rounded-full p-4 hover:bg-background-200 flex items-center justify-center"
        >
          <Settings color="#5c5c5c" size={24} />
        </TouchableOpacity>
      </HStack>
    </LinearGradient>
  );
};

export default BottomBtns;
