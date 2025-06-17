import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetIcon,
} from "@/components/ui/actionsheet";
import { Pressable } from "@/components/ui/pressable";
import { Link } from "@/components/ui/link";

import { useColorScheme } from "nativewind";
import useRouter from "@unitools/router";

import { useState, useEffect } from "react";
import { X } from "lucide-react-native";
import { ImageBackground } from "react-native";
import SplashScreenImage from "@/assets/images/splash-screen-image.png";
import { useAuth } from "@/app/context/AuthContext";

const SplashScreen = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [showActionsheet, setShowActionsheet] = useState(false);
  const { user, loading } = useAuth();
  const handleClose = () => setShowActionsheet(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return null;
  }

  if (user) {
    return null;
  }

  return (
    <VStack className="w-full relative h-full items-center justify-between">
      <ImageBackground
        source={SplashScreenImage}
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
        className="flex-1 w-full  items-center justify-end"
      >
        <VStack
          className="items-center py-6 px-3 bg-background-0 border-t border-border-300 w-full "
          space="xl"
        >
          <Text
            className="text-3xl  text-center text-typography-950"
            style={{ fontFamily: "BGSB" }}
          >
            Welcome to Orbit!
          </Text>
          <Text
            fontWeight="bold"
            className="text-base text-center text-typography-600  max-w-[320px]"
          >
            Attendance made easy, fast, and reliable — for professors, for
            students, for everyone. Let's make every class count together.
          </Text>
          {/* Pagination dots (optional, uncomment if you have multiple onboarding screens) */}
          {/* <HStack space="sm" className="mb-8">
            <View className="w-2 h-2 rounded-full bg-primary-500" />
            <View className="w-2 h-2 rounded-full bg-typography-300" />
            <View className="w-2 h-2 rounded-full bg-typography-300" />
          </HStack> */}
          <Button
            action="primary"
            size="lg"
            className="w-full h-14 rounded-2xl bg-[#000] "
            onPress={() => setShowActionsheet(true)}
          >
            <ButtonText className="" style={{ fontFamily: "BGSB" }}>
              Get started
            </ButtonText>
          </Button>
        </VStack>
      </ImageBackground>

      <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-background-0 p-0">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack className="py-4  items-center" space="lg">
            <Text
              className="text-2xl  text-typography-950 "
              style={{ fontFamily: "BGSB" }}
            >
              Login or sign up
            </Text>
            <Text
              className="text-sm text-center text-typography-600 dark:text-typography-400 max-w-[280px]"
              style={{ fontFamily: "InterSemiBold" }}
            >
              Please select your preferred method to continue setting up your
              account
            </Text>
          </VStack>
          <VStack className="w-full p-4" space="md">
            <Button
              action="primary"
              size="lg"
              className="w-full rounded-2xl bg-[#000] h-14"
              onPress={() => {
                router.push("/auth/signin");
                handleClose();
              }}
            >
              <ButtonText className="" style={{ fontFamily: "BGSB" }}>
                Continue with Email
              </ButtonText>
            </Button>
            <Button
              action="secondary"
              size="lg"
              className="w-full rounded-2xl bg-[#000] h-14"
              onPress={() => {
                router.push("/auth/signin"); // Handle continue with phone
                handleClose();
              }}
            >
              <ButtonText className="" style={{ fontFamily: "BGSB" }}>
                Continue with Phone
              </ButtonText>
            </Button>
            <Text className="text-sm text-typography-500 text-center">Or</Text>
            <VStack className=" space-x-4 w-full">
              <Button
                action="default"
                variant="outline"
                size="lg"
                className="w-full rounded-2xl h-14"
                onPress={() => {
                  router.push("/auth/teacher-auth"); // Handle continue with phone
                  handleClose();
                }}
              >
                <ButtonText
                  className="text-typography-950"
                  style={{ fontFamily: "BGSB" }}
                >
                  For Teacher
                </ButtonText>
              </Button>
            </VStack>
            <Text className="text-xs text-typography-400 text-center mt-4">
              If you are creating a new account,
              <Text className="underline text-xs text-typography-400 ">
                {"   "}
                Terms & Conditions
              </Text>
              {"   "}
              and
              {"   "}
              <Text className="underline text-xs text-typography-400 ">
                Privacy Policy
              </Text>
              {"   "}
              will apply.
            </Text>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </VStack>
  );
};

export default SplashScreen;
