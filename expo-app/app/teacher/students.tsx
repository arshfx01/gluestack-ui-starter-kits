import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, TextInput } from "react-native";
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
import { Users, Search, UserPlus, User } from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";

interface Student {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  attendance: number;
}

export default function TeacherStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
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

          const studentsData: Student[] = [];
          for (const classId of classIds) {
            const classRef = doc(db, "classes", classId);
            const classSnap = await getDoc(classRef);

            if (classSnap.exists()) {
              const classData = classSnap.data();
              const studentIds = classData.students || [];

              for (const studentId of studentIds) {
                const studentRef = doc(db, "users", studentId);
                const studentSnap = await getDoc(studentRef);

                if (studentSnap.exists()) {
                  const studentData = studentSnap.data();
                  studentsData.push({
                    id: studentId,
                    name: studentData.fullName,
                    rollNo: studentData.rollNo,
                    class: classData.name,
                    attendance: studentData.attendance?.[classId] || 0,
                  });
                }
              }
            }
          }

          setStudents(studentsData);
          setFilteredStudents(studentsData);
        }
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
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
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
      <ScrollView className="flex-1 mb-24">
        <View className="p-6">
          <View className="flex-row items-center bg-gray-50 border border-border-200 rounded-2xl px-4 py-3 mb-6 shadow-sm">
            <Search size={20} color="#9CA3AF" className="" />
            <TextInput
              className="flex-1 ml-5 text-base text-gray-900"
              placeholder="Search students..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          {filteredStudents.length === 0 ? (
            <View className="items-center justify-center py-8">
              <Users size={48} color="#9CA3AF" />
              <Text className="text-xl font-semibold mt-4 text-gray-900">
                No Students Found
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                {searchQuery
                  ? "No students match your search"
                  : "Add students to your classes to get started"}
              </Text>
            </View>
          ) : (
            <VStack space="md">
              {filteredStudents.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  className="bg-gray-50 p-4 rounded-2xl border border-border-200 flex-row items-center shadow-sm"
                  onPress={() =>
                    router.push(`/teacher/student/${student.id}` as any)
                  }
                  activeOpacity={0.85}
                >
                  <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-4">
                    <User size={22} color="#9CA3AF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">
                      {student.name}
                    </Text>
                    <Text className="text-gray-600">
                      Roll No: {student.rollNo}
                    </Text>
                    <Text className="text-gray-600">
                      Class: {student.class}
                    </Text>
                  </View>
                  <View className="bg-blue-50 px-3 py-1 rounded-full ml-4">
                    <Text className="text-blue-600 font-semibold">
                      {student.attendance}%
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </VStack>
          )}
        </View>
      </ScrollView>
      <View className="absolute left-0 right-0 bottom-0 p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="w-full h-14 rounded-2xl shadow-md bg-primary-600 items-center justify-center flex-row"
          onPress={() => router.push("/teacher/add-student" as any)}
          activeOpacity={0.85}
        >
          <Text className="text-white font-semibold text-lg">Add Student</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
