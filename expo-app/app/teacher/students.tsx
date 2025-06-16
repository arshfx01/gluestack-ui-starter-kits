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
import { Users, Search, UserPlus } from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { Input, InputField, InputSlot } from "@/components/ui/input";

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
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold">Students</Text>
          <TouchableOpacity
            className="bg-blue-500 p-2 rounded-full"
            onPress={() => router.push("/teacher/add-student" as any)}
          >
            <UserPlus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <Input className="mb-6">
          <InputSlot>
            <Search size={20} color="#666" />
          </InputSlot>
          <InputField
            placeholder="Search students..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Input>

        {filteredStudents.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Users size={48} color="#666" />
            <Text className="text-xl font-semibold mt-4">
              No Students Found
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              {searchQuery
                ? "No students match your search"
                : "Add students to your classes to get started"}
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {filteredStudents.map((student) => (
              <TouchableOpacity
                key={student.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                onPress={() =>
                  router.push(`/teacher/student/${student.id}` as any)
                }
              >
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-lg font-semibold">
                      {student.name}
                    </Text>
                    <Text className="text-gray-600">
                      Roll No: {student.rollNo}
                    </Text>
                    <Text className="text-gray-600">
                      Class: {student.class}
                    </Text>
                  </View>
                  <View className="bg-blue-50 px-3 py-1 rounded-full">
                    <Text className="text-blue-600 font-semibold">
                      {student.attendance}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
