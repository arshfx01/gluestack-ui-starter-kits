import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { TextInput } from "react-native";

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
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">
              {error.message || "Failed to send verification code"}
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
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
        attemptInvisibleVerification={false}
        title="Verify your phone number"
        cancelLabel="Cancel"
      />

      <View className="items-center mb-8">
        <Image
          source={{
            uri: "https://img.freepik.com/free-photo/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner_1258-100541.jpg?semt=ais_hybrid&w=740",
          }}
          alt="logo"
          className="w-20 h-20 rounded-full mb-4"
        />
        <Text className="text-3xl text-center" style={{ fontFamily: "BGSB" }}>
          Welcome to Orbit
        </Text>
        <Text
          className="text-gray-500 mt-2 text-center"
          style={{ fontFamily: "BGSB" }}
        >
          Where Attendance Meets Insight. Sign in to continue
        </Text>
      </View>

      <VStack space="md">
        {!showVerificationInput ? (
          <>
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

            <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
              <Lock size={20} color="#666" />
              <TextInput
                className="flex-1 p-4"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className="w-full  bg-blue-500 p-4 rounded-lg flex-row items-center justify-center space-x-2"
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text className="text-white px-2 font-semibold">
                {loading ? "Signing in..." : "Sign In with Email"}
              </Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>

            <View className="flex-row items-center justify-center my-4">
              <View className="flex-1 h-[1px] bg-gray-300" />
              <Text className="mx-4 text-gray-500">OR</Text>
              <View className="flex-1 h-[1px] bg-gray-300" />
            </View>

            <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
              <Phone size={20} color="#666" />
              <View className="flex-row items-center">
                <Text className="text-gray-600 font-medium px-2">+91</Text>
                <View className="h-6 w-[1px] bg-gray-300 mx-2" />
                <TextInput
                  className="flex-1 p-4"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChangeText={(text) =>
                    setPhoneNumber(text.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            <TouchableOpacity
              className="w-full bg-green-500 p-4 rounded-lg flex-row items-center justify-center space-x-2"
              onPress={handlePhoneSignIn}
              disabled={loading}
            >
              <Text className="text-white px-2 font-semibold">
                {loading ? "Sending Code..." : "Sign In with Phone"}
              </Text>
              <Phone size={20} color="white" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
              <KeyRound size={20} color="#666" />
              <TextInput
                className="flex-1 p-4"
                placeholder="Enter verification code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
              />
            </View>

            <TouchableOpacity
              className="w-full bg-green-500 p-4 rounded-lg flex-row items-center justify-center space-x-2"
              onPress={verifyCode}
              disabled={loading}
            >
              <Text className="text-white px-2 font-semibold">
                {loading ? "Verifying..." : "Verify Code"}
              </Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowVerificationInput(false)}
              className="flex-row items-center justify-center mt-4"
            >
              <ArrowLeft size={16} color="#3b82f6" />
              <Text className="text-blue-500 ml-1">Change Phone Number</Text>
            </TouchableOpacity>
          </>
        )}

        <HStack className="justify-between mt-4">
          <TouchableOpacity
            onPress={() => router.push("/auth/forgot-password")}
            className="flex-row items-center"
          >
            <KeyRound size={16} color="#3b82f6" />
            <Text className="text-blue-500 ml-1">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/auth/signup")}
            className="flex-row items-center"
          >
            <UserPlus size={16} color="#3b82f6" />
            <Text className="text-blue-500 ml-1">Sign Up</Text>
          </TouchableOpacity>
        </HStack>
      </VStack>
    </View>
  );
}
