import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useAuth } from "@/app/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  User,
} from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";

interface ClassDetails {
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
}

interface AttendanceRecord {
  present: string[];
  date: string;
}

export default function ClassDetails() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [todayAttendance, setTodayAttendance] =
    useState<AttendanceRecord | null>(null);
  const toast = useToast();

  const fetchClassDetails = async () => {
    if (!user) {
      router.replace("/auth/student-auth" as any);
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
      setClassDetails(classData);

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

  const isAttendanceMarked = todayAttendance?.present.includes(user?.uid || "");

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
        <Text className="text-gray-600">{classDetails.subject}</Text>
      </View>

      {/* Content */}
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

          {/* Teacher Info */}
          <View className="bg-gray-50 p-4 rounded-lg">
            <HStack space="sm" className="items-center">
              <User size={20} color="#666" />
              <Text className="text-gray-600">
                Teacher: {classDetails.teacherName}
              </Text>
            </HStack>
          </View>

          {/* Attendance Status */}
          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-lg font-semibold mb-2">
              Today's Attendance
            </Text>
            {isAttendanceMarked ? (
              <Text className="text-success-500">Attendance Marked ✓</Text>
            ) : (
              <Text className="text-gray-600">Not marked yet</Text>
            )}
          </View>

          {/* Mark Attendance Button */}
          {!isAttendanceMarked && (
            <Button
              onPress={() =>
                router.push(`/student/class/${id}/attendance` as any)
              }
              className="w-full"
            >
              <ButtonText>Mark Attendance</ButtonText>
            </Button>
          )}
        </VStack>
      </ScrollView>
    </View>
  );
}
