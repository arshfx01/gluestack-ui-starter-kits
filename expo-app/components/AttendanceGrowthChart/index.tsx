import React from "react";
import { View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";

// Generate dummy data for 45 classes
const generateDummyData = () => {
  const data = [];
  let attended = 43;
  let missed = 3;
  const totalClasses = 45;

  for (let i = 0; i < totalClasses; i++) {
    const date = subDays(new Date(), totalClasses - i - 1);
    const isAttended = i < attended;

    data.push({
      date: format(date, "MMM dd"),
      attendance: isAttended ? 100 : 0,
      classNumber: i + 1,
    });
  }

  return data;
};

const data = generateDummyData();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <View className="bg-white p-3 rounded-lg shadow-lg border border-border-200">
        <Text className="text-sm font-medium text-background-950">
          Class {payload[0].payload.classNumber}
        </Text>
        <Text className="text-xs text-typography-400">{label}</Text>
        <Text className="text-sm font-semibold text-primary-600">
          {payload[0].value === 100 ? "Attended" : "Missed"}
        </Text>
      </View>
    );
  }
  return null;
};

export const AttendanceGrowthChart = () => {
  const attendanceRate = ((43 / 45) * 100).toFixed(1);

  return (
    <VStack className="flex-1 p-4" space="lg">
      <Card className="p-4">
        <VStack space="md">
          <HStack className="justify-between items-center">
            <VStack>
              <Heading className="text-xl font-bold text-background-950">
                Attendance Overview
              </Heading>
              <Text className="text-sm text-typography-400">
                Last 45 classes
              </Text>
            </VStack>
            <View className="bg-primary-50 px-3 py-2 rounded-lg">
              <Text className="text-primary-600 font-bold">
                {attendanceRate}%
              </Text>
            </View>
          </HStack>

          <View className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={(value: number) =>
                    value === 100 ? "Attended" : "Missed"
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: "#2563eb", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#2563eb" }}
                />
              </LineChart>
            </ResponsiveContainer>
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
            <Text className="text-sm text-typography-400">43/45 Classes</Text>
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );
};
