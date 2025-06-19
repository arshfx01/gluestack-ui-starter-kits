import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
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
  Users,
  Calendar,
  Clock,
  MapPin,
  Video,
  BookOpen,
  ArrowRight,
} from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";

interface Class {
  id: string;
  name: string;
  subject: string;
  department: string;
  year: string;
  semester: string;
  section: string;
  teacherName: string;
  schedule: {
    day: string;
    time: string;
    room: string;
  } | null;
  attendance?: {
    percentage: number;
    attended: number;
    missed: number;
    total: number;
    streak: number;
  };
}

export default function StudentClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) {
        router.replace("/auth/student-auth" as any);
        return;
      }

      try {
        // Get all classes
        const classesRef = collection(db, "classes");
        const classesSnap = await getDocs(classesRef);

        const classesData: Class[] = [];
        classesSnap.forEach((doc) => {
          const classData = doc.data();
          classesData.push({
            id: doc.id,
            name: classData.name,
            subject: classData.subject,
            department: classData.department,
            year: classData.year,
            semester: classData.semester,
            section: classData.section,
            teacherName: classData.teacherName,
            schedule: classData.schedule || null,
            attendance: {
              percentage: 0, // You'll need to calculate this from attendance records
              attended: 0,
              missed: 0,
              total: 0,
              streak: 0,
            },
          });
        });

        // Sort classes by department, year, and section
        classesData.sort((a, b) => {
          if (a.department !== b.department) {
            return a.department.localeCompare(b.department);
          }
          if (a.year !== b.year) {
            return a.year.localeCompare(b.year);
          }
          return a.section.localeCompare(b.section);
        });

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
      }
    };

    fetchClasses();
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
        {classes.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Book size={48} color="#666" />
            <Text className="text-xl font-semibold mt-4">No Classes Found</Text>
            <Text className="text-gray-500 text-center mt-2">
              There are no classes available at the moment
            </Text>
          </View>
        ) : (
          <VStack className="w-full pb-20">
            {classes.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                className="w-full mb-4 bg-gray-50 border hover:bg-gray-100  border-gray-300 rounded-xl"
                onPress={() =>
                  router.push(`/student/class/${classItem.id}` as any)
                }
              >
                <VStack className="w-full">
                  {/* Header */}
                  <HStack className="flex border-gray-300 p-3 border-b w-full justify-between">
                    <HStack space="sm" className="items-center">
                      <View className="bg-gray-100 p-3 rounded-lg">
                        {/* Book icon or your icon here */}
                        <BookOpen size={20} color="#5c5c5c" />
                      </View>
                      <VStack className="px-2">
                        <Text
                          className="text-lg text-typography-950 "
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {classItem.subject}
                        </Text>
                        <Text className="text font-semibold text-gray-500">
                          {/* No of classes held */}count :
                        </Text>
                      </VStack>
                    </HStack>

                    <View className="bg-green-100 items-center flex justify-center gap-2 max-h-8 px-3 py-1 rounded-full">
                      <Text className="text-green-600 text-sm font-semibold">
                        LIVE
                      </Text>
                    </View>
                  </HStack>
                  <VStack space="sm" className="p-3 w-full">
                    <View className=" ">
                      <HStack space="xs" className="items-center w-fit">
                        <Calendar size={16} color="#5c5c5c" />
                        <Text className="underline">
                          {classItem.department}
                        </Text>
                      </HStack>
                    </View>

                    {/* Class Details */}
                    <HStack className="flex justify-between w-full ">
                      <VStack className="w-full">
                        <HStack
                          space="md"
                          className="items-center flex justify-between w-full"
                        >
                          <HStack space="xs" className="items-center">
                            <Clock size={16} color="#5c5c5c" />
                            <Text className="">
                              {classItem.schedule?.time ?? "Not scheduled"}
                            </Text>
                          </HStack>
                          <HStack space="xs" className="items-center">
                            <MapPin size={16} color="#5c5c5c" />
                            <Text className="">
                              {classItem.schedule?.room ?? "Not assigned"}
                            </Text>
                          </HStack>
                        </HStack>

                        <HStack
                          space="md"
                          className="items-center  flex w-full justify-between mt-1"
                        >
                          <HStack space="xs" className="items-center">
                            <Users size={16} color="#5c5c5c" />
                            <Text
                              className="text-gray-900 max-w-40"
                              ellipsizeMode="tail"
                              numberOfLines={1}
                            >
                              {classItem.teacherName}
                            </Text>
                          </HStack>

                          <HStack space="xs" className="items-center">
                            <Video size={16} color="#5c5c5c" />
                            <Text className="text-gray-900">
                              {classItem.year} - {classItem.semester} Sem{" "}
                              {classItem.section}
                            </Text>
                          </HStack>
                        </HStack>
                      </VStack>
                    </HStack>
                  </VStack>
                  <HStack className="flex border-gray-300 p-3 border-t justify-between">
                    <HStack className="flex gap-2">
                      <Text className="px-2 py-1 max-w-fit bg-gray-100 rounded-md">
                        Attended:
                      </Text>

                      <Text className="px-2 py-1 bg-gray-100 rounded-md">
                        Missed:
                      </Text>
                    </HStack>
                    <View className="flex items-center justify-center">
                      <ArrowRight size={16} color="#5c5c5c" />
                    </View>
                  </HStack>
                </VStack>
              </TouchableOpacity>
            ))}
          </VStack>
        )}
      </View>
    </ScrollView>
  );
}
