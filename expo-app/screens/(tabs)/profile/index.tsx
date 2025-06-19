import { Text } from "@/components/ui/text";
import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Badge, BadgeText } from "@/components/ui/badge";
import {
  Calendar,
  Mail,
  Phone,
  LogOut,
  BookOpen,
  GraduationCap,
  Award,
  Clock,
  User,
  Shield,
  Settings,
  ChevronRight,
  BookMarked,
  Target,
} from "lucide-react-native";
import { useAuth } from "@/app/context/AuthContext";
import { formatDistanceToNowStrict } from "date-fns";
import { auth } from "@/app/config/firebase";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
} from "@/components/ui/actionsheet";
import { LinearGradient } from "expo-linear-gradient";
import { gradientPairs } from "@/constants/gradients";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/config/firebase";

type Props = {};

// Extend UserProfile locally to allow extra fields
interface ExtendedUserProfile {
  fullName?: string;
  rollNo?: string;
  email?: string;
  role?: string;
  classId?: string;
  department?: string;
  semester?: string | number;
  year?: string | number;
  cgpa?: string | number;
  credits?: string | number;
}

// Function to hash a string and map it to an index
const hashStringToIndex = (str: string, max: number) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % max;
};

const Profile = (props: Props) => {
  const { user, userProfile } = useAuth();
  const [showLogoutSheet, setShowLogoutSheet] = React.useState(false);

  // Attendance stats state
  const [stats, setStats] = React.useState({
    totalClasses: 0,
    attendedClasses: 0,
    missedClasses: 0,
    attendancePercentage: 0,
    currentStreak: 0,
  });
  const [loadingStats, setLoadingStats] = React.useState(true);

  const profile: ExtendedUserProfile = userProfile || {};

  // Fetch attendance stats (copied from home)
  const fetchAttendanceStats = async () => {
    if (!user) return;
    try {
      const classesQuery = query(
        collection(db, "classes"),
        where("students", "array-contains", user.uid)
      );
      const classesSnap = await getDocs(classesQuery);
      const classesData = classesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      if (classesData.length === 0) {
        setStats({
          totalClasses: 0,
          attendedClasses: 0,
          missedClasses: 0,
          attendancePercentage: 0,
          currentStreak: 0,
        });
        return;
      }
      let totalClasses = 0;
      let attendedClasses = 0;
      let currentStreak = 0;
      let tempStreak = 0;
      let lastDate: string | null = null;
      for (const classData of classesData) {
        const attendanceQuery = query(
          collection(db, "attendance"),
          where("classId", "==", classData.id)
        );
        const attendanceSnap = await getDocs(attendanceQuery);
        const sortedAttendance = attendanceSnap.docs
          .map((doc) => doc.data())
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        sortedAttendance.forEach((record) => {
          if (record.present && Array.isArray(record.present)) {
            totalClasses++;
            if (record.present.includes(user.uid)) {
              attendedClasses++;
              const currentDate = record.date;
              if (lastDate) {
                const lastDateObj = new Date(lastDate);
                const currentDateObj = new Date(currentDate);
                const diffDays = Math.floor(
                  (currentDateObj.getTime() - lastDateObj.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                if (diffDays === 1) {
                  tempStreak++;
                } else {
                  tempStreak = 1;
                }
              } else {
                tempStreak = 1;
              }
              if (tempStreak > currentStreak) {
                currentStreak = tempStreak;
              }
              lastDate = currentDate;
            }
          }
        });
      }
      const missedClasses = totalClasses - attendedClasses;
      const attendancePercentage =
        totalClasses > 0
          ? Number(((attendedClasses / totalClasses) * 100).toFixed(2))
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
    } finally {
      setLoadingStats(false);
    }
  };

  React.useEffect(() => {
    fetchAttendanceStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const joinedAgo = user?.metadata?.creationTime
    ? formatDistanceToNowStrict(new Date(user.metadata.creationTime), {
        addSuffix: true,
      })
    : "N/A";

  const loginMethod = user?.email
    ? "Email"
    : user?.phoneNumber
    ? "Phone Number"
    : "N/A";

  // Use profile object for display values
  const displayUserName = profile.fullName || "Guest User";
  const displayRollNumber = profile.rollNo || "N/A";

  // Select gradient based on the user's name
  const gradientIndex = hashStringToIndex(
    displayUserName,
    gradientPairs.length
  );
  const selectedGradient = gradientPairs[gradientIndex];

  return (
    <ScrollView className="flex-1 bg-white">
      <VStack className="flex-1 items-center p-4" space="md">
        {/* Profile Header */}
        <VStack space="lg" className="items-center w-full">
          <Avatar
            size="2xl"
            className="bg-transparent items-center justify-center"
          >
            <LinearGradient
              colors={selectedGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: 9999,
              }}
            />
            <AvatarFallbackText className="text-white text-4xl">
              {displayUserName.charAt(0)}
            </AvatarFallbackText>
          </Avatar>

          <VStack space="xs" className="items-center">
            <Text
              className="text-3xl text-center text-background-950"
              style={{ fontFamily: "BGSB" }}
            >
              {displayUserName}
            </Text>
            <HStack className="items-center space-x-2" space="sm">
              <GraduationCap size={16} color="#6b7280" />
              <Text
                className="text-lg text-typography-500 tracking-tight"
                style={{ fontFamily: "BGSB" }}
              >
                Roll Number: {displayRollNumber}
              </Text>
            </HStack>
            {/* fetch students department */}
            <Badge className="bg-background-100 border border-border-200 rounded-md px-2 py-[1px]">
              <BadgeText
                className="text-xs  text-typography-600"
                style={{ fontFamily: "InterBold" }}
              >
                {profile.department || "N/A"}
              </BadgeText>
            </Badge>
          </VStack>
        </VStack>

        {/* Stats Cards */}
        <HStack className="w-full space-x-4" space="md">
          <View className="flex-1 border border-border-300 p-4 rounded-xl">
            <VStack space="xl" className="flex-1 justify-between h-full">
              <HStack className="items-center space-x-2 " space="md">
                <BookOpen size={20} color="#6b7280" />
                <Text className="text-typography-500">Attendance</Text>
              </HStack>
              <VStack space="xs">
                {loadingStats ? (
                  <Text
                    className="text-3xl text-typography-400"
                    style={{ fontFamily: "BGSB" }}
                  >
                    ...
                  </Text>
                ) : (
                  <HStack className="items-end">
                    <Text
                      className="text-3xl text-typography-900"
                      style={{ fontFamily: "BGSB" }}
                    >
                      {Math.floor(stats.attendancePercentage)}
                    </Text>
                    <Text
                      className="text-2xl text-typography-400"
                      style={{ fontFamily: "BGSB" }}
                    >
                      .
                      {((stats.attendancePercentage % 1) * 100)
                        .toFixed(0)
                        .padStart(2, "0")}
                    </Text>
                    <Text
                      className="text-2xl text-typography-400"
                      style={{ fontFamily: "BGSB" }}
                    >
                      %
                    </Text>
                  </HStack>
                )}
                <Text className="text-xs text-typography-400">
                  Total Classes: {stats.totalClasses}
                </Text>
              </VStack>
            </VStack>
          </View>
          <View className="flex-1 border border-border-300 min-h-40 p-4 rounded-xl">
            <VStack space="xl" className="flex-1 justify-between h-full">
              <HStack className="items-center space-x-2 " space="md">
                <Award size={20} color="#6b7280" />
                <Text className="text-typography-500">CGPA</Text>
              </HStack>
              <VStack space="xs">
                <Text
                  className="text-3xl text-typography-900"
                  style={{ fontFamily: "BGSB" }}
                >
                  {profile.cgpa || "N/A"}
                </Text>
                <Text className="text-xs text-typography-400">
                  Current Semester
                </Text>
              </VStack>
            </VStack>
          </View>
        </HStack>

        {/* Additional Stats */}
        <HStack className="w-full space-x-4" space="md">
          <View className="flex-1 border border-border-300 p-4 min-h-40 rounded-xl">
            <VStack space="xl" className="flex-1 justify-between h-full">
              <HStack className="items-center space-x-2 " space="md">
                <GraduationCap size={20} color="#6b7280" />
                <Text className="text-typography-500">Semester</Text>
              </HStack>
              <VStack space="xs">
                <Text
                  className="text-3xl text-typography-900"
                  style={{ fontFamily: "BGSB" }}
                >
                  {profile.year && profile.semester
                    ? `${profile.year}-${profile.semester}`
                    : profile.semester
                    ? `Semester ${profile.semester}`
                    : "N/A"}
                </Text>
                <Text className="text-xs text-typography-400">Out of 8</Text>
              </VStack>
            </VStack>
          </View>
          <View className="flex-1 border border-border-300 p-4 rounded-xl">
            <VStack space="xl" className="flex-1 justify-between h-full">
              <HStack className="items-center space-x-2 " space="md">
                <Clock size={20} color="#6b7280" />
                <Text className="text-typography-500">Credits</Text>
              </HStack>
              <VStack space="xs">
                <Text
                  className="text-3xl text-typography-900"
                  style={{ fontFamily: "BGSB" }}
                >
                  {profile.credits || "N/A"}
                </Text>
                <Text className="text-xs text-typography-400">
                  Required: 160
                </Text>
              </VStack>
            </VStack>
          </View>
        </HStack>

        {/* Contact Information */}
        <View className="w-full bg-background-50 border-border-200 border rounded-xl">
          <VStack className="w-full">
            <HStack className="items-center justify-between p-2 py-4  border-b border-border-200">
              <HStack className="items-center space-x-2" space="md">
                <User size={20} color="#6b7280" />
                <Text className="text-lg font-semibold text-typography-900">
                  Contact Information
                </Text>
              </HStack>
              <TouchableOpacity>
                <ChevronRight size={20} color="#6b7280" />
              </TouchableOpacity>
            </HStack>
            {user?.email && (
              <HStack
                space="md"
                className="items-center p-2 py-4 border-b border-border-200"
              >
                <Mail size={16} color="#6b7280" />
                <Text className="text-typography-500">{user.email}</Text>
              </HStack>
            )}
            {user?.phoneNumber && (
              <HStack
                space="md"
                className="items-center p-2 py-4 border-b border-border-200"
              >
                <Phone size={16} color="#6b7280" />
                <Text className="text-typography-500">{user.phoneNumber}</Text>
              </HStack>
            )}

            <VStack>
              <HStack className="items-center justify-between p-2 py-4 border-b border-border-200">
                <HStack className="items-center space-x-2" space="md">
                  <Shield size={20} color="#6b7280" />
                  <Text className="text-lg font-semibold text-typography-900">
                    Account Information
                  </Text>
                </HStack>
                <TouchableOpacity>
                  <ChevronRight size={20} color="#6b7280" />
                </TouchableOpacity>
              </HStack>
              <HStack
                space="xs"
                className="items-center p-2 py-4 border-b border-border-200"
              >
                <Badge
                  className="rounded-md px-2 py-[1px] bg-background-100"
                  variant="outline"
                  action="muted"
                  size="sm"
                >
                  <BadgeText className="text-xs font-bold text-primary-900">
                    Logged in with {loginMethod}
                  </BadgeText>
                </Badge>
              </HStack>
              <HStack space="md" className="items-center p-2 py-4">
                <Calendar size={16} color="#6b7280" />
                <Text className="text-typography-500">Joined {joinedAgo}</Text>
              </HStack>
            </VStack>
          </VStack>
        </View>

        {/* Settings Button */}
        <TouchableOpacity
          className="w-full flex-row items-center justify-between bg-background-50 p-4 rounded-xl border border-border-200"
          onPress={() => router.push("/settings" as any)}
        >
          <HStack className="items-center space-x-2" space="md">
            <Settings size={20} color="#6b7280" />
            <Text className="text-lg font-semibold text-typography-900">
              Settings
            </Text>
          </HStack>
          <ChevronRight size={20} color="#6b7280" />
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={() => setShowLogoutSheet(true)}
          className="w-full flex-row items-center justify-center bg-background-900 px-6 py-3 rounded-xl"
        >
          <LogOut size={20} color="white" />
          <Text className="text-white ml-2 text-lg font-bold">Logout</Text>
        </TouchableOpacity>
        <View className="h-16" />
      </VStack>

      <Actionsheet
        isOpen={showLogoutSheet}
        onClose={() => setShowLogoutSheet(false)}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <VStack space="md" className="justify-center w-full items-center">
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <Text
              style={{ fontFamily: "BGSB" }}
              className="text-2xl font-semibold text-black text-center mb-2"
            >
              Confirm Logout
            </Text>
            <Text className="text-sm text-typography-600 text-center mb-6">
              Are you sure you want to logout? You will need to login again to
              access your profile and other features.
            </Text>
            <ActionsheetItem
              onPress={handleLogout}
              className="bg-error-500 rounded-xl w-full flex justify-center items-center"
            >
              <ActionsheetItemText className="text-white text-lg font-semibold text-center">
                Logout
              </ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem
              onPress={() => setShowLogoutSheet(false)}
              className="bg-background-0 rounded-lg w-full flex justify-center items-center"
            >
              <ActionsheetItemText className="text-lg font-semibold text-center text-background-950">
                Cancel
              </ActionsheetItemText>
            </ActionsheetItem>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </ScrollView>
  );
};

export default Profile;
