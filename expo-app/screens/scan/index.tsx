import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import React from "react";
import { ScrollView } from "react-native";

type Props = {};

const ScanScreen = (props: Props) => {
  return (
    <ScrollView className="flex-1 mb-20">
      <VStack className="w-full items-start h-full justify-" space="xl">
        <Text className="text-center text-2xl">Scan Now </Text>
      </VStack>
    </ScrollView>
  );
};

export default ScanScreen;
