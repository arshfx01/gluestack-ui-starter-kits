import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import {
  Book,
  Users,
  Calendar,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { Button, ButtonText } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth, db } from "@/app/config/firebase";
import { useAuth } from "@/app/context/AuthContext";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";

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
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}

      <VStack space="xl" className="p-6 pb-20">
        {/* Profile Card */}
        <View className="bg-white rounded-2xl shadow-sm border border-border-200">
          <View className="flex-row items-center justify-between px-6 py-3 border-b border-border-200">
            <Text className="text-xl font-semibold text-gray-900">Profile</Text>
          </View>
          <VStack space="md" className="p-6">
            <HStack space="md" className="items-center">
              <View className="w-12 h-12 rounded-full bg-background-50 items-center justify-center">
                <Users size={24} color="#9CA3AF" />
              </View>
              <VStack>
                <Text className="text-lg font-semibold text-gray-900">
                  {teacherProfile?.name}
                </Text>
                <Text className="text-base text-gray-600">
                  {teacherProfile?.subject}
                </Text>
              </VStack>
            </HStack>
            <VStack space="sm">
              <HStack space="sm" className="items-center">
                <Text className="text-sm text-gray-500">Email:</Text>
                <Text className="text-sm text-gray-900">
                  {teacherProfile?.email}
                </Text>
              </HStack>
              <HStack space="sm" className="items-center">
                <Text className="text-sm text-gray-500">Phone:</Text>
                <Text className="text-sm text-gray-900">
                  {teacherProfile?.phone}
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-2xl shadow-sm border border-border-200">
          <View className="flex-row items-center justify-between px-6 py-3 border-b border-border-200">
            <Text className="text-xl font-semibold text-gray-900">
              Quick Actions
            </Text>
          </View>
          <VStack space="md" className="p-6">
            <TouchableOpacity
              className=" px-0 py-4 rounded-xl"
              onPress={() => router.push("/teacher/classes" as any)}
            >
              <HStack space="md" className="items-center">
                <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center">
                  <Book size={20} color="#9CA3AF" />
                </View>
                <VStack className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    My Classes
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {teacherProfile?.classes.length || 0} classes
                  </Text>
                </VStack>
                <ChevronRight size={20} color="#9CA3AF" />
              </HStack>
            </TouchableOpacity>

            <TouchableOpacity
              className=" px-0 py-4 rounded-xl"
              onPress={() => router.push("/teacher/students" as any)}
            >
              <HStack space="md" className="items-center">
                <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center">
                  <Users size={20} color="#9CA3AF" />
                </View>
                <VStack className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Students
                  </Text>
                  <Text className="text-sm text-gray-500">
                    View all students
                  </Text>
                </VStack>
                <ChevronRight size={20} color="#9CA3AF" />
              </HStack>
            </TouchableOpacity>

            <TouchableOpacity
              className=" px-0 py-4 rounded-xl"
              onPress={() => router.push("/teacher/schedule" as any)}
            >
              <HStack space="md" className="items-center">
                <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center">
                  <Calendar size={20} color="#9CA3AF" />
                </View>
                <VStack className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Schedule
                  </Text>
                  <Text className="text-sm text-gray-500">
                    View class schedule
                  </Text>
                </VStack>
                <ChevronRight size={20} color="#9CA3AF" />
              </HStack>
            </TouchableOpacity>
          </VStack>
        </View>
      </VStack>
    </ScrollView>
  );
}
