import React from "react";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Pressable, TouchableOpacity, View } from "react-native";
import { Image } from "@/components/ui/image";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Filter,
  LogOut,
  Megaphone,
  MessageSquareQuote,
  QrCodeIcon,
  ShieldQuestion,
} from "lucide-react-native";
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
} from "@/components/ui/avatar";
import { router, useSegments, useLocalSearchParams } from "expo-router";
import { VStack } from "./ui/vstack";
import { Text } from "./ui/text";
import { Badge, BadgeText } from "./ui/badge";
import { useAuth } from "@/app/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { gradientPairs } from "@/constants/gradients";
import { signOut } from "firebase/auth";
import { auth } from "@/app/config/firebase";

// Function to hash a string and map it to an index
const hashStringToIndex = (str: string, max: number) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % max;
};

// Mapping for dynamic route titles
const dynamicRouteTitles: { [key: string]: string } = {
  posts: "Post Details", // For /posts/[id]
  profile: "Profile Details", // For /profile/[id]
  settings: "Settings", // For /settings/[id]
  // Add more mappings as needed
};

export const AppHeader = () => {
  const { userProfile } = useAuth();
  const userFullName = userProfile?.fullName || "Guest User";
  const segments = useSegments();
  const params = useLocalSearchParams();

  const isTabsRoute = segments[0] === "(tabs)" || segments[0] === "teacher";
  const isTeacherRoute = segments[0] === "teacher";
  const currentRouteName = segments[segments.length - 1] || "Unknown";

  // Determine user role based on route and auth
  const userRole = isTeacherRoute ? "teacher" : userProfile?.role || "student";

  let displayTitle = currentRouteName;
  if (currentRouteName === "[id]") {
    const parentRoute = segments[segments.length - 2] || "";
    displayTitle = dynamicRouteTitles[parentRoute] || "Details";
  } else {
    displayTitle = currentRouteName;
  }

  const gradientIndex = hashStringToIndex(userFullName, gradientPairs.length);
  const selectedGradient = gradientPairs[gradientIndex];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/teacher-auth" as any);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <VStack>
      <HStack className="flex py-4 px-4 border-b border-border-100 justify-between w-full bg-[#fff]">
        {isTabsRoute ? (
          // Default header for /(tabs) routes
          <>
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
                  action={isTeacherRoute ? "info" : "muted"}
                  size="sm"
                >
                  <BadgeText
                    className={`text-xs font-bold ${
                      isTeacherRoute ? "text-primary-600" : ""
                    }`}
                  >
                    {userRole}
                  </BadgeText>
                </Badge>
              </VStack>
            </HStack>
            <HStack className="flex justify-end gap-3 items-center">
              {isTeacherRoute ? (
                // Teacher header actions
                <>
                  <Pressable
                    onPress={() => {
                      router.push("/teacher/classes" as any);
                    }}
                  >
                    <View className="flex justify-center items-center border-border-300 p-3 rounded-full border bg-background-50">
                      <Bell color="#000" size={20} />
                    </View>
                  </Pressable>
                  <TouchableOpacity onPress={handleSignOut}>
                    <View className="flex justify-center items-center border-border-300 p-3 rounded-full border bg-background-50">
                      <LogOut color="#000" size={20} />
                    </View>
                  </TouchableOpacity>
                </>
              ) : (
                // Student header actions
                <>
                  <Pressable
                    onPress={() => {
                      router.push("/student/classes" as any);
                    }}
                  >
                    <View className="flex justify-center items-center border-border-300 p-3 rounded-full border bg-background-50">
                      <Bell color="#000" size={20} />
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      router.push("/teacher/dashboard" as any);
                    }}
                  >
                    <View className="flex justify-center items-center border-border-300 p-3 rounded-full border bg-background-50">
                      <MessageSquareQuote color="#000" size={20} />
                    </View>
                  </Pressable>
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
                        colors={selectedGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          borderRadius: 9999,
                        }}
                      />
                      <AvatarFallbackText className="text-white text-xl">
                        {userFullName.charAt(0)}
                      </AvatarFallbackText>
                      <AvatarBadge />
                    </Avatar>
                  </TouchableOpacity>
                </>
              )}
            </HStack>
          </>
        ) : (
          // Header for non-/(tabs) routes: Back button --- Title --- Filter icon
          <HStack className="flex justify-between items-center w-full">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex justify-center items-center border-border-300 p-3 rounded-full border bg-background-50"
            >
              <ArrowLeft color="#000" size={20} />
            </TouchableOpacity>
            <Text
              className="text-2xl text-[#000] capitalize"
              style={{ fontFamily: "BGSB" }}
            >
              {displayTitle}
            </Text>
            <TouchableOpacity className="flex justify-center items-center border-border-300 p-3 rounded-full border bg-background-50">
              <ShieldQuestion color="#a2a2a2" size={20} />
            </TouchableOpacity>
          </HStack>
        )}
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
