import { View, Text } from "react-native";
import React from "react";
import { VStack } from "@/components/ui/vstack";
import { AnnouncementCard } from "@/components/AnnouncementCard";

const Announcements = () => {
  return (
    <VStack className=" items-center p-3  bg-white w-full h-full" space="md">
      <AnnouncementCard
        id="5"
        title="Attendance Reminder - 12th October 2023  "
        description="Please ensure to mark your attendance for today's class. Failure to do so may result in a loss of attendance points."
        postedBy="System"
        postedWhen="Just now"
        priority="Low"
      />
    </VStack>
  );
};

export default Announcements;
