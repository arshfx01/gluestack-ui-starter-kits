import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useAuth } from "@/app/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  getDocsFromServer,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { ChevronLeft, Search, Clock, Users } from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  present: boolean;
}

interface AttendanceStats {
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  attendancePercentage: number;
  currentStreak: number;
}

export default function ManageAttendance() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);
  const [stats, setStats] = useState<AttendanceStats>({
    totalClasses: 0,
    attendedClasses: 0,
    missedClasses: 0,
    attendancePercentage: 0,
    currentStreak: 0,
  });
  const toast = useToast();

  const fetchAttendanceStats = async () => {
    try {
      const attendanceQuery = query(
        collection(db, "attendance"),
        where("classId", "==", id)
      );
      const attendanceSnap = await getDocsFromServer(attendanceQuery);

      const totalClasses = attendanceSnap.size;
      let attendedClasses = 0;
      let currentStreak = 0;
      let tempStreak = 0;

      attendanceSnap.forEach((doc) => {
        const data = doc.data();
        if (data.present && data.present.length > 0) {
          attendedClasses++;
          tempStreak++;
        } else {
          tempStreak = 0;
        }
        if (tempStreak > currentStreak) {
          currentStreak = tempStreak;
        }
      });

      const missedClasses = totalClasses - attendedClasses;
      const attendancePercentage =
        totalClasses > 0
          ? Math.round((attendedClasses / totalClasses) * 100)
          : 0;

      setStats({
        totalClasses,
        attendedClasses,
        missedClasses,
        attendancePercentage,
        currentStreak,
      });
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
    }
  };

  const fetchStudents = async () => {
    if (!user) {
      router.replace("/auth/teacher-auth" as any);
      return;
    }

    try {
      // Verify class ownership
      const classRef = doc(db, "classes", id as string);
      const classSnap = await getDoc(classRef);

      if (!classSnap.exists()) {
        throw new Error("Class not found");
      }

      const classData = classSnap.data();
      if (classData.teacherId !== user.uid) {
        throw new Error("You don't have permission to manage this class");
      }

      // Check for existing attendance session
      const today = new Date().toISOString().split("T")[0];
      const attendanceRef = doc(db, "attendance", `${id}_${today}`);
      const attendanceSnap = await getDoc(attendanceRef);

      if (attendanceSnap.exists()) {
        const attendanceData = attendanceSnap.data();
        setSessionEndTime(new Date(attendanceData.endTime));
      } else {
        setSessionEndTime(null);
      }

      // Fetch student details
      const studentDetails: Student[] = [];
      for (const studentId of classData.students || []) {
        const studentRef = doc(db, "students", studentId);
        const studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
          const studentData = studentSnap.data();
          studentDetails.push({
            id: studentId,
            name: studentData.name || "Unknown",
            rollNumber: studentData.rollNumber || "N/A",
            present: attendanceSnap.exists()
              ? attendanceSnap.data().present?.includes(studentId) || false
              : false,
          });
        }
      }

      setStudents(studentDetails);
      setFilteredStudents(studentDetails);
      fetchAttendanceStats();
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">
              {error instanceof Error
                ? error.message
                : "Error loading students"}
            </Text>
          </View>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(fetchStudents, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [user, id]);

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  const startNewSession = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + 10); // 10 minutes from now

      await setDoc(doc(db, "attendance", `${id}_${today}`), {
        classId: id,
        date: today,
        startTime: new Date().toISOString(),
        endTime: endTime.toISOString(),
        present: [],
        createdBy: user.uid,
      });

      setSessionEndTime(endTime);
      toast.show({
        render: () => (
          <View className="bg-success-500 p-4 rounded-lg">
            <Text className="text-white">Attendance session started</Text>
          </View>
        ),
      });
    } catch (error) {
      console.error("Error starting session:", error);
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">
              {error instanceof Error
                ? error.message
                : "Error starting session"}
            </Text>
          </View>
        ),
      });
    }
  };

  const toggleAttendance = (studentId: string) => {
    if (!sessionEndTime || new Date() > sessionEndTime) {
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Session has ended</Text>
          </View>
        ),
      });
      return;
    }

    setStudents(
      students.map((student) =>
        student.id === studentId
          ? { ...student, present: !student.present }
          : student
      )
    );
  };

  const saveAttendance = async () => {
    if (!user) return;
    if (!sessionEndTime || new Date() > sessionEndTime) {
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Session has ended</Text>
          </View>
        ),
      });
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const presentStudents = students
        .filter((student) => student.present)
        .map((student) => student.id);

      await setDoc(doc(db, "attendance", `${id}_${today}`), {
        classId: id,
        date: today,
        startTime: sessionEndTime.toISOString(),
        endTime: sessionEndTime.toISOString(),
        present: presentStudents,
        createdBy: user.uid,
      });

      toast.show({
        render: () => (
          <View className="bg-success-500 p-4 rounded-lg">
            <Text className="text-white">Attendance saved successfully</Text>
          </View>
        ),
      });
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">
              {error instanceof Error
                ? error.message
                : "Error saving attendance"}
            </Text>
          </View>
        ),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Loading...</Text>
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

        <Text className="text-2xl font-bold">Manage Attendance</Text>
      </View>

      {/* Session Status */}
      <View className="p-4 bg-gray-50 border-b border-gray-200">
        <HStack space="sm" className="items-center">
          <Clock size={20} color="#666" />
          <Text className="text-gray-600">
            {!sessionEndTime ? (
              "No active session"
            ) : new Date() > sessionEndTime ? (
              <Text className="text-error-500">Session Expired</Text>
            ) : (
              `Session ends in: ${Math.max(
                0,
                Math.floor(
                  (sessionEndTime.getTime() - new Date().getTime()) / 1000 / 60
                )
              )} minutes`
            )}
          </Text>
        </HStack>
      </View>

      {/* Search Bar */}
      <View className="p-4 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-2">
          <Search size={20} color="#666" />
          <TextInput
            className="flex-1 ml-2 text-gray-700"
            placeholder="Search students..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Student List */}
      <View className="flex-1">
        {filteredStudents.length === 0 ? (
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-gray-500">No students found</Text>
          </View>
        ) : (
          <View className="p-4">
            {filteredStudents.map((student) => (
              <TouchableOpacity
                key={student.id}
                onPress={() => toggleAttendance(student.id)}
                className={`p-4 mb-2 rounded-lg border ${
                  student.present
                    ? "bg-success-50 border-success-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <HStack space="sm" className="items-center">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      student.present ? "bg-success-500" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-lg ${
                        student.present ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {student.present ? "✓" : "○"}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-700">
                      {student.name}
                    </Text>
                    <Text className="text-gray-500">
                      Roll No: {student.rollNumber}
                    </Text>
                  </View>
                </HStack>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View className="p-4 border-t border-gray-200">
        {!sessionEndTime ? (
          <Button onPress={startNewSession} className="w-full bg-primary-500">
            <ButtonText>Start Attendance Session</ButtonText>
          </Button>
        ) : new Date() > sessionEndTime ? (
          <Button onPress={startNewSession} className="w-full bg-primary-500">
            <ButtonText>Start New Session</ButtonText>
          </Button>
        ) : (
          <Button
            onPress={saveAttendance}
            disabled={saving}
            className="w-full bg-primary-500"
          >
            <ButtonText>{saving ? "Saving..." : "Save Attendance"}</ButtonText>
          </Button>
        )}
      </View>
    </View>
  );
}
