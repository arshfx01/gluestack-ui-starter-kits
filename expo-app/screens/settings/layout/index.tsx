import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { ScrollView } from "@/components/ui/scroll-view";
import { Image } from "@/components/ui/image";
import { View } from "react-native";
import BottomBtns from "@/components/BottomBtns";
import { useEffect } from "react";
import { router, useRouter } from "expo-router";
import { useAuth } from "@/app/context/AuthContext";
import NotLoggedIn from "@/components/NotLoggedIn";

type SettingsLayoutProps = {
  children: React.ReactNode;
};

export const SettingsLayout = (props: SettingsLayoutProps) => {
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    if (!user) {
      router.replace("/auth/splash-screen");
      return;
    }

    const intervalId = setInterval(() => {
      // Recheck the user status. If `user` becomes falsy, redirect.
      if (!user) {
        router.replace("/auth/splash-screen");
        clearInterval(intervalId);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [user, router]);
  return user ? (
    <SafeAreaView className="w-full h-full">
      <ScrollView
        className="w-full h-full"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <HStack className="w-full h-full bg-background-0 flex-grow justify-center">
          <VStack className="md:items-center relative md:justify-center flex-1 w-full  px-5 py-2 md:gap-10 gap-16 md:m-auto md:w-1/2 h-full">
            {props.children}
          </VStack>
        </HStack>
      </ScrollView>
    </SafeAreaView>
  ) : (
    <NotLoggedIn />
  );
};
