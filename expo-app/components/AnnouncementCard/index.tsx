import React from "react";
import { View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge, BadgeText } from "@/components/ui/badge";
import {
  Megaphone,
  User,
  Clock,
  AlertTriangle,
  Info,
  Bell,
} from "lucide-react-native";

export type AnnouncementCardProps = {
  title: string;
  description: string;
  postedBy: string;
  postedWhen: string;
  priority: "High" | "Medium" | "Low";
};

export const AnnouncementCard = ({
  title,
  description,
  postedBy,
  postedWhen,
  priority,
}: AnnouncementCardProps) => {
  const getPriorityColors = () => {
    switch (priority) {
      case "High":
        return {
          badgeBg: "bg-error-100",
          badgeText: "text-error-600",
          borderColor: "border-error-300",
          icon: <AlertTriangle size={16} color="#dc2626" />,
        };
      case "Medium":
        return {
          badgeBg: "bg-warning-100",
          badgeText: "text-warning-600",
          borderColor: "border-warning-300",
          icon: <Info size={16} color="#d97706" />,
        };
      case "Low":
      default:
        return {
          badgeBg: "bg-info-100",
          badgeText: "text-info-600",
          borderColor: "border-info-300",
          icon: <Bell size={16} color="#0ea5e9" />,
        };
    }
  };

  const { badgeBg, badgeText, borderColor, icon } = getPriorityColors();

  return (
    <View className="w-full bg-background-100  border rounded-xl border-border-300">
      <VStack space="md" className="w-full">
        <HStack className="justify-between border-b border-border-300 p-3 w-full flex items-center">
          <HStack space="sm" className="items-center flex justify-start">
            <View className="p-2 rounded-lg bg-background-200">{icon}</View>
            <Text
              className="text-lg flex-1 max-w-[100%] text-[#000]"
              style={{ fontFamily: "BGSB", color: "#000" }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          </HStack>
        </HStack>

        <VStack space="md" className="px-3 pb-3">
          <Text
            className="text-sm p-1 text-typography-600"
            style={{ fontFamily: "BGSB" }}
            numberOfLines={2}
          >
            {description}
          </Text>
          <HStack className="justify-between items-center">
            <HStack space="xs" className="items-center">
              <User size={12} color="#6b7280" />
              <Text className="text-xs text-typography-400">{postedBy}</Text>
            </HStack>
            <HStack space="xs" className="items-center">
              <Clock size={12} color="#6b7280" />
              <Text className="text-xs text-typography-400">{postedWhen}</Text>
            </HStack>
          </HStack>
        </VStack>
      </VStack>
    </View>
  );
};
