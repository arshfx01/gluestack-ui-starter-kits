import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, TextInput } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { router } from "expo-router";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Mail, Lock, User, Book, Phone, ArrowLeft } from "lucide-react-native";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/toast";
import { Button, ButtonText } from "@/components/ui/button";
import { teachersCollection } from "../config/collections";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";

// Helper to map Firebase Auth error codes to user-friendly messages
const getFriendlyError = (code: string, fallback?: string) => {
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return fallback || "Something went wrong. Please try again.";
  }
};

export default function TeacherAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleTeacherAuth = async () => {
    if (!email || !password || (isSignUp && (!name || !subject || !phone))) {
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Please fill in all fields</Text>
          </View>
        ),
      });
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        // Handle teacher sign up
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await setDoc(doc(db, "teachers", userCredential.user.uid), {
          name,
          email,
          subject,
          phone,
          classes: [],
          createdAt: new Date().toISOString(),
        });

        toast.show({
          render: () => (
            <View className="bg-success-500 p-4 rounded-lg">
              <Text className="text-white">Account created successfully</Text>
            </View>
          ),
        });
      } else {
        // Handle teacher sign in
        await signInWithEmailAndPassword(auth, email, password);
        toast.show({
          render: () => (
            <View className="bg-success-500 p-4 rounded-lg">
              <Text className="text-white">Signed in successfully</Text>
            </View>
          ),
        });
      }
      router.replace("/teacher/dashboard" as any);
    } catch (error: any) {
      const code = error?.code || "";
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">
              {getFriendlyError(code, error.message)}
            </Text>
          </View>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-6 bg-white">
        <TouchableOpacity className="mb-4" onPress={() => router.back()}>
          <HStack space="sm" className="items-center">
            <ArrowLeft size={24} color="#9CA3AF" />
            <Text className="text-gray-600">Back</Text>
          </HStack>
        </TouchableOpacity>
      </View>

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
              {isSignUp ? "Teacher Sign Up" : "Teacher Sign In"}
            </Text>
            <Text className="text-base text-gray-500 text-center">
              {isSignUp
                ? "Create your teacher account"
                : "Sign in to your teacher account"}
            </Text>
          </View>

          <VStack space="lg">
            {isSignUp && (
              <>
                <View className="bg-gray-50 p-2 border border-border-200 rounded-2xl">
                  <HStack space="md" className="items-center">
                    <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center">
                      <User size={20} color="#9CA3AF" />
                    </View>
                    <TextInput
                      placeholder="Full Name"
                      value={name}
                      onChangeText={setName}
                      className="flex-1 text-base text-gray-900"
                      placeholderTextColor="#9CA3AF"
                    />
                  </HStack>
                </View>

                <View className="bg-gray-50 p-2 border border-border-200 rounded-2xl">
                  <HStack space="md" className="items-center">
                    <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center">
                      <Book size={20} color="#9CA3AF" />
                    </View>
                    <TextInput
                      placeholder="Subject"
                      value={subject}
                      onChangeText={setSubject}
                      className="flex-1 text-base text-gray-900"
                      placeholderTextColor="#9CA3AF"
                    />
                  </HStack>
                </View>

                <View className="bg-gray-50 p-2 border border-border-200 rounded-2xl">
                  <HStack space="md" className="items-center">
                    <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center">
                      <Phone size={20} color="#9CA3AF" />
                    </View>
                    <TextInput
                      placeholder="Phone Number"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      className="flex-1 text-base text-gray-900"
                      placeholderTextColor="#9CA3AF"
                    />
                  </HStack>
                </View>
              </>
            )}

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

            <View className="bg-gray-50 p-2 border border-border-200 rounded-2xl">
              <HStack space="md" className="items-center">
                <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center">
                  <Lock size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className="flex-1 text-base text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
              </HStack>
            </View>

            <Button
              action="primary"
              onPress={handleTeacherAuth}
              disabled={loading}
              className="w-full h-14 rounded-2xl shadow-md bg-primary-600 mt-4"
            >
              <ButtonText className="text-white font-semibold">
                {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
              </ButtonText>
            </Button>

            <TouchableOpacity
              onPress={() => setIsSignUp(!isSignUp)}
              className="mt-4"
            >
              <Text className="text-center text-primary-600 font-medium">
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </VStack>
        </View>
      </ScrollView>
    </View>
  );
}
