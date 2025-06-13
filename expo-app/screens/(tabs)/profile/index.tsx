import { Text } from "@/components/ui/text";
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Calendar, Mail, Phone, LogOut } from "lucide-react-native";
import { useAuth } from "@/app/context/AuthContext";
import { formatDistanceToNowStrict } from "date-fns";
import { auth } from "@/app/config/firebase";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
} from "@/components/ui/actionsheet";

type Props = {};

const Profile = (props: Props) => {
  const { user, userProfile } = useAuth();
  const [showLogoutSheet, setShowLogoutSheet] = React.useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const joinedAgo = user?.metadata?.creationTime
    ? formatDistanceToNowStrict(new Date(user.metadata.creationTime), {
        addSuffix: true,
      })
    : "N/A";

  const loginMethod = user?.email
    ? "Email"
    : user?.phoneNumber
    ? "Phone Number"
    : "N/A";

  const displayUserName = userProfile?.fullName || "Guest User";
  const displayRollNumber = userProfile?.rollNo || "N/A";
  const displayProfilePictureUri = userProfile?.email
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userProfile.fullName
      )}&background=random&size=256`
    : "https://img.freepik.com/free-photo/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner_1258-100541.jpg?semt=ais_hybrid&w=740";

  return (
    <VStack className="flex-1 items-center justify-center p-4 bg-white">
      <VStack space="lg" className="items-center">
        <Avatar size="2xl" className="bg-background-200">
          <AvatarFallbackText>{displayUserName.charAt(0)}</AvatarFallbackText>
          <AvatarImage
            source={{ uri: displayProfilePictureUri }}
            alt="Profile Picture"
          />
        </Avatar>

        <VStack space="xs" className="items-center">
          <Text
            className="text-3xl  text-center  text-background-950"
            style={{ fontFamily: "BGSB" }}
          >
            {displayUserName}
          </Text>
          <Text
            className="text-lg text-typography-500 tracking-tight"
            style={{ fontFamily: "BGSB" }}
          >
            Roll Number: {displayRollNumber}
          </Text>
          <HStack space="xs" className="items-center mt-2">
            <Calendar size={16} color="#6b7280" />
            <Text className="text-sm text-typography-400">
              Joined {joinedAgo}
            </Text>
          </HStack>

          {user?.email && (
            <HStack space="xs" className="items-center mt-1">
              <Mail size={16} color="#6b7280" />
              <Text className="text-sm text-typography-400">{user.email}</Text>
            </HStack>
          )}

          {user?.phoneNumber && (
            <HStack space="xs" className="items-center mt-1">
              <Phone size={16} color="#6b7280" />
              <Text className="text-sm text-typography-400">
                {user.phoneNumber}
              </Text>
            </HStack>
          )}

          <HStack space="xs" className="items-center mt-1">
            <Badge
              className="rounded-md px-2 py-[1px] bg-background-100"
              variant="outline"
              action="muted"
              size="sm"
            >
              <BadgeText className="text-xs font-bold text-primary-900">
                Logged in with {loginMethod}
              </BadgeText>
            </Badge>
          </HStack>

          <TouchableOpacity
            onPress={() => setShowLogoutSheet(true)}
            className="mt-8 flex-row items-center justify-center bg-background-500 px-6 py-3 rounded-lg"
          >
            <LogOut size={20} color="white" />
            <Text className="text-white ml-2 font-semibold">Logout</Text>
          </TouchableOpacity>
        </VStack>

        {/* Example of additional sections if needed 
        
        <View className="w-full mt-8 p-4 border border-border-200 rounded-xl bg-background-50">
          <VStack space="sm">
            <Text className="text-base font-semibold text-background-950">
              About Me
            </Text>
            <Text className="text-sm text-typography-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
          </VStack>
        </View>
                */}
      </VStack>

      <Actionsheet
        isOpen={showLogoutSheet}
        onClose={() => setShowLogoutSheet(false)}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <VStack space="md" className="justify-center w-full items-center ">
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <Text
              style={{ fontFamily: "BGSB" }}
              className="text-2xl font-semibold text-black text-center mb-2"
            >
              Confirm Logout
            </Text>
            <Text className="text-sm text-typography-600 text-center mb-6">
              Are you sure you want to logout? You will need to login again to
              access your profile and other features.
            </Text>
            <ActionsheetItem
              onPress={handleLogout}
              className="bg-error-500 rounded-lg w-full flex justify-center items-center"
            >
              <ActionsheetItemText className="text-white text-lg font-semibold text-center">
                Logout
              </ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem
              onPress={() => setShowLogoutSheet(false)}
              className="bg-backgroun0 rounded-lg w-full flex justify-center items-center"
            >
              <ActionsheetItemText className="text-lg font-semibold text-center text-background-950">
                Cancel
              </ActionsheetItemText>
            </ActionsheetItem>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </VStack>
  );
};

export default Profile;
