import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
import {
  Book,
  Plus,
  Users,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";

interface Class {
  id: string;
  name: string;
  subject: string;
  students: number;
  schedule?: {
    day?: string;
    time?: string;
    room?: string;
  } | null;
  activeSession?: boolean;
  sessionEndTime?: string;
}

export default function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  const fetchClasses = async () => {
    if (!user) {
      router.replace("/auth/teacher-auth" as any);
      return;
    }

    try {
      // Query classes where teacherId matches the current user
      const classesQuery = query(
        collection(db, "classes"),
        where("teacherId", "==", user.uid)
      );
      const classesSnap = await getDocs(classesQuery);

      const classesData: Class[] = [];

      for (const classDoc of classesSnap.docs) {
        const classData = classDoc.data();

        // Check for active attendance session
        const today = new Date().toISOString().split("T")[0];
        const attendanceRef = doc(db, "attendance", `${classDoc.id}_${today}`);
        const attendanceSnap = await getDoc(attendanceRef);

        let activeSession = false;
        let sessionEndTime = null;

        if (attendanceSnap.exists()) {
          const attendanceData = attendanceSnap.data();
          const endTime = new Date(attendanceData.endTime);
          if (new Date() < endTime) {
            activeSession = true;
            sessionEndTime = attendanceData.endTime;
          }
        }

        classesData.push({
          id: classDoc.id,
          name: classData.name,
          subject: classData.subject,
          students: classData.students?.length || 0,
          schedule: classData.schedule || null,
          activeSession,
          sessionEndTime,
        });
      }

      setClasses(classesData);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Error loading classes</Text>
          </View>
        ),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(fetchClasses, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="px-6 py-3 bg-white border-b border-border-200">
        <HStack className="justify-between items-center">
          <Text fontWeight="bold" className="text-2xl text-gray-900 mb-1">
            My Classes
          </Text>
          <TouchableOpacity
            className="p-2 rounded-full bg-primary-500"
            onPress={() => router.push("/teacher/create-class" as any)}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </HStack>
      </View>

      <VStack className="p-6 pb-20" space="xl">
        {classes.length === 0 ? (
          <View className="bg-white rounded-2xl shadow-sm border border-border-200 p-8">
            <VStack className="items-center justify-center" space="md">
              <View className="w-16 h-16 rounded-full bg-primary-50 items-center justify-center">
                <Book size={32} color="#6366F1" />
              </View>
              <Text className="text-xl font-semibold text-gray-900">
                No Classes Yet
              </Text>
              <Text className="text-base text-gray-500 text-center">
                Create your first class to get started
              </Text>
              <Button
                className="mt-4 bg-primary-500"
                onPress={() => router.push("/teacher/create-class" as any)}
              >
                <ButtonText>Create Class</ButtonText>
              </Button>
            </VStack>
          </View>
        ) : (
          <VStack space="md">
            {classes.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                className="bg-white rounded-2xl shadow-sm border border-border-200"
                onPress={() =>
                  router.push(`/teacher/class/${classItem.id}` as any)
                }
              >
                <VStack className="p-6" space="md">
                  <HStack className="justify-between items-start">
                    <VStack space="sm" className="flex-1">
                      <Text className="text-xl font-semibold text-gray-900">
                        {classItem.name}
                      </Text>
                      <Text className="text-base text-gray-600">
                        {classItem.subject}
                      </Text>

                      {classItem.activeSession && classItem.sessionEndTime && (
                        <HStack className="items-center mt-2" space="sm">
                          <View className="w-8 h-8 rounded-full bg-primary-50 items-center justify-center">
                            <Clock size={16} color="#6366F1" />
                          </View>
                          <Text className="text-sm text-gray-600">
                            Session ends in:{" "}
                            {Math.max(
                              0,
                              Math.floor(
                                (new Date(classItem.sessionEndTime).getTime() -
                                  new Date().getTime()) /
                                  1000 /
                                  60
                              )
                            )}{" "}
                            minutes
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                    <ChevronRight size={24} color="#6366F1" />
                  </HStack>
                  <VStack space="sm">
                    <HStack className="items-center" space="sm">
                      <View className="w-8 h-8 rounded-full bg-primary-50 items-center justify-center">
                        <Users size={16} color="#6366F1" />
                      </View>
                      <Text className="text-sm text-gray-600">
                        {classItem.students} Students
                      </Text>
                    </HStack>

                    {classItem.schedule?.day && classItem.schedule?.time && (
                      <HStack className="items-center" space="sm">
                        <View className="w-8 h-8 rounded-full bg-primary-50 items-center justify-center">
                          <Calendar size={16} color="#6366F1" />
                        </View>
                        <Text className="text-sm text-gray-600">
                          {classItem.schedule.day} | {classItem.schedule.time}
                          {classItem.schedule.room
                            ? ` | Room: ${classItem.schedule.room}`
                            : ""}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </VStack>
              </TouchableOpacity>
            ))}
          </VStack>
        )}
      </VStack>
    </ScrollView>
  );
}
