import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";

import { Book, Users, Calendar, LogOut } from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { Button, ButtonText } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth, db } from "@/app/config/firebase";
import { useAuth } from "@/app/context/AuthContext";

interface TeacherProfile {
  name: string;
  email: string;
  subject: string;
  phone: string;
  classes: string[];
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      if (!user) {
        router.replace("/auth/teacher-auth" as any);
        return;
      }

      try {
        const docRef = doc(db, "teachers", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTeacherProfile(docSnap.data() as TeacherProfile);
        } else {
          toast.show({
            render: () => (
              <View className="bg-error-500 p-4 rounded-lg">
                <Text className="text-white">Teacher profile not found</Text>
              </View>
            ),
          });
          router.replace("/auth/teacher-auth" as any);
        }
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
        toast.show({
          render: () => (
            <View className="bg-error-500 p-4 rounded-lg">
              <Text className="text-white">Error loading profile</Text>
            </View>
          ),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/teacher-auth" as any);
    } catch (error) {
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Error signing out</Text>
          </View>
        ),
      });
    }
  };

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
          <Text className="text-2xl font-bold">Teacher Dashboard</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <LogOut size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View className="bg-blue-50 p-4 rounded-lg mb-6">
          <Text className="text-xl font-semibold mb-2">
            {teacherProfile?.name}
          </Text>
          <Text className="text-gray-600">{teacherProfile?.subject}</Text>
          <Text className="text-gray-600">{teacherProfile?.email}</Text>
          <Text className="text-gray-600">{teacherProfile?.phone}</Text>
        </View>

        <View className="space-y-4">
          <TouchableOpacity
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            onPress={() => router.push("/teacher/classes" as any)}
          >
            <View className="flex-row items-center">
              <Book size={24} color="#3b82f6" />
              <View className="ml-4">
                <Text className="text-lg font-semibold">My Classes</Text>
                <Text className="text-gray-600">
                  {teacherProfile?.classes.length || 0} classes
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            onPress={() => router.push("/teacher/students" as any)}
          >
            <View className="flex-row items-center">
              <Users size={24} color="#3b82f6" />
              <View className="ml-4">
                <Text className="text-lg font-semibold">Students</Text>
                <Text className="text-gray-600">View all students</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            onPress={() => router.push("/teacher/schedule" as any)}
          >
            <View className="flex-row items-center">
              <Calendar size={24} color="#3b82f6" />
              <View className="ml-4">
                <Text className="text-lg font-semibold">Schedule</Text>
                <Text className="text-gray-600">View class schedule</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
