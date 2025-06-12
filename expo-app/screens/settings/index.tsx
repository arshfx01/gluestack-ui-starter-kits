import { AttendanceGrowthChart } from "@/components/AttendanceGrowthChart";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import React from "react";
import { View } from "react-native";

type Props = {};

const Settings = (props: Props) => {
  return (
    <VStack className="p-3 bg-background-100">
      <AttendanceGrowthChart />
    </VStack>
  );
};

export default Settings;
