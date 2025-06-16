import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
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
} from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";

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
        <Text className="text-2xl font-bold mb-6">All Classes</Text>

        {classes.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Book size={48} color="#666" />
            <Text className="text-xl font-semibold mt-4">No Classes Found</Text>
            <Text className="text-gray-500 text-center mt-2">
              There are no classes available at the moment
            </Text>
          </View>
        ) : (
          <VStack space="md">
            {classes.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                onPress={() =>
                  router.push(`/student/class/${classItem.id}` as any)
                }
              >
                <VStack space="md">
                  {/* Header */}
                  <HStack className="flex justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold">
                        {classItem.name}
                      </Text>
                      <Text className="text-gray-600">{classItem.subject}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Users size={16} color="#666" />
                      <Text className="text-gray-600 ml-1">
                        {classItem.teacherName}
                      </Text>
                    </View>
                  </HStack>

                  {/* Class Details */}
                  <HStack className="flex justify-between">
                    <HStack space="xs" className="items-center">
                      <Calendar size={16} color="#666" />
                      <Text className="text-gray-600">
                        {classItem.schedule?.day || "Not scheduled"}
                      </Text>
                    </HStack>
                    <HStack space="xs" className="items-center">
                      <Clock size={16} color="#666" />
                      <Text className="text-gray-600">
                        {classItem.schedule?.time || "Not scheduled"}
                      </Text>
                    </HStack>
                    <HStack space="xs" className="items-center">
                      <MapPin size={16} color="#666" />
                      <Text className="text-gray-600">
                        {classItem.schedule?.room || "Not assigned"}
                      </Text>
                    </HStack>
                  </HStack>

                  {/* Department and Year */}
                  <HStack className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <Text className="text-gray-600">
                      {classItem.department} - {classItem.year}
                    </Text>
                    <Text className="text-gray-600">
                      Section {classItem.section}
                    </Text>
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
