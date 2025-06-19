import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import {
  Calendar,
  Clock,
  Plus,
  Users,
  Book,
  ChevronLeft,
  DoorOpen,
  Layers3,
  Hash,
} from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useBottomBtns } from "@/hooks/useBottomBtns";

interface ScheduleItem {
  id: string;
  className: string;
  subject: string;
  department: string;
  year: string;
  semester: string;
  section: string;
  day: string;
  time: string;
  room: string;
  students: number;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function TeacherSchedule() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { hide } = useBottomBtns();

  React.useEffect(() => {
    hide();
  }, [hide]);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user) {
        router.replace("/auth/teacher-auth" as any);
        return;
      }

      try {
        const teacherRef = doc(db, "teachers", user.uid);
        const teacherSnap = await getDoc(teacherRef);

        if (teacherSnap.exists()) {
          const teacherData = teacherSnap.data();
          const classIds = teacherData.classes || [];

          const scheduleData: ScheduleItem[] = [];
          for (const classId of classIds) {
            const classRef = doc(db, "classes", classId);
            const classSnap = await getDoc(classRef);

            if (classSnap.exists()) {
              const classData = classSnap.data();
              if (classData.schedule) {
                scheduleData.push({
                  id: classId,
                  className: classData.name,
                  subject: classData.subject,
                  department: classData.department,
                  year: classData.year,
                  semester: classData.semester,
                  section: classData.section,
                  day: classData.schedule.day,
                  time: classData.schedule.time,
                  room: classData.schedule.room || "Not specified",
                  students: classData.students?.length || 0,
                });
              }
            }
          }

          // Sort schedule by day and time
          scheduleData.sort((a, b) => {
            const dayA = DAYS.indexOf(a.day);
            const dayB = DAYS.indexOf(b.day);
            if (dayA !== dayB) return dayA - dayB;
            return a.time.localeCompare(b.time);
          });

          setSchedule(scheduleData);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
        toast.show({
          render: () => (
            <View className="bg-error-500 p-4 rounded-lg">
              <Text className="text-white">Error loading schedule</Text>
            </View>
          ),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}

      <ScrollView className="flex-1 mb-24">
        <View className="p-6">
          {schedule.length === 0 ? (
            <View className="items-center justify-center py-8">
              <Calendar size={48} color="#666" />
              <Text className="text-xl font-semibold mt-4">
                No Schedule Yet
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                Add schedule for your classes to get started
              </Text>
            </View>
          ) : (
            <VStack space="xl">
              {DAYS.map((day) => {
                const daySchedule = schedule.filter((item) => item.day === day);
                if (daySchedule.length === 0) return null;
                return (
                  <View key={day} className="mb-8">
                    <Text className="text-lg font-semibold mb-3 text-primary-600">
                      {day}
                    </Text>
                    <VStack space="md">
                      {daySchedule.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          className="bg-gray-50 p-4 rounded-2xl border border-border-200 flex-row items-center shadow-sm"
                          onPress={() =>
                            router.push(`/teacher/class/${item.id}` as any)
                          }
                          activeOpacity={0.85}
                        >
                          <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-4">
                            <Book size={22} color="#9CA3AF" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-900">
                              {item.className}
                            </Text>
                            <Text className="text-gray-600 mb-1">
                              {item.subject}
                            </Text>
                            <HStack space="sm" className="items-center mb-1">
                              <Layers3 size={16} color="#666" />
                              <Text className="text-gray-600 ml-1">
                                {item.year}, Sem {item.semester}
                              </Text>
                              <Hash size={16} color="#666" className="ml-3" />
                              <Text className="text-gray-600 ml-1">
                                Sec {item.section}
                              </Text>
                            </HStack>
                            <HStack space="sm" className="items-center">
                              <Book size={16} color="#666" />
                              <Text className="text-gray-600 ml-1">
                                {item.department}
                              </Text>
                              <Users size={16} color="#666" className="ml-3" />
                              <Text className="text-gray-600 ml-1">
                                {item.students} students
                              </Text>
                            </HStack>
                          </View>
                          <View className="items-end ml-4">
                            <HStack space="sm" className="items-center">
                              <Clock size={16} color="#666" />
                              <Text className="text-gray-600 ml-1">
                                {item.time}
                              </Text>
                            </HStack>
                            <HStack space="sm" className="items-center mt-2">
                              <DoorOpen size={16} color="#666" />
                              <Text className="text-gray-500 ml-1">
                                Room {item.room}
                              </Text>
                            </HStack>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </VStack>
                  </View>
                );
              })}
            </VStack>
          )}
        </View>
      </ScrollView>
      <View className="absolute left-0 right-0 bottom-0 p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="w-full h-14 rounded-2xl shadow-md bg-primary-600 items-center justify-center flex-row"
          onPress={() => router.push("/teacher/create-class" as any)}
          activeOpacity={0.85}
        >
          <Text className="text-white font-semibold text-lg">
            Create Schedule
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
