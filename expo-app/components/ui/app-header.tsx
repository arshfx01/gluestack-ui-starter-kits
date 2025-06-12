import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { View } from "react-native";
import { Image } from "@/components/ui/image";
import {
  ArrowRight,
  Bell,
  Megaphone,
  MessageSquareQuote,
  QrCodeIcon,
} from "lucide-react-native";
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { VStack } from "./vstack";
import { Badge, BadgeText } from "./badge";
import { Text } from "./text";

export const AppHeader = () => {
  return (
    <VStack>
      <HStack className="flex py-4 px-4 border-b border-border-100 justify-between w-full bg-[#fff]">
        <HStack className="items-center flex gap-3">
          <View className="bg-black border-2 border-border-300 w-12 rounded-xl h-12 items-center justify-center flex overflow-hidden">
            <Image
              size="xs"
              source={{
                uri: "https://img.freepik.com/free-photo/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner_1258-100541.jpg?semt=ais_hybrid&w=740",
              }}
              alt="image"
              className="w-8 h-8 rounded-full"
            />
          </View>
          <VStack className="justify-start items-start">
            <Heading className="text-2xl font-black tracking-wide text-typography-950">
              Orb
            </Heading>
            <Badge
              className="rounded-md px-2 py-[1px]"
              variant="outline"
              action="muted"
              size="sm"
            >
              <BadgeText className="text-xs font-bold">student</BadgeText>
            </Badge>
          </VStack>
        </HStack>
        <HStack className="flex justify-end gap-3 items-center">
          <View className="flex justify-center items-center border-border-300 p-3 rounded-full border bg-background-50">
            <Bell color="#000" size={20} />
          </View>
          <View className="flex justify-center items-center border-border-300 p-3 rounded-full border bg-background-50">
            <MessageSquareQuote color="#000" size={20} />
          </View>
          <Avatar size="md">
            <AvatarFallbackText>Ar</AvatarFallbackText>
            <AvatarBadge />
          </Avatar>
        </HStack>
      </HStack>
      <HStack className="flex justify-between px-2 py-1 items-center gap-2 border-b border-border-100 bg-background-50">
        <HStack className="flex items-center gap-2">
          <Megaphone size={20} color="#a9a9a9" />
          <Text>Announcement: Mid term 2 is near!...</Text>
        </HStack>
        <ArrowRight size={20} color="#a9a9a9" />
      </HStack>
    </VStack>
  );
};
