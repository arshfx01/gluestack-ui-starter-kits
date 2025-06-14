import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { HStack } from "../ui/hstack";
import { VStack } from "../ui/vstack";
import { AnnouncementCard } from "../AnnouncementCard";
import { ArrowRight } from "lucide-react-native";
import { router } from "expo-router";

const tabs = [
  { id: "announcements", label: "Announcements" },
  { id: "timeline", label: "Timeline" },
  { id: "top", label: "Top" },
];

const AnnouncementWidget = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const renderContent = () => {
    switch (activeTab) {
      case "announcements":
        return (
          <>
            <AnnouncementCard
              id="1"
              title="Important Exam Dates Announced!"
              description="Please follow & check the official notice board for the updated mid-term examination schedule and guidelines."
              postedBy="Administration"
              postedWhen="2 hours ago"
              priority="High"
            />
            <AnnouncementCard
              id="2"
              title="Final dates for Mid-Term Exams Released"
              description="The final dates for the mid-term exams have been released. Please check the official website for details."
              postedBy="Administration"
              postedWhen="2 hours ago"
              priority="Medium"
            />
          </>
        );
      case "timeline":
        return (
          <AnnouncementCard
            id="4"
            title="Timeline Content"
            description="This is the timeline view content."
            postedBy="System"
            postedWhen="Just now"
            priority="Low"
          />
        );
      case "top":
        return (
          <AnnouncementCard
            id="3"
            title="Top Content"
            description="This is the top view content."
            postedBy="System"
            postedWhen="Just now"
            priority="Low"
          />
        );
      default:
        return null;
    }
  };

  return (
    <VStack className="w-full">
      {/* Tabs */}
      <HStack className="w-full flex border-b border-border-300 items-center justify-between">
        <HStack className="flex">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`px-3 max-w-fit py-1 ${
                activeTab === tab.id
                  ? "border-b border-background-900"
                  : "border-b border-border-300"
              }`}
              style={{
                borderBottomWidth: activeTab === tab.id ? 3 : 0,
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
              }}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                className={`text-center text-lg ${
                  activeTab === tab.id
                    ? "text-background-950 font-bold"
                    : "text-secondary-300"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </HStack>
        <TouchableOpacity
          onPress={() => router.push("/announcements")}
          className="px-2"
        >
          <ArrowRight size={20} color="#000" />
        </TouchableOpacity>
      </HStack>

      {/* Content */}
      <VStack className="py-4" space="md">
        {renderContent()}
      </VStack>
    </VStack>
  );
};

export default AnnouncementWidget;
