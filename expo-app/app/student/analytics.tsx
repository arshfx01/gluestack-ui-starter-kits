import React, { useEffect, useState } from "react";
import { View, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { PieChart } from "react-native-chart-kit";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { useAuth } from "@/app/context/AuthContext";
import {
  ActivityIcon,
  BookOpen,
  Calendar,
  TrendingUp,
  ArrowLeft,
  ShieldQuestion,
} from "lucide-react-native";
import { HStack } from "@/components/ui/hstack";
import { router } from "expo-router";

interface AttendanceData {
  present: number;
  absent: number;
  total: number;
}

interface ClassPerformance {
  className: string;
  attendance: number;
  assignments: number;
  classId: string;
}

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({
    present: 0,
    absent: 0,
    total: 0,
  });
  const [classPerformance, setClassPerformance] = useState<ClassPerformance[]>(
    []
  );
  const [overallAttendance, setOverallAttendance] = useState(0);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    if (!user) return;

    try {
      // Get all classes the student is enrolled in
      const classesQuery = query(
        collection(db, "classes"),
        where("students", "array-contains", user.uid)
      );
      const classesSnap = await getDocs(classesQuery);
      const classesData: { id: string; name: string }[] = classesSnap.docs.map(
        (doc) => ({
          id: doc.id,
          name: doc.data().name,
        })
      );

      if (classesData.length === 0) {
        setAttendanceData({ present: 0, absent: 0, total: 0 });
        setClassPerformance([]);
        setOverallAttendance(0);
        setTotalAssignments(0);
        setLoading(false);
        return;
      }

      let present = 0;
      let absent = 0;
      const classPerformanceMap: {
        [key: string]: { present: number; total: number };
      } = {};
      let totalAssignmentsCount = 0; // Initialize total assignments

      // Process attendance for each enrolled class
      for (const classItem of classesData) {
        const attendanceQuery = query(
          collection(db, "attendance"),
          where("classId", "==", classItem.id)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);

        attendanceSnapshot.forEach((doc) => {
          const data = doc.data();
          if (
            data.present &&
            Array.isArray(data.present) &&
            data.present.includes(user.uid)
          ) {
            present++;
            if (classPerformanceMap[classItem.id]) {
              classPerformanceMap[classItem.id].present++;
              classPerformanceMap[classItem.id].total++;
            } else {
              classPerformanceMap[classItem.id] = { present: 1, total: 1 };
            }
          } else {
            absent++;
            if (classPerformanceMap[classItem.id]) {
              classPerformanceMap[classItem.id].total++;
            } else {
              classPerformanceMap[classItem.id] = { present: 0, total: 1 };
            }
          }
        });

        // Placeholder for assignments for this class
        const assignmentsForClass = Math.floor(Math.random() * 100);
        totalAssignmentsCount += assignmentsForClass;
      }

      // Calculate class performance
      const performance = Object.entries(classPerformanceMap).map(
        ([classId, data]) => ({
          className:
            classesData.find((c) => c.id === classId)?.name || "Unknown Class",
          attendance: (data.present / data.total) * 100,
          assignments: Math.floor(Math.random() * 100), // Keeping placeholder for now
          classId,
        })
      );

      setAttendanceData({
        present,
        absent,
        total: present + absent,
      });

      setClassPerformance(performance);
      setOverallAttendance(
        present + absent > 0 ? (present / (present + absent)) * 100 : 0
      );
      setTotalAssignments(totalAssignmentsCount);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const attendanceChartData = [
    {
      name: "Present",
      population: attendanceData.present,
      color: "#0095ff",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Absent",
      population: attendanceData.absent,
      color: "#ff857d",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
  ];

  const screenWidth = Dimensions.get("window").width;

  return (
    <ScrollView className="flex-1 bg-white">
      <VStack space="md" className="p-4 flex-1 pb-20">
        {/* Overall Stats */}
        <HStack className="w-full space-x-4" space="md">
          <View className="flex-1 border border-border-300 p-4 rounded-xl">
            <VStack space="xl" className="flex-1 justify-between h-full">
              <HStack className="items-center space-x-2" space="md">
                <Calendar size={20} color="#6b7280" />
                <Text className="text-typography-500">Attendance</Text>
              </HStack>
              <VStack space="xs">
                <Text
                  className="text-3xl text-typography-900"
                  style={{ fontFamily: "BGSB" }}
                >
                  {attendanceData.total === 0
                    ? "0%"
                    : overallAttendance.toFixed(1)}
                  %
                </Text>
                <Text className="text-xs text-typography-400">
                  Attendance Rate
                </Text>
              </VStack>
            </VStack>
          </View>

          <View className="flex-1 border border-border-300 p-4 rounded-xl">
            <VStack space="xl" className="flex-1 justify-between h-full">
              <HStack className="items-center space-x-2" space="md">
                <BookOpen size={20} color="#6b7280" />
                <Text className="text-typography-500">Assignments</Text>
              </HStack>
              <VStack space="xs">
                <Text
                  className="text-3xl text-typography-900"
                  style={{ fontFamily: "BGSB" }}
                >
                  {totalAssignments}
                </Text>
                <Text className="text-xs text-typography-400">
                  Total Assignments
                </Text>
              </VStack>
            </VStack>
          </View>
        </HStack>

        {/* Attendance Chart */}
        <View className="w-full bg-background-50 border-border-200 border rounded-xl">
          <VStack className="w-full">
            <HStack className="items-center justify-between p-2 py-4 border-b border-border-200">
              <Text className="text-lg font-semibold text-typography-900">
                Attendance Overview
              </Text>
            </HStack>
            <VStack space="sm" className="p-6">
              {attendanceData.total === 0 ? (
                <VStack
                  space="sm"
                  className="items-center justify-center py-10"
                >
                  <ActivityIcon size={48} color="#A1A1AA" />
                  <Text className="text-typography-500">
                    No attendance data available.
                  </Text>
                </VStack>
              ) : (
                <PieChart
                  data={attendanceChartData}
                  width={screenWidth - 48}
                  height={220}
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              )}
            </VStack>
          </VStack>
        </View>

        {/* Class Performance */}
        <View className="w-full bg-background-50 border-border-200 border rounded-xl">
          <VStack className="w-full">
            <HStack className="items-center justify-between p-2 py-4 border-b border-border-200">
              <Text className="text-lg font-semibold text-typography-900">
                Class Performance
              </Text>
            </HStack>
            <VStack space="md" className="p-3">
              {classPerformance.length === 0 ? (
                <VStack
                  space="sm"
                  className="items-center justify-center py-10"
                >
                  <BookOpen size={48} color="#A1A1AA" />
                  <Text className="text-typography-500">
                    No class performance data available.
                  </Text>
                </VStack>
              ) : (
                classPerformance.map((class_, index) => (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center justify-between p-3 bg-background-50 rounded-lg"
                    onPress={() =>
                      router.push(`/student/class/${class_.classId}` as any)
                    }
                  >
                    <HStack className="justify-between items-center w-full ">
                      <VStack>
                        <Text className="text-base font-medium text-typography-950">
                          {class_.className}
                        </Text>
                        <Text className="text-sm text-typography-500">
                          Attendance: {class_.attendance.toFixed(1)}%
                        </Text>
                      </VStack>
                      <View className="w-12 h-12 rounded-full items-center justify-center">
                        <TrendingUp color="#9CA3AF" size={24} />
                      </View>
                    </HStack>
                  </TouchableOpacity>
                ))
              )}
            </VStack>
          </VStack>
        </View>
      </VStack>
    </ScrollView>
  );
}
