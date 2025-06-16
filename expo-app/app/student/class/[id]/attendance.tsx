import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "@/app/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { ChevronLeft, Clock } from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";

export default function MarkAttendance() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [className, setClassName] = useState("");
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);
  const toast = useToast();

  const fetchClassDetails = async () => {
    if (!user) {
      router.replace("/auth/student-auth" as any);
      return;
    }

    try {
      // Verify student is enrolled in this class
      const classRef = doc(db, "classes", id as string);
      const classSnap = await getDoc(classRef);

      if (!classSnap.exists()) {
        throw new Error("Class not found");
      }

      const classData = classSnap.data();
      if (!classData.students?.includes(user.uid)) {
        // Create student document if it doesn't exist
        const studentRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentRef);

        if (!studentSnap.exists()) {
          await setDoc(studentRef, {
            name: user.displayName || "Unknown",
            rollNumber: "N/A",
            email: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        // Add student to class
        await setDoc(classRef, {
          ...classData,
          students: [...(classData.students || []), user.uid],
          updatedAt: new Date().toISOString(),
        });
      }

      setClassName(classData.name);

      // Check today's attendance
      const today = new Date().toISOString().split("T")[0];
      const attendanceRef = doc(db, "attendance", `${id}_${today}`);
      const attendanceSnap = await getDoc(attendanceRef);

      if (attendanceSnap.exists()) {
        const attendanceData = attendanceSnap.data();
        setSessionEndTime(new Date(attendanceData.endTime));
        setAttendanceMarked(
          attendanceData.present?.includes(user.uid) || false
        );
      } else {
        setSessionEndTime(null);
        setAttendanceMarked(false);
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">
              {error instanceof Error
                ? error.message
                : "Error loading class details"}
            </Text>
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

  const markAttendance = async () => {
    if (!user) return;
    if (!sessionEndTime || new Date() > sessionEndTime) {
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Attendance session has ended</Text>
          </View>
        ),
      });
      return;
    }

    setMarking(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const attendanceRef = doc(db, "attendance", `${id}_${today}`);
      const attendanceSnap = await getDoc(attendanceRef);

      if (!attendanceSnap.exists()) {
        throw new Error("No active attendance session");
      }

      const attendanceData = attendanceSnap.data();
      const presentStudents = attendanceData.present || [];

      if (presentStudents.includes(user.uid)) {
        throw new Error("Attendance already marked");
      }

      await setDoc(attendanceRef, {
        ...attendanceData,
        present: [...presentStudents, user.uid],
        updatedAt: new Date().toISOString(),
      });

      setAttendanceMarked(true);
      toast.show({
        render: () => (
          <View className="bg-success-500 p-4 rounded-lg">
            <Text className="text-white">Attendance marked successfully</Text>
          </View>
        ),
      });
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">
              {error instanceof Error
                ? error.message
                : "Error marking attendance"}
            </Text>
          </View>
        ),
      });
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-6 border-b border-gray-200">
        <TouchableOpacity className="mb-4" onPress={() => router.back()}>
          <HStack space="sm" className="items-center">
            <ChevronLeft size={24} color="#666" />
            <Text className="text-gray-600">Back to Class</Text>
          </HStack>
        </TouchableOpacity>

        <Text className="text-2xl font-bold">{className}</Text>
      </View>

      {/* Session Status */}
      {sessionEndTime && (
        <View className="p-4 bg-gray-50 border-b border-gray-200">
          <HStack space="sm" className="items-center">
            <Clock size={20} color="#666" />
            <Text className="text-gray-600">
              {new Date() > sessionEndTime ? (
                <Text className="text-error-500">Session Expired</Text>
              ) : (
                `Session ends in: ${Math.max(
                  0,
                  Math.floor(
                    (sessionEndTime.getTime() - new Date().getTime()) /
                      1000 /
                      60
                  )
                )} minutes`
              )}
            </Text>
          </HStack>
        </View>
      )}

      {/* Attendance Status */}
      <View className="flex-1 items-center justify-center p-6">
        {attendanceMarked ? (
          <VStack space="lg" className="items-center">
            <View className="w-20 h-20 rounded-full bg-success-500 items-center justify-center">
              <Text className="text-white text-4xl">✓</Text>
            </View>
            <Text className="text-xl font-semibold text-gray-700">
              Attendance Marked
            </Text>
            <Text className="text-gray-500 text-center">
              Your attendance has been recorded for today's class.
            </Text>
          </VStack>
        ) : !sessionEndTime ? (
          <VStack space="lg" className="items-center">
            <View className="w-20 h-20 rounded-full bg-gray-300 items-center justify-center">
              <Clock size={40} color="#666" />
            </View>
            <Text className="text-xl font-semibold text-gray-700">
              No Active Session
            </Text>
            <Text className="text-gray-500 text-center">
              There is no active attendance session at the moment.
            </Text>
          </VStack>
        ) : new Date() > sessionEndTime ? (
          <VStack space="lg" className="items-center">
            <View className="w-20 h-20 rounded-full bg-error-500 items-center justify-center">
              <Clock size={40} color="white" />
            </View>
            <Text className="text-xl font-semibold text-gray-700">
              Session Ended
            </Text>
            <Text className="text-gray-500 text-center">
              The attendance session has ended. Please contact your teacher.
            </Text>
          </VStack>
        ) : (
          <VStack space="lg" className="items-center">
            <View className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center">
              <Text className="text-white text-4xl">!</Text>
            </View>
            <Text className="text-xl font-semibold text-gray-700">
              Mark Attendance
            </Text>
            <Text className="text-gray-500 text-center">
              Click the button below to mark your attendance for today's class.
            </Text>
            <Button
              onPress={markAttendance}
              disabled={marking}
              className="w-full bg-primary-500"
            >
              <ButtonText>
                {marking ? "Marking..." : "Mark Attendance"}
              </ButtonText>
            </Button>
          </VStack>
        )}
      </View>
    </View>
  );
}
