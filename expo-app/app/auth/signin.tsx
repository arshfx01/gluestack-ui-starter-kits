import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, ScrollView, TextInput } from "react-native";
import {
  signInWithEmailAndPassword,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { router, useRouter } from "expo-router";
import {
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
  KeyRound,
  Phone,
  ArrowLeft,
} from "lucide-react-native";
import { Image } from "@/components/ui/image";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import type { FirebaseRecaptchaVerifierModal as RecaptchaVerifierModalType } from "expo-firebase-recaptcha";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

// Helper to map Firebase Auth error codes to user-friendly messages
const getFriendlyError = (code: string, fallback?: string) => {
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-not-found":
      return "No account found with this email or phone.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/invalid-verification-code":
      return "Invalid verification code.";
    case "auth/invalid-phone-number":
      return "Invalid phone number.";
    default:
      return fallback || "Something went wrong. Please try again.";
  }
};

export default function SignIn() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isPhoneSignIn, setIsPhoneSignIn] = useState(false);
  const recaptchaVerifier = useRef<RecaptchaVerifierModalType>(null);

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  const handleSignIn = async () => {
    if (!email || !password) {
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
      await signInWithEmailAndPassword(auth, email, password);
      toast.show({
        render: () => (
          <View className="bg-success-500 p-4 rounded-lg">
            <Text className="text-white">Signed in successfully</Text>
          </View>
        ),
      });
      router.replace("/(tabs)");
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

  const handlePhoneSignIn = async () => {
    if (!phoneNumber) {
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Please enter your phone number</Text>
          </View>
        ),
      });
      return;
    }

    try {
      setLoading(true);
      if (!recaptchaVerifier.current) {
        throw new Error("reCAPTCHA not initialized");
      }

      const formattedPhoneNumber = `+91${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        recaptchaVerifier.current
      );
      setVerificationId(confirmation.verificationId);
      setShowVerificationInput(true);
      toast.show({
        render: () => (
          <View className="bg-success-500 p-4 rounded-lg">
            <Text className="text-white">
              Verification code sent to your phone
            </Text>
          </View>
        ),
      });
    } catch (error: any) {
      const code = error?.code || "";
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">
              {getFriendlyError(
                code,
                error.message || "Failed to send verification code"
              )}
            </Text>
          </View>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode) {
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">
              Please enter the verification code
            </Text>
          </View>
        ),
      });
      return;
    }

    try {
      setLoading(true);
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      await signInWithCredential(auth, credential);
      toast.show({
        render: () => (
          <View className="bg-success-500 p-4 rounded-lg">
            <Text className="text-white">
              Phone number verified successfully
            </Text>
          </View>
        ),
      });
      router.replace("/(tabs)");
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
    <View className="flex-1 bg-white ">
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
              Welcome to Orbit
            </Text>
            <Text className="text-base text-gray-500 text-center">
              Where Attendance Meets Insight. Sign in to continue
            </Text>
          </View>

          <VStack space="lg">
            {!showVerificationInput ? (
              <>
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
                  onPress={handleSignIn}
                  disabled={loading}
                  className="w-full h-14 rounded-2xl shadow-md bg-primary-600 mt-4"
                >
                  <HStack space="sm" className="items-center">
                    <ButtonText className="text-white font-semibold">
                      {loading ? "Signing in..." : "Sign In with Email"}
                    </ButtonText>
                    <ArrowRight size={20} color="white" />
                  </HStack>
                </Button>

                <View className="flex-row items-center justify-center my-4">
                  <View className="flex-1 h-[1px] bg-gray-300" />
                  <Text className="mx-4 text-gray-500">OR</Text>
                  <View className="flex-1 h-[1px] bg-gray-300" />
                </View>

                <View className="bg-gray-50 p-2 border border-border-200 rounded-2xl">
                  <HStack space="md" className="items-center">
                    <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center">
                      <Phone size={20} color="#9CA3AF" />
                    </View>
                    <HStack space="sm" className="items-center flex-1">
                      <Text className="text-gray-600 font-medium">+91</Text>
                      <View className="h-6 w-[1px] bg-gray-300" />
                      <TextInput
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChangeText={(text) =>
                          setPhoneNumber(text.replace(/[^0-9]/g, ""))
                        }
                        keyboardType="phone-pad"
                        maxLength={10}
                        className="flex-1 text-base text-gray-900"
                        placeholderTextColor="#9CA3AF"
                      />
                    </HStack>
                  </HStack>
                </View>

                <Button
                  action="primary"
                  onPress={handlePhoneSignIn}
                  disabled={loading}
                  className="w-full h-14 rounded-2xl shadow-md bg-primary-600 mt-4"
                >
                  <HStack space="sm" className="items-center">
                    <ButtonText className="text-white font-semibold">
                      {loading ? "Sending Code..." : "Sign In with Phone"}
                    </ButtonText>
                    <Phone size={20} color="white" />
                  </HStack>
                </Button>
              </>
            ) : (
              <>
                <View className="bg-gray-50 p-2 border border-border-200 rounded-2xl">
                  <HStack space="md" className="items-center">
                    <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center">
                      <KeyRound size={20} color="#9CA3AF" />
                    </View>
                    <TextInput
                      placeholder="Enter verification code"
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      keyboardType="number-pad"
                      className="flex-1 text-base text-gray-900"
                      placeholderTextColor="#9CA3AF"
                    />
                  </HStack>
                </View>

                <Button
                  action="primary"
                  onPress={verifyCode}
                  disabled={loading}
                  className="w-full h-14 rounded-2xl shadow-md bg-primary-600 mt-4"
                >
                  <HStack space="sm" className="items-center">
                    <ButtonText className="text-white font-semibold">
                      {loading ? "Verifying..." : "Verify Code"}
                    </ButtonText>
                    <ArrowRight size={20} color="white" />
                  </HStack>
                </Button>

                <TouchableOpacity
                  onPress={() => setShowVerificationInput(false)}
                  className="flex-row items-center justify-center mt-4"
                >
                  <ArrowLeft size={16} color="#9CA3AF" />
                  <Text className="text-primary-600 ml-1">
                    Change Phone Number
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <HStack className="justify-between mt-4">
              <TouchableOpacity
                onPress={() => router.push("/auth/forgot-password")}
                className="flex-row items-center"
              >
                <KeyRound size={16} color="#9CA3AF" />
                <Text className="text-primary-600 ml-1">Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/auth/signup")}
                className="flex-row items-center"
              >
                <UserPlus size={16} color="#9CA3AF" />
                <Text className="text-primary-600 ml-1">Sign Up</Text>
              </TouchableOpacity>
            </HStack>
          </VStack>
        </View>
      </ScrollView>

      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
        attemptInvisibleVerification={false}
        title="Verify your phone number"
        cancelLabel="Cancel"
      />
    </View>
  );
}
