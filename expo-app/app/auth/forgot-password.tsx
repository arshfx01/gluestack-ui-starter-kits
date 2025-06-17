import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase";
import { router } from "expo-router";
import { Mail, ArrowRight, ArrowLeft, KeyRound } from "lucide-react-native";
import { Image } from "@/components/ui/image";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useToast } from "@/components/ui/toast";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleResetPassword = async () => {
    if (!email) {
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Please enter your email address</Text>
          </View>
        ),
      });
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      toast.show({
        render: () => (
          <View className="bg-success-500 p-4 rounded-lg">
            <Text className="text-white">
              Password reset email sent. Please check your inbox.
            </Text>
          </View>
        ),
      });
      router.push("/auth/signin");
    } catch (error: any) {
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">{error.message}</Text>
          </View>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="flex-1 justify-center px-6 py-8">
          <View className="items-center mb-8">
            <View className="bg-black border-2 border-border-300 w-20 h-20 rounded-2xl items-center justify-center mb-4 overflow-hidden">
              <Image
                source={{
                  uri: "https://img.freepik.com/free-photo/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner_1258-100541.jpg?semt=ais_hybrid&w=740",
                }}
                alt="logo"
                className="w-16 h-16 rounded-full"
              />
            </View>
            <Text
              fontWeight="bold"
              className="text-3xl text-gray-900 mb-2"
              style={{ fontFamily: "BGSB" }}
            >
              Reset Password
            </Text>
            <Text className="text-base text-gray-500 text-center">
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>
          </View>

          <VStack space="lg">
            <View className="bg-gray-50 p-2 border border-border-200 rounded-2xl">
              <HStack space="md" className="items-center">
                <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center">
                  <Mail size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 text-base text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
              </HStack>
            </View>

            <Button
              action="primary"
              onPress={handleResetPassword}
              disabled={loading}
              className="w-full h-14 rounded-2xl shadow-md bg-primary-600 mt-4"
            >
              <HStack space="sm" className="items-center">
                <KeyRound size={20} color="white" />
                <ButtonText className="text-white font-semibold">
                  {loading ? "Sending..." : "Send Reset Link"}
                </ButtonText>
                <ArrowRight size={20} color="white" />
              </HStack>
            </Button>

            <TouchableOpacity
              onPress={() => router.push("/auth/signin")}
              className="flex-row items-center justify-center mt-4"
            >
              <ArrowLeft size={16} color="#9CA3AF" />
              <Text className="text-primary-600 ml-1">Back to Sign In</Text>
            </TouchableOpacity>
          </VStack>
        </View>
      </ScrollView>
    </View>
  );
}
