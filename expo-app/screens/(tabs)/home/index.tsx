import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { View, ScrollView } from "react-native";
import { HStack } from "@/components/ui/hstack";

import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  ActivityIcon,
  CalendarIcon,
  ChevronRight,
  Eye,
  InfoIcon,
  QrCodeIcon,
  TrendingUpIcon,
} from "lucide-react-native";
import { Grid, GridItem } from "@/components/ui/grid";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { Link } from "@/components/ui/link";
import { Divider } from "@/components/ui/divider";
import { Image } from "@/components/ui/image";

import { router } from "expo-router";
import { ClassSchedule } from "@/components/ClassSchedule";
import { useAuth } from "@/app/context/AuthContext";
import { SettingsLayout } from "@/screens/settings/layout";
import { AttendanceGrowthChart } from "@/components/AttendanceGrowthChart";
import { AnnouncementCard } from "@/components/AnnouncementCard";

const Homepage = () => {
  const { userProfile } = useAuth();
  return (
    <ScrollView className="flex-1 mb-24 ">
      <VStack className="w-full items-start h-full justify- " space="xl">
        {/*
        <HStack className="w-full">
          <Alert action="muted" className="w-full rounded-xl" variant="solid">
            <AlertIcon as={InfoIcon} />
            <AlertText className="flex flex-col gap-3">
              You Missed Classes today! Please inform to respective incharge{" "}
              <Text className="text-primary-600 underline ">Now</Text>
            </AlertText>
          </Alert>
        </HStack>
        */}
        <VStack className="w-full" space="md">
          <VStack className="w-full">
            <Heading
              className="font-normal text-secondary-300 tracking-tight text-2xl"
              style={{ fontFamily: "BGSB" }}
            >
              Welcome,
            </Heading>
            <Heading
              className="font-medium text-typography-950 tracking-tight text-2xl"
              style={{ fontFamily: "BGSB" }}
            >
              {userProfile?.fullName || "Guest"}.
            </Heading>
          </VStack>
          <View className="w-full min-h-40 bg-background-100 border border-border-300 rounded-xl">
            <VStack className="w-full " space="md">
              <HStack className="flex border-border-300 p-3 border-b justify-between">
                <Text>My Attendance</Text>
                <InfoIcon color="#5c5c5c" />
              </HStack>
              <HStack className="flex p-3 justify-between">
                <VStack className="" space="md">
                  <HStack className="flex items-center gap-0">
                    <Text
                      className="text-5xl text-[#000] "
                      style={{ fontFamily: "BGSB", color: "#000" }}
                    >
                      35
                    </Text>
                    <Text
                      className="text-5xl text-[#000] "
                      style={{ fontFamily: "BGSB", color: "#b2b2b2" }}
                    >
                      %
                    </Text>
                  </HStack>
                  <HStack className="flex gap-2">
                    <Text className="">43 Attended |</Text>
                    <Text className="text-error-300 ">3 missed</Text>
                  </HStack>
                </VStack>
                <TrendingUpIcon color="#5c5c5c" />
              </HStack>

              <HStack className="flex border-border-300 p-3 border-t justify-between">
                <Text className="px-2 py-1 bg-typography-200 rounded-md">
                  Total Classes : 45
                </Text>

                <Text className="px-2 py-1 bg-typography-200 rounded-md">
                  Streak : 10 Days
                </Text>
              </HStack>
            </VStack>
          </View>
          <Grid
            className="gap- flex justify-between min-w-full"
            _extra={{
              className: "grid-cols-19  min-w-full",
            }}
          >
            <GridItem
              className="bg-background-50 rounded-xl  flex justify-start items-center w-full hover:bg-background-200 text-center"
              _extra={{
                className: "col-span-6 w-full",
              }}
            >
              <View className="p-6 border-b w-full flex justify-start items-center border-border-300 rounded-xl">
                <QrCodeIcon color="black" />
              </View>
              <Text className="p-2 text-center w-full flex justify-start items-center ">
                Scan
              </Text>
            </GridItem>
            <GridItem
              className="bg-background-50 rounded-xl  w-full hover:bg-background-200 text-center"
              _extra={{
                className: "col-span-6 w-full",
              }}
            >
              <View className="p-6 border-b w-full flex justify-start items-center border-border-300 rounded-xl">
                <ActivityIcon color="black" />
              </View>
              <Text className="p-2 text-center w-full flex justify-start items-center ">
                Analytics
              </Text>
            </GridItem>
            <GridItem
              className="bg-background-50 rounded-xl w-full  hover:bg-background-200 text-center"
              _extra={{
                className: "col-span-6 w-full",
              }}
            >
              <View className="p-6 border-b w-full flex justify-start items-center border-border-300 rounded-xl">
                <CalendarIcon color="black" />
              </View>
              <Text className="p-2 text-center w-full flex justify-start items-center ">
                History
              </Text>
            </GridItem>
          </Grid>
          <Divider />
          <HStack className="w-full flex gap-4  items-center justify-start">
            <View className="px-3 py-1 border border-border-300 bg-background-100 rounded-md ">
              <HStack className="flex gap-2  items-center">
                <Text className="text-base  font-normal text-[#000000]">
                  Announcements
                </Text>
                <Text>2</Text>
              </HStack>
            </View>
            <View className="px-3 py-1  rounded-md ">
              <Text className="text-base font-normal text-[#aeaeae]">
                Timeline
              </Text>
            </View>
            <View className="px-3 py-1  rounded-md ">
              <Text className="text-base font-normal text-[#aeaeae]">Top</Text>
            </View>
          </HStack>
          <VStack space="md" className="w-full">
            <AnnouncementCard
              title="Important Exam Dates Announced!"
              description="Please follow & check the official notice board for the updated mid-term examination schedule and guidelines."
              postedBy="Administration"
              postedWhen="2 hours ago"
              priority="High"
            />
            <AnnouncementCard
              title="Final dates for Mid-Term Exams Released"
              description="The final dates for the mid-term exams have been released. Please check the official website for details."
              postedBy="Administration"
              postedWhen="2 hours ago"
              priority="Medium"
            />
            <AnnouncementCard
              title="Due to unforeseen circumstances, the Lab Internals have been postponed."
              description="The final dates for the mid-term exams have been released. Please check the official website for details."
              postedBy="Administration"
              postedWhen="2 hours ago"
              priority="Medium"
            />
          </VStack>
        </VStack>
        <ClassSchedule
          currentClass={{
            title: "Machine Learning",
            time: "10:00 AM - 11:30 AM",
            room: "Room 302",
            instructor: "Dr. Samreen Imran",
            type: "Online",
            isLive: true,
            attendance: {
              percentage: 93,
              attended: 43,
              missed: 3,
              total: 45,
              streak: 10,
            },
          }}
          upcomingClasses={[
            {
              title: "Physics Lab",
              time: "1:00 PM - 3:00 PM",
              room: "Lab 105",
              instructor: "Prof. John Smith",
              type: "Offline",
              attendance: {
                percentage: 95,
                attended: 38,
                missed: 2,
                total: 40,
                streak: 15,
              },
            },
          ]}
          previousClasses={[
            {
              title: "Chemistry",
              time: "9:00 AM - 10:30 AM",
              room: "Room 201",
              instructor: "Dr. Michael Lee",
              type: "Online",
              attendance: {
                percentage: 90,
                attended: 36,
                missed: 4,
                total: 40,
                streak: 8,
              },
            },
          ]}
        />
      </VStack>
    </ScrollView>
  );
};

export const Home = () => {
  return <SettingsLayout children={<Homepage />} />;
};
