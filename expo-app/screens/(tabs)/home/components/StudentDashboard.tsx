import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { Grid, GridItem } from "@/components/ui/grid";
import {
  InfoIcon,
  QrCodeIcon,
  ActivityIcon,
  CalendarIcon,
  TrendingUpIcon,
} from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { router } from "expo-router";

export const StudentDashboard = () => {
  return (
    <VStack className="w-full" space="md">
      <View className="w-full min-h-40 bg-background-100 border border-border-300 rounded-xl">
        <VStack className="w-full " space="md">
          <HStack className="flex border-border-300 p-3 border-b justify-between">
            <Text>My Attendance</Text>
            <InfoIcon color="#5c5c5c" />
          </HStack>
          <HStack className="flex p-3 justify-between">
            <VStack className="" space="md">
              <HStack className="flex items-center gap-0">
                <Text
                  className="text-5xl text-[#000] "
                  style={{ fontFamily: "BGSB", color: "#000" }}
                >
                  35
                </Text>
                <Text
                  className="text-5xl text-[#000] "
                  style={{ fontFamily: "BGSB", color: "#b2b2b2" }}
                >
                  %
                </Text>
              </HStack>
              <HStack className="flex gap-2">
                <Text className="">43 Attended |</Text>
                <Text className="text-error-300 ">3 missed</Text>
              </HStack>
            </VStack>
            <TrendingUpIcon color="#5c5c5c" />
          </HStack>

          <HStack className="flex border-border-300 p-3 border-t justify-between">
            <Text className="px-2 py-1 bg-typography-200 rounded-md">
              Total Classes : 45
            </Text>

            <Text className="px-2 py-1 bg-typography-200 rounded-md">
              Streak : 10 Days
            </Text>
          </HStack>
        </VStack>
      </View>
      <Grid
        className="gap- flex justify-between min-w-full"
        _extra={{
          className: "grid-cols-19  min-w-full",
        }}
      >
        <GridItem
          className="bg-background-50 rounded-xl  flex justify-start items-center w-full hover:bg-background-200 text-center"
          _extra={{
            className: "col-span-6 w-full",
          }}
        >
          <View className="p-6 border-b w-full flex justify-start items-center border-border-300 rounded-xl">
            <QrCodeIcon color="black" />
          </View>
          <Text className="p-2 text-center w-full flex justify-start items-center ">
            Scan
          </Text>
        </GridItem>
        <GridItem
          className="bg-background-50 rounded-xl  w-full hover:bg-background-200 text-center"
          _extra={{
            className: "col-span-6 w-full",
          }}
        >
          <View className="p-6 border-b w-full flex justify-start items-center border-border-300 rounded-xl">
            <ActivityIcon color="black" />
          </View>
          <Text className="p-2 text-center w-full flex justify-start items-center ">
            Analytics
          </Text>
        </GridItem>
        <GridItem
          className="bg-background-50 rounded-xl w-full  hover:bg-background-200 text-center"
          _extra={{
            className: "col-span-6 w-full",
          }}
        >
          <Pressable onPress={() => router.push("/history")}>
            <View className="p-6 border-b w-full flex justify-start items-center border-border-300 rounded-xl">
              <CalendarIcon color="black" />
            </View>
            <Text className="p-2 text-center w-full flex justify-start items-center ">
              History
            </Text>
          </Pressable>
        </GridItem>
      </Grid>
    </VStack>
  );
};
