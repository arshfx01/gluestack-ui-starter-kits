import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "@/app/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { ChevronLeft, CheckCircle2, XCircle } from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  isPresent: boolean;
}

export default function ClassStudents() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const toast = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user || !id) {
        router.replace("/auth/teacher-auth" as any);
        return;
      }

      try {
        // Get class document
        const classRef = doc(db, "classes", id as string);
        const classSnap = await getDoc(classRef);

        if (!classSnap.exists()) {
          toast.show({
            render: () => (
              <View className="bg-error-500 p-4 rounded-lg">
                <Text className="text-white">Class not found</Text>
              </View>
            ),
          });
          return;
        }

        const classData = classSnap.data();
        const today = new Date().toISOString().split("T")[0];

        // Get today's attendance
        const attendanceRef = doc(db, "attendance", `${id}_${today}`);
        const attendanceSnap = await getDoc(attendanceRef);
        const presentStudents = attendanceSnap.exists()
          ? attendanceSnap.data().students || []
          : [];

        // Get all students in the class
        const studentsData: Student[] = [];
        for (const studentId of classData.students || []) {
          const studentRef = doc(db, "students", studentId);
          const studentSnap = await getDoc(studentRef);

          if (studentSnap.exists()) {
            const studentData = studentSnap.data();
            studentsData.push({
              id: studentId,
              name: studentData.name,
              rollNumber: studentData.rollNumber,
              isPresent: presentStudents.includes(studentId),
            });
          }
        }

        // Sort students by roll number
        studentsData.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.show({
          render: () => (
            <View className="bg-error-500 p-4 rounded-lg">
              <Text className="text-white">Error loading students</Text>
            </View>
          ),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user, id]);

  useEffect(() => {
    // Filter students based on search query
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

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
      <View className="p-6 border-b border-gray-200">
        <TouchableOpacity className="mb-4" onPress={() => router.back()}>
          <HStack space="sm" className="items-center">
            <ChevronLeft size={24} color="#666" />
            <Text className="text-gray-600">Back to Class</Text>
          </HStack>
        </TouchableOpacity>

        <Text className="text-2xl font-bold">Students</Text>
      </View>

      {/* Search */}
      <View className="p-4">
        <Input>
          <InputField
            placeholder="Search by name or roll number"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Input>
      </View>

      {/* Students List */}
      <ScrollView className="flex-1">
        <VStack space="md" className="p-4">
          {filteredStudents.map((student) => (
            <View
              key={student.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <HStack className="justify-between items-center">
                <VStack>
                  <Text className="text-lg font-semibold">{student.name}</Text>
                  <Text className="text-gray-600">
                    Roll No: {student.rollNumber}
                  </Text>
                </VStack>
                {student.isPresent ? (
                  <HStack space="sm" className="items-center">
                    <CheckCircle2 size={24} color="#22c55e" />
                    <Text className="text-success-500">Present</Text>
                  </HStack>
                ) : (
                  <HStack space="sm" className="items-center">
                    <XCircle size={24} color="#ef4444" />
                    <Text className="text-error-500">Absent</Text>
                  </HStack>
                )}
              </HStack>
            </View>
          ))}
        </VStack>
      </ScrollView>
    </View>
  );
}
