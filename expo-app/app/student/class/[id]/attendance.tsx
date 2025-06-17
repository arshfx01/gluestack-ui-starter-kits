import React, { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
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
import { Text } from "@/components/ui/text";

export default function MarkAttendance() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [className, setClassName] = useState("");
  const [subjectName, setSubjectName] = useState("");
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
      setSubjectName(classData.subject);

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
      <View className="p-6 bg-white border-b border-border-200">
        <Text
          fontWeight="bold"
          className="text-3xl text-center text-gray-900 mb-1"
        >
          {subjectName}
        </Text>
        <Text className="text-lg text-gray-600 text-center">{className}</Text>
      </View>

      <VStack space="xl" className="p-6 pb-20">
        {/* Session Status Card */}
        {sessionEndTime && (
          <View className="bg-white rounded-2xl shadow-sm border border-border-200">
            <View className="flex-row items-center justify-between px-6 py-3 border-b border-border-200">
              <Text className="text-xl font-semibold text-gray-900">
                Session Status
              </Text>
            </View>
            <HStack space="md" className="items-center p-6">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                <Clock size={20} color="#6366F1" />
              </View>
              <View>
                <Text className="text-sm text-gray-500">Time Remaining</Text>
                <Text className="text-base text-gray-900">
                  {new Date() > sessionEndTime ? (
                    <Text className="text-error-500">Session Expired</Text>
                  ) : (
                    `${Math.max(
                      0,
                      Math.floor(
                        (sessionEndTime.getTime() - new Date().getTime()) /
                          1000 /
                          60
                      )
                    )} minutes remaining`
                  )}
                </Text>
              </View>
            </HStack>
          </View>
        )}

        {/* Attendance Status Card */}
        <View className="bg-white rounded-2xl shadow-sm border border-border-200">
          <View className="flex-row items-center justify-between px-6 py-3 border-b border-border-200">
            <Text className="text-xl font-semibold text-gray-900">
              Attendance Status
            </Text>
          </View>
          <VStack space="md" className="p-6">
            {attendanceMarked ? (
              <HStack space="md" className="items-center">
                <View className="w-10 h-10 rounded-full bg-success-50 items-center justify-center">
                  <Text className="text-success-600 text-xl">✓</Text>
                </View>
                <View>
                  <Text className="text-base text-success-600 font-medium">
                    Attendance Marked
                  </Text>
                  <Text className="text-sm text-gray-500 max-w-[98%]">
                    Your attendance has been recorded for today's class
                  </Text>
                </View>
              </HStack>
            ) : !sessionEndTime ? (
              <HStack space="md" className="items-center">
                <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                  <Clock size={20} color="#6366F1" />
                </View>
                <View>
                  <Text className="text-base text-gray-600">
                    No Active Session
                  </Text>
                  <Text className="text-sm text-gray-500 max-w-[98%]">
                    There is no active attendance session at the moment
                  </Text>
                </View>
              </HStack>
            ) : new Date() > sessionEndTime ? (
              <HStack space="md" className="items-center">
                <View className="w-10 h-10 rounded-full bg-error-50 items-center justify-center">
                  <Clock size={20} color="#EF4444" />
                </View>
                <View>
                  <Text className="text-base text-error-600">
                    Session Ended
                  </Text>
                  <Text className="text-sm text-gray-500">
                    The attendance session has ended. Please contact your
                    teacher
                  </Text>
                </View>
              </HStack>
            ) : (
              <HStack space="md" className="items-center">
                <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center">
                  <Text className="text-primary-600 text-xl">!</Text>
                </View>
                <View>
                  <Text className="text-base text-primary-600">
                    Mark Attendance
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Click the button below to mark your attendance
                  </Text>
                </View>
              </HStack>
            )}
          </VStack>
        </View>

        {/* Mark Attendance Button */}
        {!attendanceMarked &&
          sessionEndTime &&
          new Date() <= sessionEndTime && (
            <Button
              action="primary"
              onPress={markAttendance}
              disabled={marking}
              className="w-full h-14 rounded-2xl shadow-md bg-primary-600"
            >
              <ButtonText className="text-white font-semibold">
                {marking ? "Marking..." : "Mark Attendance"}
              </ButtonText>
            </Button>
          )}
      </VStack>
    </View>
  );
}
