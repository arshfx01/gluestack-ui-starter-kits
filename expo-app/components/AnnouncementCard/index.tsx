import React from "react";
import { View, TouchableOpacity } from "react-native";
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
import { router } from "expo-router";

export type AnnouncementCardProps = {
  id: string;
  title: string;
  description: string;
  postedBy: string;
  postedWhen: string;
  priority: "High" | "Medium" | "Low";
};

export const AnnouncementCard = ({
  id,
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
    <TouchableOpacity
      onPress={() => router.push(`/announcements/${id}`)}
      className="bg-white p-4 rounded-lg border border-border-300"
    >
      <VStack space="sm">
        <Text className="text-lg font-bold">{title}</Text>
        <Text className="text-typography-600" numberOfLines={2}>
          {description}
        </Text>
        <HStack className="justify-between items-center">
          <HStack className="items-center space-x-2">
            <Badge
              variant="outline"
              action={priority === "High" ? "error" : "muted"}
            >
              <BadgeText>{priority}</BadgeText>
            </Badge>
            <Text className="text-typography-500 text-sm">
              Posted by {postedBy}
            </Text>
          </HStack>
          <Text className="text-typography-500 text-sm">{postedWhen}</Text>
        </HStack>
      </VStack>
    </TouchableOpacity>
  );
};
