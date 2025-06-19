import React from "react";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import {
  CheckIcon,
  Home,
  QrCode,
  QrCodeIcon,
  Scan,
  Settings,
  SparkleIcon,
  Sparkles,
  Clock,
  MapPin,
  Book,
} from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { router, useSegments } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { HomeIcon } from "./HomeIcon";
import { useBottomBtns } from "../hooks/useBottomBtns";
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
} from "@/components/ui/actionsheet";
import { useAuth } from "@/app/context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { VStack } from "./ui/vstack";

type Props = {};

interface LiveClass {
  id: string;
  name: string;
  subject: string;
  schedule: {
    day: string;
    time: string;
    room: string;
  };
  isActive: boolean;
}

const BottomBtns = (props: Props) => {
  const { isVisible } = useBottomBtns();
  const { user, userProfile } = useAuth();
  const [showActionsheet, setShowActionsheet] = React.useState(false);
  const [liveClasses, setLiveClasses] = React.useState<LiveClass[]>([]);
  const segments = useSegments();
  const isTeacherRoute = segments[0] === "teacher";
  const userRole = isTeacherRoute ? "teacher" : userProfile?.role || "student";

  const fetchLiveClasses = async () => {
    try {
      // Fetch all classes, not just those the user is enrolled in
      const q = query(collection(db, "classes"));
      const querySnapshot = await getDocs(q);
      const currentTime = new Date();
      const today = new Date().toISOString().split("T")[0];

      const classes: LiveClass[] = [];
      for (const docSnap of querySnapshot.docs) {
        const classData = docSnap.data();
        let isActive = false;
        if (classData.schedule) {
          // Check for active attendance session
          const attendanceRef = doc(db, "attendance", `${docSnap.id}_${today}`);
          const attendanceSnap = await getDoc(attendanceRef);
          if (attendanceSnap.exists()) {
            const attendanceData = attendanceSnap.data();
            const sessionEndTime = new Date(attendanceData.endTime);
            if (currentTime < sessionEndTime) {
              isActive = true;
            }
          }
        }
        classes.push({
          id: docSnap.id,
          name: classData.name,
          subject: classData.subject,
          schedule: classData.schedule,
          isActive,
        });
      }
      setLiveClasses(classes);
    } catch (error) {
      console.error("Error fetching live classes:", error);
    }
  };

  const handleOpenActionsheet = async () => {
    await fetchLiveClasses();
    setShowActionsheet(true);
  };

  const handleCloseActionsheet = () => setShowActionsheet(false);

  const handleSelectClass = (classId: string) => {
    router.push(`/student/class/${classId}/attendance` as any);
    handleCloseActionsheet();
  };

  if (!isVisible) return null;

  return (
    <LinearGradient
      colors={["transparent", "#FFFFFF", "#FFFFFF"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      className="absolute bottom-0 left-0 right-0 px-6"
    >
      <HStack className="flex items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            if (userRole === "teacher") {
              router.push("/teacher/dashboard");
            } else {
              router.push("/(tabs)");
            }
          }}
          className="bg-white/50 border border-background-200 rounded-full p-4 hover:bg-background-200 flex items-center justify-center"
        >
          <HomeIcon color="#5c5c5c" width={24} height={24} />
        </TouchableOpacity>

        {user ? (
          userRole === "teacher" ? (
            <Button
              className="h-14 bg-black flex gap-4 w-[60%] rounded-2xl"
              onPress={() => router.push("/teacher/classes")}
              variant="solid"
              action="primary"
            >
              <ButtonIcon>
                <Book size={20} strokeWidth={2} color="white" />
              </ButtonIcon>
              <ButtonText className="" style={{ fontFamily: "BGSB" }}>
                My Classes
              </ButtonText>
            </Button>
          ) : (
            <Button
              className="h-14 bg-black  flex gap-4 w-[60%] rounded-2xl"
              onPress={handleOpenActionsheet}
              variant="solid"
              action="primary"
            >
              <ButtonIcon>
                <Sparkles size={18} strokeWidth={2} color="white" />
              </ButtonIcon>
              <ButtonText className="" style={{ fontFamily: "BGSB" }}>
                Mark
              </ButtonText>
              <ButtonIcon>
                <CheckIcon size={20} strokeWidth={2} color="white" />
              </ButtonIcon>
            </Button>
          )
        ) : null}

        <TouchableOpacity
          onPress={() => {
            if (userRole === "teacher") {
              router.push("/teacher/settings" as any);
            } else {
              router.push("/settings");
            }
          }}
          className="bg-white-50 border border-background-200 rounded-full p-4 hover:bg-background-200 flex items-center justify-center"
        >
          <Settings color="#5c5c5c" size={24} />
        </TouchableOpacity>
      </HStack>

      <Actionsheet isOpen={showActionsheet} onClose={handleCloseActionsheet}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-background-100 p-0">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack space="md" className=" w-full pb-20">
            <View className="p-4 text-center border-b border-border-300">
              <Text className="text-lg font-semibold text-center text-typography-950 ">
                Select Live Class to Mark Attendance
              </Text>
            </View>
            {liveClasses.length === 0 ? (
              <VStack
                space="sm"
                className="items-center justify-center py-10 px-4 pb-20"
              >
                <Text className="text-typography-500">No classes found.</Text>
              </VStack>
            ) : (
              liveClasses
                .filter((classItem) => classItem.isActive)
                .map((classItem) => (
                  <ActionsheetItem
                    key={classItem.id}
                    onPress={() => handleSelectClass(classItem.id)}
                    className="flex-row items-center justify-between p-4 border-b border-border-300 hover:bg-background-100 active:bg-background-100"
                  >
                    <VStack>
                      <ActionsheetItemText className="text-base font-medium text-typography-950">
                        {classItem.subject} - {classItem.name}
                      </ActionsheetItemText>
                      <HStack space="xs" className="items-center">
                        <Clock size={14} color="#6b7280" />
                        <ActionsheetItemText className="text-sm text-typography-500">
                          {classItem.schedule?.time}
                        </ActionsheetItemText>
                        <MapPin size={14} color="#6b7280" />
                        <ActionsheetItemText className="text-sm text-typography-500">
                          {classItem.schedule?.room}
                        </ActionsheetItemText>
                        <Text className="ml-2 text-success-600 font-bold">
                          Active
                        </Text>
                      </HStack>
                    </VStack>
                  </ActionsheetItem>
                ))
            )}
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </LinearGradient>
  );
};

export default BottomBtns;
