import React from "react";
import { View, TouchableOpacity } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Image } from "@/components/ui/image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Mail,
  Phone,
  BookOpen,
  Users,
  Edit2,
  Trash2,
} from "lucide-react-native";
import { useRouter } from "expo-router";

interface TeacherCardProps {
  teacher: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    subjects?: string[];
    classId?: string;
    profileImage?: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({
  teacher,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();

  // Function to hash a string and map it to an index for gradient
  const hashStringToIndex = (str: string, max: number) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % max;
  };

  const gradientPairs = [
    ["#d946ef", "#a855f7"], // Pink to Purple
    ["#3b82f6", "#22d3ee"], // Blue to Cyan
    ["#f97316", "#facc15"], // Orange to Yellow
    ["#10b981", "#34d399"], // Green to Light Green
    ["#ef4444", "#f87171"], // Red to Light Red
  ];

  const gradientIndex = hashStringToIndex(
    teacher.fullName,
    gradientPairs.length
  );
  const selectedGradient = gradientPairs[gradientIndex];

  return (
    <TouchableOpacity
      onPress={() => router.push(`/teacher/${teacher.id}`)}
      className="bg-white rounded-xl shadow-sm border border-border-200 overflow-hidden"
    >
      <VStack space="md" className="p-4">
        <HStack className="items-center justify-between">
          <HStack space="md" className="items-center">
            <View className="relative w-16 h-16 rounded-full overflow-hidden">
              {teacher.profileImage ? (
                <Image
                  source={{ uri: teacher.profileImage }}
                  alt={teacher.fullName}
                  className="w-full h-full"
                />
              ) : (
                <LinearGradient
                  colors={selectedGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-full h-full items-center justify-center"
                >
                  <Text className="text-white text-2xl font-bold">
                    {teacher.fullName.charAt(0)}
                  </Text>
                </LinearGradient>
              )}
            </View>
            <VStack>
              <Text className="text-lg font-semibold text-typography-900">
                {teacher.fullName}
              </Text>
              <Badge
                className="rounded-md px-2 py-[1px]"
                variant="outline"
                action="muted"
                size="sm"
              >
                <BadgeText className="text-xs font-bold">teacher</BadgeText>
              </Badge>
            </VStack>
          </HStack>
          <HStack space="sm">
            <TouchableOpacity
              onPress={() => onEdit?.(teacher.id)}
              className="p-2 rounded-full bg-background-50"
            >
              <Edit2 size={18} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete?.(teacher.id)}
              className="p-2 rounded-full bg-background-50"
            >
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </HStack>
        </HStack>

        <HStack className="items-center space-x-4">
          <HStack space="sm" className="items-center">
            <Mail size={16} color="#666" />
            <Text className="text-sm text-typography-600">{teacher.email}</Text>
          </HStack>
          {teacher.phoneNumber && (
            <HStack space="sm" className="items-center">
              <Phone size={16} color="#666" />
              <Text className="text-sm text-typography-600">
                {teacher.phoneNumber}
              </Text>
            </HStack>
          )}
        </HStack>

        {teacher.subjects && teacher.subjects.length > 0 && (
          <HStack space="sm" className="items-center">
            <BookOpen size={16} color="#666" />
            <Text className="text-sm text-typography-600">
              {teacher.subjects.join(", ")}
            </Text>
          </HStack>
        )}

        {teacher.classId && (
          <HStack space="sm" className="items-center">
            <Users size={16} color="#666" />
            <Text className="text-sm text-typography-600">
              Class ID: {teacher.classId}
            </Text>
          </HStack>
        )}
      </VStack>
    </TouchableOpacity>
  );
};
