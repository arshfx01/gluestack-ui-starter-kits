import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Animated,
} from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import {
  Clock,
  BookOpen,
  Users,
  MapPin,
  Video,
  InfoIcon,
  ArrowRight,
  Calendar,
  CalendarClock,
  History,
} from "lucide-react-native";
import { router } from "expo-router";
import { useAuth } from "@/app/context/AuthContext";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { useToast } from "@/components/ui/toast";

interface Class {
  id: string;
  name: string;
  subject: string;
  department: string;
  year: string;
  semester: string;
  section: string;
  teacherName: string;
  schedule: {
    day: string;
    time: string;
    room: string;
  } | null;
  attendance?: {
    percentage: number;
    attended: number;
    missed: number;
    total: number;
    streak: number;
  };
}

export type ClassCardProps = {
  id: string;
  title: string;
  time: string;
  room: string;
  instructor: string;
  type: string;
  isLive?: boolean;
  attendance?: {
    percentage: number;
    attended: number;
    missed: number;
    total: number;
    streak: number;
  };
};

export const ClassCard = ({
  id,
  title,
  time,
  room,
  instructor,
  type,
  isLive = false,
  attendance,
}: ClassCardProps) => (
  <TouchableOpacity
    className="w-full mb-4 bg-gray-50 border hover:bg-gray-100 border-gray-300 rounded-xl"
    onPress={() => router.push(`/student/class/${id}` as any)}
  >
    <VStack className="w-full">
      {/* Header */}
      <HStack className="flex border-gray-300 p-3 border-b w-full justify-between">
        <HStack space="sm" className="items-center">
          <View className="bg-gray-100 p-3 rounded-lg">
            <BookOpen size={20} color="#5c5c5c" />
          </View>
          <VStack className="px-2">
            <Text
              className="text-lg text-gray-900"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            <Text className="text font-semibold text-gray-500">
              Class Count: 45
            </Text>
          </VStack>
        </HStack>

        {isLive && (
          <View className="bg-green-100 items-center flex justify-center gap-2 max-h-8 px-3 py-1 rounded-full">
            <Text className="text-green-600 text-sm font-semibold">LIVE</Text>
          </View>
        )}
      </HStack>

      <VStack space="sm" className="p-3 w-full">
        <View>
          <HStack space="xs" className="items-center w-fit">
            <Clock size={16} color="#5c5c5c" />
            <Text className="underline">{type}</Text>
          </HStack>
        </View>

        {/* Class Details */}
        <HStack className="flex justify-between w-full">
          <VStack className="w-full">
            <HStack
              space="md"
              className="items-center flex justify-between w-full"
            >
              <HStack space="xs" className="items-center">
                <Clock size={16} color="#5c5c5c" />
                <Text className="">{time}</Text>
              </HStack>
              <HStack space="xs" className="items-center">
                <MapPin size={16} color="#5c5c5c" />
                <Text className="">{room}</Text>
              </HStack>
            </HStack>

            <HStack
              space="md"
              className="items-center flex w-full justify-between mt-1"
            >
              <HStack space="xs" className="items-center">
                <Users size={16} color="#5c5c5c" />
                <Text
                  className="text-gray-900 max-w-30"
                  ellipsizeMode="tail"
                  numberOfLines={1}
                >
                  {instructor}
                </Text>
              </HStack>

              <HStack space="xs" className="items-center">
                <Video size={16} color="#5c5c5c" />
                <Text className="text-gray-900">{type}</Text>
              </HStack>
            </HStack>
          </VStack>
        </HStack>
      </VStack>

      <HStack className="flex border-gray-300 p-3 border-t justify-between">
        <HStack className="flex gap-2">
          <Text className="px-2 py-1 max-w-fit bg-gray-100 rounded-md">
            Attended: {attendance?.attended || 0}
          </Text>

          <Text className="px-2 py-1 bg-gray-100 rounded-md">
            Missed: {attendance?.missed || 0}
          </Text>
        </HStack>
        <View className="flex items-center justify-center">
          <ArrowRight size={16} color="#5c5c5c" />
        </View>
      </HStack>
    </VStack>
  </TouchableOpacity>
);

