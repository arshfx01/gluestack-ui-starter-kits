import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
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
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-6 border-b border-gray-200">
        <TouchableOpacity className="mb-4" onPress={() => router.back()}>
          <HStack space="sm" className="items-center">
            <ChevronLeft size={24} color="#666" />
            <Text className="text-gray-600">Back to Classes</Text>
          </HStack>
        </TouchableOpacity>

        <Text className="text-2xl font-bold">{classDetails.name}</Text>
        <Text className="text-gray-600 mt-1">{classDetails.subject}</Text>
      </View>

      {/* Class Info */}
      <ScrollView className="flex-1">
        <VStack space="lg" className="p-6">
          {/* Schedule Card */}
          <View className="bg-gray-50 p-4 rounded-lg">
            <HStack space="sm" className="items-center mb-2">
              <Calendar size={20} color="#666" />
              <Text className="text-gray-600">{classDetails.schedule.day}</Text>
            </HStack>
            <HStack space="sm" className="items-center mb-2">
              <Clock size={20} color="#666" />
              <Text className="text-gray-600">
                {classDetails.schedule.time}
              </Text>
            </HStack>
            <HStack space="sm" className="items-center">
              <MapPin size={20} color="#666" />
              <Text className="text-gray-600">
                Room {classDetails.schedule.room}
              </Text>
            </HStack>
          </View>

          {/* Class Details Card */}
          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-lg font-semibold mb-4">Class Details</Text>
            <VStack space="sm">
              <Text className="text-gray-600">
                Department: {classDetails.department}
              </Text>
              <Text className="text-gray-600">Year: {classDetails.year}</Text>
              <Text className="text-gray-600">
                Semester: {classDetails.semester}
              </Text>
              <Text className="text-gray-600">
                Section: {classDetails.section}
              </Text>
              <Text className="text-gray-600">
                Total Students: {classDetails.students.length}
              </Text>
            </VStack>
          </View>

          {/* Today's Attendance Card */}
          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-lg font-semibold mb-2">
              Today's Attendance
            </Text>
            <HStack space="sm" className="items-center mb-2">
              <Users size={20} color="#666" />
              <Text className="text-gray-600">
                {presentCount} of {totalStudents} students present
              </Text>
            </HStack>
            <Text className="text-gray-600">
              Attendance Rate: {attendancePercentage}%
            </Text>
          </View>
        </VStack>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 border-t border-gray-200">
        <VStack space="sm">
          <Button
            className="w-full bg-blue-500"
            onPress={() =>
              router.push(`/teacher/class/${id}/attendance` as any)
            }
          >
            <ButtonText>Manage Attendance</ButtonText>
          </Button>
          <Button
            className="w-full bg-gray-500"
            onPress={() => router.push(`/teacher/class/${id}/students` as any)}
          >
            <ButtonText>View Students</ButtonText>
          </Button>
        </VStack>
      </View>
    </View>
  );
}
