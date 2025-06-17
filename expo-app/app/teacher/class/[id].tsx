import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "@/app/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import {
  ChevronLeft,
  Users,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface ClassDetails {
  id: string;
  name: string;
  subject: string;
  department: string;
  year: string;
  semester: string;
  section: string;
  teacherId: string;
  teacherName: string;
  schedule: {
    day: string;
    time: string;
    room: string;
  };
  students: string[];
}

interface AttendanceRecord {
  present: string[];
  date: string;
}

export default function ClassDetails() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [todayAttendance, setTodayAttendance] =
    useState<AttendanceRecord | null>(null);
  const toast = useToast();

  const fetchClassDetails = async () => {
    if (!user) {
      router.replace("/auth/teacher-auth" as any);
      return;
    }

    try {
      // Get class details
      const classRef = doc(db, "classes", id as string);
      const classSnap = await getDoc(classRef);

      if (!classSnap.exists()) {
        throw new Error("Class not found");
      }

      const classData = classSnap.data() as ClassDetails;
      setClassDetails({
        ...classData,
        students: classData.students || [],
      });

      // Get today's attendance
      const today = new Date().toISOString().split("T")[0];
      const attendanceRef = doc(db, "attendance", `${id}_${today}`);
      const attendanceSnap = await getDoc(attendanceRef);

      if (attendanceSnap.exists()) {
        setTodayAttendance(attendanceSnap.data() as AttendanceRecord);
      } else {
        setTodayAttendance(null);
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Error loading class details</Text>
          </View>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassDetails();

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(fetchClassDetails, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [user, id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!classDetails) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Class not found</Text>
      </View>
    );
  }

  const presentCount = todayAttendance?.present?.length || 0;
  const totalStudents = classDetails.students?.length || 0;
  const attendancePercentage =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  return (
    <ScrollView className="flex-1 bg-white w-full">
      {/* Header */}
      <View className="p-6 bg-white border-b border-border-200">
        <Text fontWeight="bold" className="text-3xl text-gray-900 mb-1">
          {classDetails.subject}
        </Text>
        <Text className="text-lg text-gray-600">{classDetails.name}</Text>
      </View>

      {/* Content */}
      <VStack space="xl" className="p-6 pb-20 w-full">
        {/* Class Details Badges */}
        <View className="bg-white w-full rounded-2xl shadow-sm border border-border-200">
          <View className="flex-row items-center justify-between px-6 py-3 border-b border-border-200">
            <Text className="text-xl font-semibold text-gray-900">
              Class Details
            </Text>
          </View>
          <VStack space="md" className="p-6">
            <HStack space="md" className="flex-wrap">
              <View className="bg-blue-50 px-4 py-2 rounded-lg">
                <Text className="text-sm text-blue-700 font-medium">
                  Department
                </Text>
                <Text className="text-base text-blue-900">
                  {classDetails.department}
                </Text>
              </View>

              <View className="bg-green-50 px-4 py-2 rounded-lg">
                <Text className="text-sm text-green-700 font-medium">Year</Text>
                <Text className="text-base text-green-900">
                  {classDetails.year}
                </Text>
              </View>

              <View className="bg-orange-50 px-4 py-2 rounded-lg">
                <Text className="text-sm text-orange-700 font-medium">
                  Semester
                </Text>
                <Text className="text-base text-orange-900">
                  {classDetails.semester}
                </Text>
              </View>

              <View className="bg-purple-50 px-4 py-2 rounded-lg">
                <Text className="text-sm text-purple-700 font-medium">
                  Section
                </Text>
                <Text className="text-base text-purple-900">
                  {classDetails.section}
                </Text>
              </View>
            </HStack>
          </VStack>
        </View>

        {/* Schedule Card */}
        <View className="bg-white rounded-2xl shadow-sm border border-border-200">
          <View className="flex-row items-center justify-between px-6 py-3 border-b border-border-200">
            <Text className="text-xl font-semibold text-gray-900">
              Schedule
            </Text>
          </View>
          <VStack space="md" className="p-6">
            <HStack space="md" className="items-center">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                <Calendar size={20} color="#6366F1" />
              </View>
              <View>
                <Text className="text-sm text-gray-500">Day</Text>
                <Text className="text-base text-gray-900">
                  {classDetails.schedule.day}
                </Text>
              </View>
            </HStack>
            <HStack space="md" className="items-center">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                <Clock size={20} color="#6366F1" />
              </View>
              <View>
                <Text className="text-sm text-gray-500">Time</Text>
                <Text className="text-base text-gray-900">
                  {classDetails.schedule.time}
                </Text>
              </View>
            </HStack>
            <HStack space="md" className="items-center">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                <MapPin size={20} color="#6366F1" />
              </View>
              <View>
                <Text className="text-sm text-gray-500">Room</Text>
                <Text className="text-base text-gray-900">
                  Room {classDetails.schedule.room}
                </Text>
              </View>
            </HStack>
          </VStack>
        </View>

        {/* Today's Attendance Card */}
        <View className="bg-white rounded-2xl shadow-sm border border-border-200">
          <View className="flex-row items-center justify-between px-6 py-3 border-b border-border-200">
            <Text className="text-xl font-semibold text-gray-900">
              Today's Attendance
            </Text>
          </View>
          <VStack space="md" className="p-6">
            <HStack space="md" className="items-center">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                <Users size={20} color="#6366F1" />
              </View>
              <View>
                <Text className="text-sm text-gray-500">Present Students</Text>
                <Text className="text-base text-gray-900">
                  {presentCount} of {totalStudents} students
                </Text>
              </View>
            </HStack>
            <View className="bg-gray-50 p-4 rounded-lg">
              <Text className="text-sm text-gray-500">Attendance Rate</Text>
              <Text className="text-2xl font-semibold text-gray-900">
                {attendancePercentage}%
              </Text>
            </View>
          </VStack>
        </View>

        {/* Action Buttons */}
        <VStack space="md" className="">
          <Button
            action="primary"
            onPress={() =>
              router.push(`/teacher/class/${id}/attendance` as any)
            }
            className="w-full h-14 rounded-2xl shadow-md bg-primary-600"
          >
            <ButtonText className="text-white font-semibold">
              Manage Attendance
            </ButtonText>
          </Button>
          <Button
            action="secondary"
            onPress={() => router.push(`/teacher/class/${id}/students` as any)}
            className="w-full h-14 rounded-2xl shadow-md bg-gray-100"
          >
            <ButtonText className="text-gray-900 font-semibold">
              View Students
            </ButtonText>
          </Button>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
