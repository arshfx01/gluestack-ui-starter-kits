import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import { useAuth } from "@/app/context/AuthContext";
import { router } from "expo-router";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import {
  ChevronLeft,
  ChevronDown,
  Building2,
  CalendarDays,
  Hash,
  Book,
  Clock,
  DoorOpen,
  Layers3,
} from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

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

  // For dropdown modals
  const [showYearModal, setShowYearModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);

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

  // Helper for dropdown
  const renderDropdown: (
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    data: string[],
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    placeholder: string
  ) => JSX.Element = (
    visible,
    setVisible,
    data,
    value,
    setValue,
    placeholder
  ) => (
    <>
      <TouchableOpacity
        className="bg-gray-50 p-2 border border-border-200 rounded-2xl flex-row items-center mb-2"
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          className={`flex-1 text-base ${
            value ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {value || placeholder}
        </Text>
        <ChevronDown size={18} color="#9CA3AF" />
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }}
          onPress={() => setVisible(false)}
          activeOpacity={1}
        >
          <View
            style={{
              margin: 40,
              marginTop: 120,
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              elevation: 5,
            }}
          >
            <FlatList
              data={data}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setValue(item);
                    setVisible(false);
                  }}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                  }}
                >
                  <Text style={{ fontSize: 16, color: "#222" }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-6 border-b border-gray-200">
        <Text
          className="text-3xl  text-gray-900 mb-2"
          style={{ fontFamily: "BGSB" }}
        >
          Create New Class
        </Text>
        <Text className="text-base text-gray-500">
          Fill in the details below
        </Text>
      </View>

      {/* Form */}
      <ScrollView className="flex-1">
        <VStack space="lg" className="p-6">
          {/* Department */}
          <View className="bg-gray-50 p-3 border border-border-200 rounded-2xl mb-2 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-3">
              <Building2 size={20} color="#9CA3AF" />
            </View>
            <Text className="w-28 text-gray-700 font-medium">Department</Text>
            <TextInput
              placeholder="Enter department"
              value={department}
              onChangeText={setDepartment}
              className="flex-1 text-base text-gray-900 px-2"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Year */}
          <View className="bg-gray-50 p-3 border border-border-200 rounded-2xl mb-2 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-3">
              <CalendarDays size={20} color="#9CA3AF" />
            </View>
            <Text className="w-28 text-gray-700 font-medium">Year</Text>
            <TouchableOpacity
              className="flex-1 flex-row items-center px-2"
              onPress={() => setShowYearModal(true)}
              activeOpacity={0.7}
              style={{ minHeight: 40 }}
            >
              <Text
                className={`flex-1 text-base ${
                  year ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {year || "Select year"}
              </Text>
              <ChevronDown size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <Modal
            visible={showYearModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowYearModal(false)}
          >
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }}
              onPress={() => setShowYearModal(false)}
              activeOpacity={1}
            >
              <View
                style={{
                  margin: 40,
                  marginTop: 120,
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 16,
                  elevation: 5,
                }}
              >
                <FlatList
                  data={YEARS}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setYear(item);
                        setShowYearModal(false);
                      }}
                      style={{
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: "#eee",
                      }}
                    >
                      <Text style={{ fontSize: 16, color: "#222" }}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Semester */}
          <View className="bg-gray-50 p-3 border border-border-200 rounded-2xl mb-2 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-3">
              <Layers3 size={20} color="#9CA3AF" />
            </View>
            <Text className="w-28 text-gray-700 font-medium">Semester</Text>
            <TextInput
              placeholder="Enter semester"
              value={semester}
              onChangeText={setSemester}
              keyboardType="numeric"
              className="flex-1 text-base text-gray-900 px-2"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Section */}
          <View className="bg-gray-50 p-3 border border-border-200 rounded-2xl mb-2 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-3">
              <Hash size={20} color="#9CA3AF" />
            </View>
            <Text className="w-28 text-gray-700 font-medium">Section</Text>
            <TouchableOpacity
              className="flex-1 flex-row items-center px-2"
              onPress={() => setShowSectionModal(true)}
              activeOpacity={0.7}
              style={{ minHeight: 40 }}
            >
              <Text
                className={`flex-1 text-base ${
                  section ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {section || "Select section"}
              </Text>
              <ChevronDown size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <Modal
            visible={showSectionModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowSectionModal(false)}
          >
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }}
              onPress={() => setShowSectionModal(false)}
              activeOpacity={1}
            >
              <View
                style={{
                  margin: 40,
                  marginTop: 120,
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 16,
                  elevation: 5,
                }}
              >
                <FlatList
                  data={SECTIONS}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSection(item);
                        setShowSectionModal(false);
                      }}
                      style={{
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: "#eee",
                      }}
                    >
                      <Text style={{ fontSize: 16, color: "#222" }}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Subject */}
          <View className="bg-gray-50 p-3 border border-border-200 rounded-2xl mb-2 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-3">
              <Book size={20} color="#9CA3AF" />
            </View>
            <Text className="w-28 text-gray-700 font-medium">Subject</Text>
            <TextInput
              placeholder="Enter subject"
              value={subject}
              onChangeText={setSubject}
              className="flex-1 text-base text-gray-900 px-2"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Day */}
          <View className="bg-gray-50 p-3 border border-border-200 rounded-2xl mb-2 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-3">
              <CalendarDays size={20} color="#9CA3AF" />
            </View>
            <Text className="w-28 text-gray-700 font-medium">Day</Text>
            <TouchableOpacity
              className="flex-1 flex-row items-center px-2"
              onPress={() => setShowDayModal(true)}
              activeOpacity={0.7}
              style={{ minHeight: 40 }}
            >
              <Text
                className={`flex-1 text-base ${
                  day ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {day || "Select day"}
              </Text>
              <ChevronDown size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <Modal
            visible={showDayModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDayModal(false)}
          >
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }}
              onPress={() => setShowDayModal(false)}
              activeOpacity={1}
            >
              <View
                style={{
                  margin: 40,
                  marginTop: 120,
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 16,
                  elevation: 5,
                }}
              >
                <FlatList
                  data={DAYS}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setDay(item);
                        setShowDayModal(false);
                      }}
                      style={{
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: "#eee",
                      }}
                    >
                      <Text style={{ fontSize: 16, color: "#222" }}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Time */}
          <View className="bg-gray-50 p-3 border border-border-200 rounded-2xl mb-2 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-3">
              <Clock size={20} color="#9CA3AF" />
            </View>
            <Text className="w-28 text-gray-700 font-medium">Time</Text>
            <TextInput
              placeholder="Enter time (e.g., 9:00 AM - 10:30 AM)"
              value={time}
              onChangeText={setTime}
              className="flex-1 text-base text-gray-900 px-2"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Room Number */}
          <View className="bg-gray-50 p-3 border border-border-200 rounded-2xl mb-2 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-3">
              <DoorOpen size={20} color="#9CA3AF" />
            </View>
            <Text className="w-28 text-gray-700 font-medium">Room No.</Text>
            <TextInput
              placeholder="Enter room number"
              value={room}
              onChangeText={setRoom}
              className="flex-1 text-base text-gray-900 px-2"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </VStack>
      </ScrollView>

      {/* Submit Button */}
      <View className="p-4 border-t border-gray-200">
        <Button
          className="w-full h-14 rounded-2xl shadow-md bg-primary-600"
          onPress={handleCreateClass}
          disabled={loading}
        >
          <HStack space="sm" className="items-center justify-center">
            <ButtonText className="text-white font-semibold">
              {loading ? "Creating..." : "Create Class"}
            </ButtonText>
          </HStack>
        </Button>
      </View>
    </View>
  );
}
