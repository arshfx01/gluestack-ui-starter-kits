import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { TouchableOpacity, View } from "react-native";
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
} from "@/components/ui/avatar";
import { router } from "expo-router";
import { VStack } from "./ui/vstack";
import { Text } from "./ui/text";
import { Badge, BadgeText } from "./ui/badge";
import { useAuth } from "@/app/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

// Function to hash a string and map it to an index
const hashStringToIndex = (str: string, max: number) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % max;
};

// Define an array of gradient pairs
const gradientPairs = [
  ["#d946ef", "#a855f7"], // Pink to Purple
  ["#3b82f6", "#22d3ee"], // Blue to Cyan
  ["#f97316", "#facc15"], // Orange to Yellow
  ["#10b981", "#34d399"], // Green to Light Green
  ["#ef4444", "#f87171"], // Red to Light Red
];

export const AppHeader = () => {
  const { userProfile } = useAuth();
  const userFullName = userProfile?.fullName || "Guest User";

  // Select gradient based on the user's name
  const gradientIndex = hashStringToIndex(userFullName, gradientPairs.length);
  const selectedGradient = gradientPairs[gradientIndex];

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
            <Text
              className="text-2xl tracking-wide text-typography-950"
              style={{ fontFamily: "BGSB" }}
            >
              Orbit
            </Text>
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
          <TouchableOpacity
            onPress={() => {
              router.push("/(tabs)/profile");
            }}
          >
            <Avatar
              size="md"
              className="border border-border-200 bg-transparent"
            >
              <LinearGradient
                colors={selectedGradient} // Dynamic gradient based on name
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: 9999, // Ensures the gradient is circular
                }}
              />
              <AvatarFallbackText className="text-white text-xl">
                {userFullName.charAt(0)}
              </AvatarFallbackText>
              <AvatarBadge />
            </Avatar>
          </TouchableOpacity>
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
