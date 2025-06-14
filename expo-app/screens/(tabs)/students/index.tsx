import { VStack } from "@/components/ui/vstack";
import { ScrollView, View } from "react-native";
import { SettingsLayout } from "@/screens/settings/layout";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Search, Users, UserPlus, Filter } from "lucide-react-native";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Pressable } from "@/components/ui/pressable";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { useAuth } from "@/app/context/AuthContext";
import { ActivityIndicator } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";

interface User {
  id: string;
  fullName: string;
  rollNo: string;
  email: string;
  role: "teacher" | "student";
  classId: string;
  attendance?: number;
}

const UserCard = ({ user }: { user: User }) => {
  return (
    <Pressable
      onPress={() => router.push(`/student/${user.id}`)}
      className="w-full bg-background-50 rounded-xl p-3  border border-border-200"
    >
      <HStack className="items-center justify-between">
        <HStack className="items-center space-x-3" space="md">
          <Avatar size="md" className="bg-primary-100">
            <AvatarFallbackText className="text-primary-600">
              {user.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallbackText>
          </Avatar>
          <VStack>
            <Text className="font-medium text-typography-900">
              {user.fullName}
            </Text>
            <HStack className="items-center space-x-2">
              <Text className="text-typography-500 text-sm">{user.rollNo}</Text>
            </HStack>
          </VStack>
        </HStack>
        <VStack className="items-end">
          <View
            className={`px-2 py-1 rounded-full ${
              user.role === "teacher" ? "bg-primary-100" : "bg-secondary-100"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                user.role === "teacher"
                  ? "text-primary-600"
                  : "text-secondary-600"
              }`}
            >
              {user.role === "teacher" ? "Teacher" : "Student"}
            </Text>
          </View>
          {user.role === "student" && (
            <Text className="text-typography-500 text-sm mt-1">
              {user.attendance || 0}% Attendance
            </Text>
          )}
        </VStack>
      </HStack>
    </Pressable>
  );
};

const UsersScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { userProfile } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        const usersData: User[] = [];

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          usersData.push({
            id: doc.id,
            fullName: userData.fullName,
            rollNo: userData.rollNo,
            email: userData.email,
            role: userData.role,
            classId: userData.classId,
            attendance: userData.attendance,
          } as User);
        });

        // Sort users: teachers first, then students
        const sortedUsers = usersData.sort((a, b) => {
          if (a.role === "teacher" && b.role === "student") return -1;
          if (a.role === "student" && b.role === "teacher") return 1;
          return 0;
        });

        setUsers(sortedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <VStack className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </VStack>
    );
  }

  return (
    <ScrollView className="flex-1">
      <VStack className=" space-y-4 pb-20" space="md">
        <HStack className="justify-between items-center">
          <VStack>
            <Heading
              className="text-2xl font-medium"
              style={{ fontFamily: "BGSB" }}
            >
              Users
            </Heading>
            <Text className="text-typography-500">
              View all users in the system
            </Text>
          </VStack>
          <Button
            size="sm"
            variant="solid"
            action="primary"
            onPress={() => router.push("/add-user")}
          >
            <ButtonText>Add User</ButtonText>
          </Button>
        </HStack>

        <HStack className="space-x-2">
          <Input className="flex-1 bg-background-50">
            <InputSlot>
              <InputIcon as={Search} />
            </InputSlot>
            <InputField
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </Input>
          <Button
            size="sm"
            variant="outline"
            action="secondary"
            onPress={() => {}}
          >
            <Filter size={20} />
          </Button>
        </HStack>

        <Divider />

        <VStack className="space-y-2" space="md">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => <UserCard key={user.id} user={user} />)
          ) : (
            <VStack className="items-center justify-center py-8 space-y-4">
              <Users size={48} color="#94a3b8" />
              <Text className="text-typography-500 text-center">
                No users found
              </Text>
              <Button
                size="sm"
                variant="outline"
                action="secondary"
                onPress={() => router.push("/add-user")}
              >
                <ButtonText>Add New User</ButtonText>
              </Button>
            </VStack>
          )}
        </VStack>
      </VStack>
    </ScrollView>
  );
};

export const Students = () => {
  return <SettingsLayout children={<UsersScreen />} />;
};
