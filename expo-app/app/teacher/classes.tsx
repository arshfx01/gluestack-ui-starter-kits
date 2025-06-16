import React, { useEffect, useState } from "react";
import {
  View,
  Text,
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
import { Book, Plus, Users, Calendar, Clock } from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";

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
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
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
      <VStack className="p-6" space="lg">
        <HStack className="justify-between items-center">
          <Heading className="text-2xl font-bold">My Classes</Heading>
          <TouchableOpacity
            className="bg-blue-500 p-2 rounded-full"
            onPress={() => router.push("/teacher/create-class" as any)}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </HStack>

        {classes.length === 0 ? (
          <VStack className="items-center justify-center py-8" space="md">
            <Book size={48} color="#666" />
            <Heading className="text-xl font-semibold">No Classes Yet</Heading>
            <Text className="text-gray-500 text-center">
              Create your first class to get started
            </Text>
            <Button
              className="mt-4"
              onPress={() => router.push("/teacher/create-class" as any)}
            >
              <ButtonText>Create Class</ButtonText>
            </Button>
          </VStack>
        ) : (
          <VStack className="space-y-4">
            {classes.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                onPress={() =>
                  router.push(`/teacher/class/${classItem.id}` as any)
                }
              >
                <HStack className="justify-between items-start">
                  <VStack className="" space="sm">
                    <Heading className="text-lg font-semibold">
                      {classItem.name}
                    </Heading>
                    <Text className="text-gray-600">{classItem.subject}</Text>

                    {classItem.activeSession && classItem.sessionEndTime && (
                      <HStack className="items-center mt-2" space="sm">
                        <Clock size={16} color="#666" />
                        <Text className="text-gray-600">
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
                  <VStack className="items-end" space="sm">
                    <HStack className="items-center" space="sm">
                      <Users size={16} color="#666" />
                      <Text className="text-gray-600">
                        {classItem.students}
                      </Text>
                    </HStack>
                    {classItem.schedule?.day && classItem.schedule?.time && (
                      <HStack className="items-center" space="sm">
                        <Calendar size={16} color="#666" />
                        <Text className="text-gray-600">
                          {classItem.schedule.day} | {classItem.schedule.time}
                          {classItem.schedule.room
                            ? ` | Room: ${classItem.schedule.room}`
                            : ""}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </HStack>
              </TouchableOpacity>
            ))}
          </VStack>
        )}
      </VStack>
    </ScrollView>
  );
}
