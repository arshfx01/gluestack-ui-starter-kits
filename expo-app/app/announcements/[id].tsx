import React from "react";
import { useLocalSearchParams } from "expo-router";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { HStack } from "@/components/ui/hstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react-native";
import { ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Mock data - In real app, this would come from an API or database
const announcements = {
  "1": {
    title: "Important Exam Dates Announced!",
    description:
      "Please follow & check the official notice board for the updated mid-term examination schedule and guidelines.",
    fullDescription:
      "Dear Students,\n\nWe are pleased to announce the updated schedule for the upcoming mid-term examinations. Please note the following important dates and guidelines:\n\n1. Mid-term examinations will commence from October 15th, 2023\n2. The examination schedule will be posted on the official notice board\n3. All students must carry their ID cards\n4. No electronic devices will be allowed in the examination hall\n\nPlease ensure you are well-prepared and follow all examination guidelines.\n\nBest regards,\nExamination Department",
    postedBy: "Administration",
    postedWhen: "2 hours ago",
    priority: "High",
    date: "October 10, 2023",
  },
  "2": {
    title: "Final dates for Mid-Term Exams Released",
    description:
      "The final dates for the mid-term exams have been released. Please check the official website for details.",
    fullDescription:
      "The final dates for the mid-term exams have been released. Please check the official website for details. Make sure to prepare well and follow all examination guidelines.",
    postedBy: "Administration",
    postedWhen: "2 hours ago",
    priority: "Medium",
    date: "October 9, 2023",
  },
  "3": {
    title: "Top Content",
    description: "This is the top view content.",
    fullDescription:
      "This is the detailed top view content with more information.",
    postedBy: "System",
    postedWhen: "Just now",
    priority: "Low",
    date: "October 8, 2023",
  },
  "4": {
    title: "Timeline Content",
    description: "This is the timeline view content.",
    fullDescription:
      "This is the detailed timeline view content with more information.",
    postedBy: "System",
    postedWhen: "Just now",
    priority: "Low",
    date: "October 7, 2023",
  },
  "5": {
    title: "Attendance Reminder - 12th October 2023",
    description:
      "Please ensure to mark your attendance for today's class. Failure to do so may result in a loss of attendance points.",
    fullDescription:
      "Dear Students,\n\nThis is a reminder to mark your attendance for today's classes. Please note:\n\n1. Attendance is mandatory for all classes\n2. Late attendance will be marked as absent\n3. Minimum attendance requirement is 75%\n4. Failure to maintain attendance may affect your final grades\n\nPlease ensure you mark your attendance before the end of each class.\n\nRegards,\nAdministration",
    postedBy: "System",
    postedWhen: "Just now",
    priority: "Low",
    date: "October 12, 2023",
  },
};

export default function AnnouncementDetail() {
  const { id } = useLocalSearchParams();
  const announcement = announcements[id as keyof typeof announcements];

  if (!announcement) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Announcement not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 pb-20 bg-white w-full h-sreen ">
      {/* Content */}
      <VStack className="p-4 w-full " space="md">
        {/* Title Section */}

        <VStack space="md" className="w-full">
          <Text
            className="text-3xl text-typography-900"
            style={{ fontFamily: "BGSB" }}
          >
            {announcement.title}
          </Text>
          <HStack
            className="items-center space-x-2 w-full py-2 border-b border-t border-border-200 justify-between"
            space="md"
          >
            <Badge
              variant="outline"
              action={announcement.priority === "High" ? "error" : "muted"}
              className="px-3 py-1"
            >
              <BadgeText className="font-medium">
                {announcement.priority}
              </BadgeText>
            </Badge>
            <HStack className="items-center space-x-1">
              <Calendar size={16} color="#6b7280" />
              <Text className="text-typography-500">{announcement.date}</Text>
            </HStack>
          </HStack>
        </VStack>

        {/* Description Section */}
        <View className="bg-background-50 p-4 rounded-xl">
          <Text
            className="text-typography-900 whitespace-pre-line  text-lg"
            style={{ lineHeight: 21, fontWeight: "500" }}
          >
            {announcement.fullDescription}
          </Text>
        </View>

        {/* Footer Section */}
        <View className="bg-background-50 p-4 rounded-xl">
          <HStack className="justify-between items-center">
            <HStack className="items-center space-x-2">
              <User size={16} color="#6b7280" />
              <Text className="text-typography-500">
                Posted by {announcement.postedBy}
              </Text>
            </HStack>
            <HStack className="items-center space-x-2">
              <Clock size={16} color="#6b7280" />
              <Text className="text-typography-500">
                {announcement.postedWhen}
              </Text>
            </HStack>
          </HStack>
        </View>
        <View className="w-full h-32 bg-white " />
      </VStack>
    </ScrollView>
  );
}
