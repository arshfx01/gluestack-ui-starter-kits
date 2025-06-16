import React, { useEffect, useState, useCallback } from "react";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { View, ScrollView, RefreshControl } from "react-native";
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
  LockIcon,
  QrCodeIcon,
  TrendingUpIcon,
} from "lucide-react-native";
import { Grid, GridItem } from "@/components/ui/grid";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { Link } from "@/components/ui/link";
import { Divider } from "@/components/ui/divider";
import { Image } from "@/components/ui/image";

import { router, useRouter } from "expo-router";
import { ClassSchedule } from "@/components/ClassSchedule";
import { useAuth } from "@/app/context/AuthContext";
import { SettingsLayout } from "@/screens/settings/layout";
import { AttendanceGrowthChart } from "@/components/AttendanceGrowthChart";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import AnnouncementWidget from "@/components/AnnouncementsWidget";
import { Pressable } from "@/components/ui/pressable";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";

interface AttendanceStats {
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  attendancePercentage: number;
  currentStreak: number;
}

interface AttendanceRecord {
  date: string;
  present: string[];
  classId: string;
  startTime: string;
  endTime: string;
}

interface ClassData {
  id: string;
  name: string;
  subject: string;
  students: string[];
  schedule?: {
    day?: string;
    time?: string;
    room?: string;
  } | null;
}

const Homepage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AttendanceStats>({
    totalClasses: 0,
    attendedClasses: 0,
    missedClasses: 0,
    attendancePercentage: 0,
    currentStreak: 0,
  });

  const fetchAttendanceStats = async () => {
    if (!user) return;

    try {
      // Get all classes the student is enrolled in
      const classesQuery = query(
        collection(db, "classes"),
        where("students", "array-contains", user.uid)
      );
      const classesSnap = await getDocs(classesQuery);
      const classesData = classesSnap.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as ClassData)
      );

      console.log(
        "Enrolled Classes:",
        classesData.map((c) => ({ id: c.id, name: c.name }))
      );

      if (classesData.length === 0) {
        setStats({
          totalClasses: 0,
          attendedClasses: 0,
          missedClasses: 0,
          attendancePercentage: 0,
          currentStreak: 0,
        });
        return;
      }

      let totalClasses = 0;
      let attendedClasses = 0;
      let currentStreak = 0;
      let tempStreak = 0;
      let lastDate: string | null = null;

      // Process each class
      for (const classData of classesData) {
        // Get all attendance records for this class
        const attendanceQuery = query(
          collection(db, "attendance"),
          where("classId", "==", classData.id)
        );
        const attendanceSnap = await getDocs(attendanceQuery);

        console.log(
          `Class ${classData.name} has ${attendanceSnap.docs.length} attendance records`
        );

        // Process attendance records for this class
        const sortedAttendance = attendanceSnap.docs
          .map((doc) => doc.data() as AttendanceRecord)
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        sortedAttendance.forEach((record) => {
          if (record.present && Array.isArray(record.present)) {
            totalClasses++;

            if (record.present.includes(user.uid)) {
              attendedClasses++;

              // Calculate streak
              const currentDate = record.date;
              if (lastDate) {
                const lastDateObj = new Date(lastDate);
                const currentDateObj = new Date(currentDate);
                const diffDays = Math.floor(
                  (currentDateObj.getTime() - lastDateObj.getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                if (diffDays === 1) {
                  tempStreak++;
                } else {
                  tempStreak = 1;
                }
              } else {
                tempStreak = 1;
              }

              if (tempStreak > currentStreak) {
                currentStreak = tempStreak;
              }
              lastDate = currentDate;
            }
          }
        });
      }

      const missedClasses = totalClasses - attendedClasses;
      const attendancePercentage =
        totalClasses > 0
          ? Number(((attendedClasses / totalClasses) * 100).toFixed(2))
          : 0;

      console.log("Attendance Stats:", {
        totalClasses,
        attendedClasses,
        missedClasses,
        attendancePercentage,
        currentStreak,
        enrolledClasses: classesData.length,
        classNames: classesData.map((c) => c.name),
      });

      setStats({
        totalClasses,
        attendedClasses,
        missedClasses,
        attendancePercentage,
        currentStreak,
      });
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendanceStats().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/splash-screen");
      return;
    }

    const intervalId = setInterval(() => {
      // Recheck the user status. If `user` becomes falsy, redirect.
      if (!user) {
        router.replace("/auth/splash-screen");
        clearInterval(intervalId);
      }
    }, 10000); // Check every 10 seconds

    fetchAttendanceStats();

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(fetchAttendanceStats, 30000);

    return () => {
      clearInterval(intervalId);
      clearInterval(refreshInterval);
    };
  }, [user, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 mb-24"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#000"]} // Android
          tintColor="#000" // iOS
        />
      }
    >
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
                      className="text-5xl text-[#000]"
                      style={{ fontFamily: "BGSB", color: "#000" }}
                    >
                      {Math.floor(stats.attendancePercentage)}
                    </Text>
                    <Text
                      className="text-5xl text-[#000] opacity-50"
                      style={{ fontFamily: "BGSB", color: "#b2b2b2" }}
                    >
                      .
                      {((stats.attendancePercentage % 1) * 100)
                        .toFixed(0)
                        .padStart(2, "0")}
                    </Text>
                    <Text
                      className="text-5xl text-[#000] opacity-50"
                      style={{ fontFamily: "BGSB", color: "#b2b2b2" }}
                    >
                      %
                    </Text>
                  </HStack>
                  <HStack className="flex gap-2">
                    <Text className="">{stats.attendedClasses} Attended |</Text>
                    <Text className="text-error-300">
                      {stats.missedClasses} missed
                    </Text>
                  </HStack>
                </VStack>
                <TrendingUpIcon color="#5c5c5c" />
              </HStack>

              <HStack className="flex border-border-300 p-3 border-t justify-between">
                <Text className="px-2 py-1 bg-typography-200 rounded-md">
                  Total Classes: {stats.totalClasses}
                </Text>

                <Text className="px-2 py-1 bg-typography-200 rounded-md">
                  Streak: {stats.currentStreak} Days
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
              <Text
                fontWeight="bold"
                className="p-2 text-center w-full flex justify-start items-center "
              >
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
              <Text
                fontWeight="bold"
                className="p-2 text-center w-full flex justify-start items-center "
              >
                Analytics
              </Text>
            </GridItem>
            <GridItem
              className="bg-background-50 rounded-xl w-full  hover:bg-background-200 text-center"
              _extra={{
                className: "col-span-6 w-full",
              }}
            >
              <Pressable onPress={() => router.push("/history")}>
                <View className="p-6 border-b w-full flex justify-start items-center border-border-300 rounded-xl">
                  <CalendarIcon color="black" />
                </View>
                <Text
                  fontWeight="bold"
                  className="p-2 text-center w-full flex justify-start items-center "
                >
                  History
                </Text>
              </Pressable>
            </GridItem>
          </Grid>
          <Divider />
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
        <AnnouncementWidget />
      </VStack>
    </ScrollView>
  );
};

export const Home = () => {
  return <SettingsLayout children={<Homepage />} />;
};
