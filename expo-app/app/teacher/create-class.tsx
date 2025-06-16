import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "@/app/context/AuthContext";
import { router } from "expo-router";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { ChevronLeft } from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from "@/components/ui/select";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SECTIONS = ["A", "B", "C", "D"];

export default function CreateClass() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [room, setRoom] = useState("");
  const toast = useToast();

  const handleCreateClass = async () => {
    if (!user) {
      router.replace("/auth/teacher-auth" as any);
      return;
    }

    if (
      !department ||
      !year ||
      !semester ||
      !section ||
      !subject ||
      !day ||
      !time ||
      !room
    ) {
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Please fill in all fields</Text>
          </View>
        ),
      });
      return;
    }

    setLoading(true);

    try {
      // Get teacher details
      const teacherRef = doc(db, "teachers", user.uid);
      const teacherSnap = await getDoc(teacherRef);

      if (!teacherSnap.exists()) {
        throw new Error("Teacher not found");
      }

      const teacherData = teacherSnap.data();
      const className = `${department} ${year} ${semester} Section ${section}`;

      // Create class document
      const classRef = await addDoc(collection(db, "classes"), {
        name: className,
        subject,
        department,
        year,
        semester,
        section,
        teacherId: user.uid,
        teacherName: teacherData.name,
        schedule: {
          day,
          time,
          room,
        },
        students: [], // Initialize empty students array
        createdAt: new Date(),
      });

      toast.show({
        render: () => (
          <View className="bg-success-500 p-4 rounded-lg">
            <Text className="text-white">Class created successfully!</Text>
          </View>
        ),
      });

      router.replace("/teacher/classes" as any);
    } catch (error) {
      console.error("Error creating class:", error);
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Error creating class</Text>
          </View>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-6 border-b border-gray-200">
        <TouchableOpacity className="mb-4" onPress={() => router.back()}>
          <HStack space="sm" className="items-center">
            <ChevronLeft size={24} color="#666" />
            <Text className="text-gray-600">Back to Classes</Text>
          </HStack>
        </TouchableOpacity>

        <Text className="text-2xl font-bold">Create New Class</Text>
      </View>

      {/* Form */}
      <ScrollView className="flex-1">
        <VStack space="lg" className="p-6">
          <VStack space="sm">
            <Text className="text-sm font-medium text-gray-700">
              Department
            </Text>
            <Input>
              <InputField
                placeholder="Enter department"
                value={department}
                onChangeText={setDepartment}
              />
            </Input>
          </VStack>

          <VStack space="sm">
            <Text className="text-sm font-medium text-gray-700">Year</Text>
            <Select selectedValue={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectInput placeholder="Select year" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {YEARS.map((y) => (
                    <SelectItem key={y} label={y} value={y} />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          </VStack>

          <VStack space="sm">
            <Text className="text-sm font-medium text-gray-700">Semester</Text>
            <Input>
              <InputField
                placeholder="Enter semester"
                value={semester}
                onChangeText={setSemester}
                keyboardType="numeric"
              />
            </Input>
          </VStack>

          <VStack space="sm">
            <Text className="text-sm font-medium text-gray-700">Section</Text>
            <Select selectedValue={section} onValueChange={setSection}>
              <SelectTrigger>
                <SelectInput placeholder="Select section" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s} label={s} value={s} />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          </VStack>

          <VStack space="sm">
            <Text className="text-sm font-medium text-gray-700">Subject</Text>
            <Input>
              <InputField
                placeholder="Enter subject"
                value={subject}
                onChangeText={setSubject}
              />
            </Input>
          </VStack>

          <VStack space="sm">
            <Text className="text-sm font-medium text-gray-700">Day</Text>
            <Select selectedValue={day} onValueChange={setDay}>
              <SelectTrigger>
                <SelectInput placeholder="Select day" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {DAYS.map((d) => (
                    <SelectItem key={d} label={d} value={d} />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          </VStack>

          <VStack space="sm">
            <Text className="text-sm font-medium text-gray-700">Time</Text>
            <Input>
              <InputField
                placeholder="Enter time (e.g., 9:00 AM - 10:30 AM)"
                value={time}
                onChangeText={setTime}
              />
            </Input>
          </VStack>

          <VStack space="sm">
            <Text className="text-sm font-medium text-gray-700">
              Room Number
            </Text>
            <Input>
              <InputField
                placeholder="Enter room number"
                value={room}
                onChangeText={setRoom}
              />
            </Input>
          </VStack>
        </VStack>
      </ScrollView>

      {/* Submit Button */}
      <View className="p-4 border-t border-gray-200">
        <Button
          className="w-full"
          onPress={handleCreateClass}
          disabled={loading}
        >
          <ButtonText>{loading ? "Creating..." : "Create Class"}</ButtonText>
        </Button>
      </View>
    </View>
  );
}