type TabType = "current" | "upcoming" | "previous";

type ClassScheduleProps = {
  onViewAll?: () => void;
  showViewAll?: boolean;
};

export const ClassSchedule = ({
  onViewAll,
  showViewAll = true,
}: ClassScheduleProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("current");
  const toast = useToast();
  const pan = useRef(new Animated.ValueXY()).current;

  const fetchClasses = async () => {
    if (!user) {
      router.replace("/auth/student-auth" as any);
      return;
    }

    try {
      // Get all classes
      const classesRef = collection(db, "classes");
      const classesSnap = await getDocs(classesRef);

      const classesData: Class[] = [];
      classesSnap.forEach((doc) => {
        const classData = doc.data();
        classesData.push({
          id: doc.id,
          name: classData.name,
          subject: classData.subject,
          department: classData.department,
          year: classData.year,
          semester: classData.semester,
          section: classData.section,
          teacherName: classData.teacherName,
          schedule: classData.schedule || null,
          attendance: {
            percentage: 0,
            attended: 0,
            missed: 0,
            total: 0,
            streak: 0,
          },
        });
      });

      // Sort classes by department, year, and section
      classesData.sort((a, b) => {
        if (a.department !== b.department) {
          return a.department.localeCompare(b.department);
        }
        if (a.year !== b.year) {
          return a.year.localeCompare(b.year);
        }
        return a.section.localeCompare(b.section);
      });

      setClasses(classesData);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Error loading classes</Text>
          </View>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        pan.x.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = 50;
        if (Math.abs(gestureState.dx) > swipeThreshold) {
          const tabs: TabType[] = ["current", "upcoming", "previous"];
          const currentIndex = tabs.indexOf(activeTab);
          let newIndex = currentIndex;

          if (gestureState.dx > 0 && currentIndex > 0) {
            // Swipe right
            newIndex = currentIndex - 1;
          } else if (gestureState.dx < 0 && currentIndex < tabs.length - 1) {
            // Swipe left
            newIndex = currentIndex + 1;
          }

          if (newIndex !== currentIndex) {
            setActiveTab(tabs[newIndex]);
          }
        }

        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const tabs: { id: TabType; label: string }[] = [
    { id: "current", label: "Current" },
    { id: "upcoming", label: "Upcoming" },
    { id: "previous", label: "Previous" },
  ];

  const getCurrentClass = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    return classes.find((classItem) => {
      if (!classItem.schedule) return false;
      const [startHour] = classItem.schedule.time.split(":").map(Number);
      const dayMap: { [key: string]: number } = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
        Sunday: 0,
      };
      return (
        dayMap[classItem.schedule.day] === currentDay &&
        startHour === currentHour
      );
    });
  };

  const getUpcomingClasses = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    return classes.filter((classItem) => {
      if (!classItem.schedule) return false;
      const [startHour] = classItem.schedule.time.split(":").map(Number);
      const dayMap: { [key: string]: number } = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
        Sunday: 0,
      };
      return (
        dayMap[classItem.schedule.day] === currentDay && startHour > currentHour
      );
    });
  };

  const getPreviousClasses = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    return classes.filter((classItem) => {
      if (!classItem.schedule) return false;
      const [startHour] = classItem.schedule.time.split(":").map(Number);
      const dayMap: { [key: string]: number } = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
        Sunday: 0,
      };
      return (
        dayMap[classItem.schedule.day] === currentDay && startHour < currentHour
      );
    });
  };

  const EmptyState = ({
    icon: Icon,
    title,
    message,
  }: {
    icon: any;
    title: string;
    message: string;
  }) => (
    <View className="items-center justify-center py-12 px-6">
      <View className="w-16 h-16 rounded-full bg-gray-50 items-center justify-center mb-4">
        <Icon size={32} color="#6366F1" />
      </View>
      <Text className="text-xl font-semibold text-gray-900 mb-2">{title}</Text>
      <Text className="text-base text-gray-500 text-center">{message}</Text>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-gray-600">Loading...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case "current":
        const currentClass = getCurrentClass();
        return currentClass ? (
          <VStack space="md">
            <HStack className="justify-between items-center">
              <HStack space="sm" className="items-center">
                <Text
                  fontWeight="bold"
                  className="text-lg font-medium text-gray-900"
                >
                  Current Ongoing Class
                </Text>
              </HStack>
              <InfoIcon color="#cbcbcb" size={18} />
            </HStack>
            <ClassCard
              id={currentClass.id}
              title={currentClass.subject}
              time={currentClass.schedule?.time || ""}
              room={currentClass.schedule?.room || ""}
              instructor={currentClass.teacherName}
              type={`${currentClass.year} - ${currentClass.semester} Sem ${currentClass.section}`}
              isLive={true}
              attendance={currentClass.attendance}
            />
          </VStack>
        ) : (
          <EmptyState
            icon={CalendarClock}
            title="No Current Class"
            message="There are no classes running at the moment. Check the upcoming classes tab for your next class."
          />
        );

      case "upcoming":
        const upcomingClasses = getUpcomingClasses();
        return upcomingClasses.length > 0 ? (
          <VStack space="md">
            <HStack className="justify-between items-center">
              <HStack space="sm" className="items-center">
                <Text
                  fontWeight="bold"
                  className="text-lg font-medium text-gray-900"
                >
                  Upcoming Classes
                </Text>
              </HStack>
              <InfoIcon color="#cbcbcb" size={18} />
            </HStack>
            {upcomingClasses.map((classItem) => (
              <ClassCard
                key={classItem.id}
                id={classItem.id}
                title={classItem.subject}
                time={classItem.schedule?.time || ""}
                room={classItem.schedule?.room || ""}
                instructor={classItem.teacherName}
                type={`${classItem.year} - ${classItem.semester} Sem ${classItem.section}`}
                attendance={classItem.attendance}
              />
            ))}
          </VStack>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No Upcoming Classes"
            message="You don't have any classes scheduled for the rest of the day. Enjoy your free time!"
          />
        );

      case "previous":
        const previousClasses = getPreviousClasses();
        return previousClasses.length > 0 ? (
          <VStack space="md">
            <HStack className="justify-between items-center">
              <HStack space="sm" className="items-center">
                <Text
                  fontWeight="bold"
                  className="text-lg font-medium text-gray-900"
                >
                  Previous Classes
                </Text>
              </HStack>
              <InfoIcon color="#cbcbcb" size={18} />
            </HStack>
            {previousClasses.map((classItem) => (
              <ClassCard
                key={classItem.id}
                id={classItem.id}
                title={classItem.subject}
                time={classItem.schedule?.time || ""}
                room={classItem.schedule?.room || ""}
                instructor={classItem.teacherName}
                type={`${classItem.year} - ${classItem.semester} Sem ${classItem.section}`}
                attendance={classItem.attendance}
              />
            ))}
          </VStack>
        ) : (
          <EmptyState
            icon={History}
            title="No Previous Classes"
            message="You haven't had any classes today yet. Check the current or upcoming classes tab."
          />
        );
    }
  };

  return (
    <VStack className="w-full">
      {/* Tabs */}
      <HStack className="w-full flex border-b border-gray-300">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            className={`px-3 max-w-fit py-1 ${
              activeTab === tab.id
                ? "border-b border-gray-900"
                : "border-b border-gray-300"
            }`}
            style={{
              borderBottomWidth: activeTab === tab.id ? 3 : 0,
              borderBottomLeftRadius: 2,
              borderBottomRightRadius: 2,
            }}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              fontWeight="bold"
              className={`text-center text-lg ${
                activeTab === tab.id ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </HStack>

      {/* Content */}
      <Animated.View
        style={{
          transform: [{ translateX: pan.x }],
        }}
        {...panResponder.panHandlers}
      >
        <ScrollView className="">
          <VStack className="py-4" space="md">
            {renderContent()}
          </VStack>
        </ScrollView>
      </Animated.View>
    </VStack>
  );
};
