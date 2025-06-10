import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AuthLayout } from "../auth/layout";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { View, ScrollView } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { SettingsLayout } from "./layout";
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  ActivityIcon,
  CalendarIcon,
  Eye,
  InfoIcon,
  QrCodeIcon,
  TrendingUpIcon,
} from "lucide-react-native";
import { Grid, GridItem } from "@/components/ui/grid";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { Link } from "@/components/ui/link";
import { Divider } from "@/components/ui/divider";
import { Image } from "@/components/ui/image";

const Settingspage = () => {
  return (
    <ScrollView className="flex-1 mb-20">
      <VStack className="w-full items-start h-full justify-" space="xl">
        {/*
        <HStack className="w-full">
          <Alert action="muted" className="w-full rounded-xl" variant="solid">
            <AlertIcon as={InfoIcon} />
            <AlertText className="flex flex-col gap-3">
              You Missed Classes today! Please inform to respective incharge{" "}
              <Text className="text-primary-600 underline ">Now</Text>
            </AlertText>
          </Alert>
        </HStack>
        */}
        <VStack className="w-full" space="md">
          <VStack className="w-full">
            <Heading className="font-normal text-secondary-300 tracking-tight text-2xl">
              Welcome,
            </Heading>
            <Heading className="font-medium text-typography-950 tracking-tight text-2xl">
              Mohammed Arshad Hussain.
            </Heading>
          </VStack>
          <View className="w-full min-h-40 bg-background-100 border border-border-300 rounded-xl">
            <VStack className="w-full " space="md">
              <HStack className="flex border-border-300 p-3 border-b justify-between">
                <Text>My Attendance</Text>
                <InfoIcon color="#5c5c5c" />
              </HStack>
              <HStack className="flex p-3 justify-between">
                <VStack className="" space="md">
                  <Text className="text-5xl  font-bold text-background-950">
                    93%
                  </Text>
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
              <View className="p-6 border-b w-full flex justify-start items-center border-border-300 rounded-xl">
                <CalendarIcon color="black" />
              </View>
              <Text className="p-2 text-center w-full flex justify-start items-center ">
                History
              </Text>
            </GridItem>
          </Grid>
          <Divider />
          <HStack className="w-full flex gap-4  items-center justify-start">
            <View className="px-3 py-1 bg-background-100 rounded-md ">
              <HStack className="flex gap-2 items-center">
                <Text className="text-xl  font-normal text-[#000]">
                  Announcements
                </Text>
                <Text>2</Text>
              </HStack>
            </View>
            <View className="px-3 py-1  rounded-md ">
              <Text className="text-xl font-normal text-[#aeaeae]">
                Timeline
              </Text>
            </View>
            <View className="px-3 py-1  rounded-md ">
              <Text className="text-xl font-normal text-[#aeaeae]">Top</Text>
            </View>
          </HStack>
          <VStack space="xs" className="w-full">
            <View className="w-full h-32 bg-background-100 rounded-lg" />
            <View className="w-full h-32 bg-background-100 rounded-lg" />
            <View className="w-full h-32 bg-background-100 rounded-lg" />
          </VStack>
          <Divider />
        </VStack>
      </VStack>
    </ScrollView>
  );
};

export const Settings = () => {
  return <SettingsLayout children={<Settingspage />} />;
};
