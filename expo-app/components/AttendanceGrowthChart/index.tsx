import React from "react";
import { View, Dimensions } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { LineChart } from "react-native-chart-kit";
import { format, subDays } from "date-fns";

// Generate dummy data for 45 classes
const generateDummyData = () => {
  const data = [];
  const totalClasses = 45; // Keeping this for the overview text

  for (let i = 0; i < totalClasses; i++) {
    const date = subDays(new Date(), totalClasses - i - 1);
    // Generate a random attendance percentage to show ups and downs
    const attendancePercentage = Math.floor(Math.random() * 101);

    data.push({
      date: format(date, "MMM dd"),
      attendance: attendancePercentage,
      classNumber: i + 1,
    });
  }

  // For the overview, let's keep a consistent 'attended' and 'total' for display
  const attendedCountDisplay = 43;
  const totalClassesDisplay = 45;

  return {
    data,
    attendedCount: attendedCountDisplay,
    totalClasses: totalClassesDisplay,
  };
};

const { data, attendedCount, totalClasses } = generateDummyData();

const chartData = {
  labels: [], // Set to empty array to hide labels, but satisfy type
  datasets: [
    {
      data: data.map((d) => d.attendance),
    },
  ],
};

export const AttendanceGrowthChart = () => {
  const attendanceRate = ((attendedCount / totalClasses) * 100).toFixed(1);
  const screenWidth = Dimensions.get("window").width - 32; // Accounting for padding

  return (
    <VStack className=" " space="lg">
      <View className="p-2">
        <VStack space="md">
          <HStack className="justify-between items-center">
            <VStack>
              <Heading className="text-xl font-bold text-background-950">
                Attendance Overview
              </Heading>
              <Text className="text-sm text-typography-400">
                Last {totalClasses} classes
              </Text>
            </VStack>
            <View className="bg-primary-50 px-3 py-2 rounded-lg">
              <Text className="text-primary-600 font-bold">
                {attendanceRate}%
              </Text>
            </View>
          </HStack>

          <View className="h-[300px] max-w-full">
            <LineChart
              data={chartData}
              width={screenWidth}
              height={300}
              withDots={false}
              withHorizontalLines={false} // Remove horizontal grid lines
              withVerticalLines={false} // Remove vertical grid lines
              chartConfig={{
                backgroundColor: "#f8f8f8",
                backgroundGradientFrom: "#f8f8f8",
                backgroundGradientTo: "#f8f8f8",
                decimalPlaces: 0,
                color: (opacity = 1) => `#000`,
                // labelColor and propsForBackgroundLines removed as grid and labels are off
                style: {
                  borderRadius: 20,
                },
                propsForDots: {
                  r: "0",
                },
                fillShadowGradient: "#000",
                fillShadowGradientOpacity: 0.1,
              }}
              bezier
              style={{
                marginVertical: 1,
                borderRadius: 10,
                marginLeft: 0,
              }}
            />
          </View>

          <HStack className="justify-between mt-4">
            <HStack space="md">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-primary-600 mr-2" />
                <Text className="text-sm text-typography-600">Attended</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-error-600 mr-2" />
                <Text className="text-sm text-typography-600">Missed</Text>
              </View>
            </HStack>
            <Text className="text-sm text-typography-400">
              {attendedCount}/{totalClasses} Classes
            </Text>
          </HStack>
        </VStack>
      </View>
    </VStack>
  );
};
