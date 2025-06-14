import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase";
import { router } from "expo-router";
import { Mail, ArrowRight, ArrowLeft, KeyRound } from "lucide-react-native";
import { Image } from "@/components/ui/image";
import { VStack } from "@/components/ui/vstack";
import { useToast } from "@/components/ui/toast";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { TextInput } from "react-native";

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
    <View className="flex-1 justify-center px-6 bg-white">
      <View className="items-center mb-8">
        <Image
          source={{
            uri: "https://img.freepik.com/free-photo/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner_1258-100541.jpg?semt=ais_hybrid&w=740",
          }}
          alt="logo"
          className="w-20 h-20 rounded-2xl mb-4"
        />
        <Text className="text-3xl text-center" style={{ fontFamily: "BGSB" }}>
          Reset Password
        </Text>
        <Text
          className="text-gray-500 mt-2 text-center"
          style={{ fontFamily: "BGSB" }}
        >
          Enter your email address and we'll send you a link to reset your
          password.
        </Text>
      </View>

      <VStack space="md">
        <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
          <Mail size={20} color="#666" />
          <TextInput
            className="flex-1 p-4"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          className="w-full bg-blue-500 p-4 rounded-lg flex-row items-center justify-center space-x-2"
          onPress={handleResetPassword}
          disabled={loading}
        >
          <KeyRound size={20} color="white" />
          <Text className="text-white px-8 font-semibold">
            {loading ? "Sending..." : "Send Reset Link"}
          </Text>
          <ArrowRight size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/auth/signin")}
          className="flex-row items-center justify-center mt-4"
        >
          <ArrowLeft size={16} color="#3b82f6" />
          <Text className="text-blue-500 ml-1">Back to Sign In</Text>
        </TouchableOpacity>
      </VStack>
    </View>
  );
}
