import React, { useState, useRef } from "react";
import {
  View,
  ScrollView,
  Touchable,
  TouchableOpacity,
  PanResponder,
  Animated,
} from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import {
  Clock,
  ChevronRight,
  BookOpen,
  Users,
  MapPin,
  Video,
  InfoIcon,
  ArrowRight,
} from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Button, ButtonText } from "@/components/ui/button";
import { router } from "expo-router";

export type ClassCardProps = {
  title: string;
  time: string;
  room: string;
  instructor: string;
  type: string;
  isLive?: boolean;
  attendance?: {
    percentage: number;
    attended: number;
    missed: number;
    total: number;
    streak: number;
  };
};

export const ClassCard = ({
  title,
  time,
  room,
  instructor,
  type,
  isLive = false,
  attendance,
}: ClassCardProps) => (
  <View className="w-full mb-4  bg-white border border-border-300 rounded-xl">
    <VStack className="w-full" space="md">
      {/* Header */}
      <HStack className="flex border-border-300 p-3  border-b w-full justify-between">
        <HStack space="sm" className="items-center">
          <View className="bg-background-200 p-3 rounded-lg">
            <BookOpen size={20} color="#5c5c5c" />
          </View>
          <VStack className="px-2">
            <Text className="text-lg font-bold text-background-950">
              {title}
            </Text>
            <Text className=" text-sm font-medium text-typography-400">
              Class Count : 45
            </Text>
          </VStack>
        </HStack>
        {isLive && (
          <View className="bg-error-100 px-2 py-1 rounded-full">
            <Text className="text-error-600 text-sm font-medium">LIVE</Text>
          </View>
        )}
      </HStack>

      {/* Class Details */}
      <HStack className="flex justify-between w-full px-3">
        <VStack space="xs" className="w-full">
          <HStack
            space="md"
            className="items-center flex justify-between w-full"
          >
            <HStack space="xs" className="items-center">
              <Clock size={16} color="#5c5c5c" />
              <Text className="text-background-950">{time}</Text>
            </HStack>
            <HStack space="xs" className="items-center">
              <MapPin size={16} color="#5c5c5c" />
              <Text className="text-background-950">{room}</Text>
            </HStack>
          </HStack>

          <HStack
            space="md"
            className="items-center  flex w-full justify-between"
          >
            <HStack space="xs" className="items-center">
              <Users size={16} color="#5c5c5c" />
              <Text className="text-background-950">{instructor}</Text>
            </HStack>
            <HStack space="xs" className="items-center">
              <Video size={16} color="#5c5c5c" />
              <Text className="text-background-950">{type}</Text>
            </HStack>
          </HStack>
        </VStack>
      </HStack>

      {/* Attendance Stats */}
      {attendance && (
        <HStack className="flex border-border-300  p-3 border-t justify-between">
          <HStack className="flex gap-2">
            <Text className="px-2 py-1 max-w-fit  bg-background-100 rounded-md">
              Attended: {attendance.streak}
            </Text>

            <Text className="px-2 py-1 bg-background-100 rounded-md ">
              {attendance.missed} missed
            </Text>
          </HStack>
          <View className="flex items-center justify-center">
            <ArrowRight size={16} color="#5c5c5c" />
          </View>
        </HStack>
      )}
    </VStack>
  </View>
);

type ClassScheduleProps = {
  currentClass?: ClassCardProps;
  upcomingClasses?: ClassCardProps[];
  previousClasses?: ClassCardProps[];
  onViewAll?: () => void;
  showViewAll?: boolean;
};

type TabType = "current" | "upcoming" | "previous";

export const ClassSchedule = ({
  currentClass,
  upcomingClasses = [],
  previousClasses = [],
  onViewAll,
  showViewAll = true,
}: ClassScheduleProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("current");
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        pan.x.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = 50;
        if (Math.abs(gestureState.dx) > swipeThreshold) {
          const tabs: TabType[] = ["current", "upcoming", "previous"];
          const currentIndex = tabs.indexOf(activeTab);
          let newIndex = currentIndex;

          if (gestureState.dx > 0 && currentIndex > 0) {
            // Swipe right
            newIndex = currentIndex - 1;
          } else if (gestureState.dx < 0 && currentIndex < tabs.length - 1) {
            // Swipe left
            newIndex = currentIndex + 1;
          }

          if (newIndex !== currentIndex) {
            setActiveTab(tabs[newIndex]);
          }
        }

        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const tabs: { id: TabType; label: string }[] = [
    { id: "current", label: "Current" },
    { id: "upcoming", label: "Upcoming" },
    { id: "previous", label: "Previous" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "current":
        return currentClass ? (
          <VStack space="md">
            <HStack className="justify-between items-center">
              <HStack space="sm" className="items-center">
                <Heading className="text-lg font-medium text-background-950">
                  Current Ongoing Class
                </Heading>
              </HStack>
              <InfoIcon color="#cbcbcb" size={18} />
            </HStack>
            <ClassCard {...currentClass} />
          </VStack>
        ) : null;

      case "upcoming":
        return upcomingClasses.length > 0 ? (
          <VStack space="md">
            <HStack className="justify-between items-center">
              <HStack space="sm" className="items-center">
                <Heading className="text-lg font-medium text-background-950">
                  Upcoming Classes
                </Heading>
              </HStack>
              <InfoIcon color="#cbcbcb" size={18} />
            </HStack>
            {upcomingClasses.map((classItem, index) => (
              <ClassCard key={index} {...classItem} />
            ))}
          </VStack>
        ) : null;

      case "previous":
        return previousClasses.length > 0 ? (
          <VStack space="md">
            <HStack className="justify-between items-center">
              <HStack space="sm" className="items-center">
                <Heading className="text-lg font-medium text-background-950">
                  Previous Classes
                </Heading>
              </HStack>
              <InfoIcon color="#cbcbcb" size={18} />
            </HStack>
            {previousClasses.map((classItem, index) => (
              <ClassCard key={index} {...classItem} />
            ))}
          </VStack>
        ) : null;
    }
  };

  return (
    <VStack className="flex-1">
      {/* Tabs */}
      <HStack className="w-full border-b border-border-300">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            className={`flex-1 py-2 ${
              activeTab === tab.id
                ? "border-b border-background-900"
                : "border-b border-border-300"
            }`}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              className={`text-center ${
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

      {/* Content */}
      <Animated.View
        style={{
          transform: [{ translateX: pan.x }],
        }}
        {...panResponder.panHandlers}
      >
        <ScrollView className="flex-1">
          <VStack className="py-4" space="md">
            {renderContent()}
          </VStack>
        </ScrollView>
      </Animated.View>
    </VStack>
  );
};
