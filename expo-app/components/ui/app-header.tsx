import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { View } from "react-native";
import { Image } from "@/components/ui/image";
import { QrCodeIcon } from "lucide-react-native";
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";

export const AppHeader = () => {
  return (
    <HStack className="flex py-4 px-4 border-b border-border-100 justify-between w-full bg-[#fff]">
      <HStack className="items-center flex gap-3">
        <View className="bg-[#000000] w-12 rounded-xl h-12 items-center justify-center flex overflow-hidden">
          <Image
            size="xs"
            source={{
              uri: "https://img.freepik.com/free-photo/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner_1258-100541.jpg?semt=ais_hybrid&w=740",
            }}
            alt="image"
            className="w-8 h-8 rounded-full"
          />
        </View>
        <Heading className="text-2xl font-semibold tracking-wide text-typography-950">
          Orb
        </Heading>
      </HStack>
      <HStack className="flex justify-end gap-4 items-center">
        <View className="flex justify-center items-center border-border-300 p-2.5 rounded-lg border bg-background-50">
          <QrCodeIcon color="#000" size={20} />
        </View>
        <Avatar size="md">
          <AvatarFallbackText>Ar</AvatarFallbackText>
          <AvatarBadge />
        </Avatar>
      </HStack>
    </HStack>
  );
};
