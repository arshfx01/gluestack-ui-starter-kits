import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { Calendar, Clock, Plus, Users, Book } from "lucide-react-native";
import { useToast } from "@/components/ui/toast";

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
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold">Schedule</Text>
          <TouchableOpacity
            className="bg-blue-500 p-2 rounded-full"
            onPress={() => router.push("/teacher/create-class" as any)}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        {schedule.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Calendar size={48} color="#666" />
            <Text className="text-xl font-semibold mt-4">No Schedule Yet</Text>
            <Text className="text-gray-500 text-center mt-2">
              Add schedule for your classes to get started
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {DAYS.map((day) => {
              const daySchedule = schedule.filter((item) => item.day === day);
              return (
                <View key={day} className="mb-6">
                  <Text className="text-lg font-semibold mb-3">{day}</Text>
                  {daySchedule.length === 0 ? (
                    <Text className="text-gray-500 italic">
                      No classes scheduled
                    </Text>
                  ) : (
                    <View className="space-y-3">
                      {daySchedule.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                          onPress={() =>
                            router.push(`/teacher/class/${item.id}` as any)
                          }
                        >
                          <View className="flex-row justify-between items-start">
                            <View className="flex-1">
                              <Text className="text-lg font-semibold">
                                {item.className}
                              </Text>
                              <Text className="text-gray-600">
                                {item.subject}
                              </Text>
                              <View className="flex-row items-center mt-2 space-x-4">
                                <View className="flex-row items-center">
                                  <Book size={16} color="#666" />
                                  <Text className="text-gray-600 ml-1">
                                    {item.department}
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <Users size={16} color="#666" />
                                  <Text className="text-gray-600 ml-1">
                                    {item.students} students
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <View className="items-end">
                              <View className="flex-row items-center space-x-2">
                                <Clock size={16} color="#666" />
                                <Text className="text-gray-600">
                                  {item.time}
                                </Text>
                              </View>
                              <Text className="text-gray-500 mt-1">
                                Room: {item.room}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
