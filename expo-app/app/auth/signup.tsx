import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  createUserWithEmailAndPassword,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { router, useRouter } from "expo-router";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  Hash,
  LogIn,
  Phone,
  KeyRound,
  ArrowLeft,
} from "lucide-react-native";
import { Image } from "@/components/ui/image";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import type { FirebaseRecaptchaVerifierModal as RecaptchaVerifierModalType } from "expo-firebase-recaptcha";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/toast";

import { TextInput } from "react-native";

export default function SignUp() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [signUpMethod, setSignUpMethod] = useState<"email" | "phone">("email");
  const recaptchaVerifier = useRef<RecaptchaVerifierModalType>(null);

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  const checkExistingUser = async (field: string, value: string) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where(field, "==", value));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleEmailSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName || !rollNo) {
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Please fill in all fields</Text>
          </View>
        ),
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Passwords do not match</Text>
          </View>
        ),
      });
      return;
    }

    try {
      setLoading(true);

      // Check if roll number already exists
      const rollNoExists = await checkExistingUser("rollNo", rollNo);
      if (rollNoExists) {
        toast.show({
          render: () => (
            <View className="bg-error-500 p-4 rounded-lg">
              <Text className="text-white">
                This Roll Number is already registered
              </Text>
            </View>
          ),
        });
        return;
      }

      // Check if email already exists
      const emailExists = await checkExistingUser("email", email);
      if (emailExists) {
        toast.show({
          render: () => (
            <View className="bg-error-500 p-4 rounded-lg">
              <Text className="text-white">
                This email is already registered
              </Text>
            </View>
          ),
        });
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName,
        rollNo,
        email: userCredential.user.email,
        createdAt: new Date().toISOString(),
        role: rollNo.startsWith("1") ? "teacher" : "student",
        classId: "",
      });

      toast.show({
        render: () => (
          <View className="bg-success-500 p-4 rounded-lg">
            <Text className="text-white">Account created successfully</Text>
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

  const handlePhoneSignUp = async () => {
    if (!fullName || !rollNo || !phoneNumber) {
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

      // Check if roll number already exists
      const rollNoExists = await checkExistingUser("rollNo", rollNo);
      if (rollNoExists) {
        toast.show({
          render: () => (
            <View className="bg-error-500 p-4 rounded-lg">
              <Text className="text-white">
                This Roll Number is already registered
              </Text>
            </View>
          ),
        });
        return;
      }

      // Check if phone number already exists
      const formattedPhoneNumber = `+91${phoneNumber}`;
      const phoneExists = await checkExistingUser(
        "phoneNumber",
        formattedPhoneNumber
      );
      if (phoneExists) {
        toast.show({
          render: () => (
            <View className="bg-error-500 p-4 rounded-lg">
              <Text className="text-white">
                This phone number is already registered
              </Text>
            </View>
          ),
        });
        return;
      }

      if (!recaptchaVerifier.current) {
        throw new Error("reCAPTCHA not initialized");
      }

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
      const userCredential = await signInWithCredential(auth, credential);

      // Save user profile data
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName,
        rollNo,
        phoneNumber: userCredential.user.phoneNumber,
        createdAt: new Date().toISOString(),
        role: rollNo.startsWith("1") ? "teacher" : "student",
        classId: "",
      });

      toast.show({
        render: () => (
          <View className="bg-success-500 p-4 rounded-lg">
            <Text className="text-white">Account created successfully</Text>
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
          Create Account
        </Text>
        <Text
          className="text-gray-500 mt-2 text-center"
          style={{ fontFamily: "BGSB" }}
        >
          Sign up to get started
        </Text>
      </View>

      <VStack space="md">
        <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
          <User size={20} color="#666" />
          <TextInput
            className="flex-1 p-4"
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
          <Hash size={20} color="#666" />
          <TextInput
            className="flex-1 p-4"
            placeholder="Roll No."
            value={rollNo}
            onChangeText={setRollNo}
            keyboardType="default"
          />
        </View>

        <View className="flex-row items-center justify-center my-4">
          <TouchableOpacity
            onPress={() => setSignUpMethod("email")}
            className={`flex-1 p-3 rounded-lg mr-2 ${
              signUpMethod === "email" ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                signUpMethod === "email" ? "text-white" : "text-gray-600"
              }`}
            >
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSignUpMethod("phone")}
            className={`flex-1 p-3 rounded-lg ml-2 ${
              signUpMethod === "phone" ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                signUpMethod === "phone" ? "text-white" : "text-gray-600"
              }`}
            >
              Phone
            </Text>
          </TouchableOpacity>
        </View>

        {signUpMethod === "email" ? (
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

            <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
              <Lock size={20} color="#666" />
              <TextInput
                className="flex-1 p-4"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className="w-full bg-blue-500 p-4 rounded-lg flex-row items-center justify-center space-x-2"
              onPress={handleEmailSignUp}
              disabled={loading}
            >
              <Text className="text-white px-2 font-semibold">
                {loading ? "Creating Account..." : "Sign Up with Email"}
              </Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
          </>
        ) : !showVerificationInput ? (
          <>
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
              onPress={handlePhoneSignUp}
              disabled={loading}
            >
              <Text className="text-white px-2 font-semibold">
                {loading ? "Sending Code..." : "Sign Up with Phone"}
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

        <TouchableOpacity
          onPress={() => router.push("/auth/signin")}
          className="flex-row items-center justify-center mt-4"
        >
          <LogIn size={16} color="#3b82f6" />
          <Text className="text-blue-500 ml-1">
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </VStack>
    </View>
  );
}
