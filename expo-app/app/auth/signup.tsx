import React, { useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, ScrollView, TextInput } from "react-native";
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
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

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
    <View className="flex-1 bg-white">
      {/* Header */}

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
              Create Account
            </Text>
            <Text className="text-base text-gray-500 text-center">
              Sign up to get started
            </Text>
          </View>

          <VStack space="lg">
            <View className="bg-gray-50 p-2 border border-border-200 rounded-2xl">
              <HStack space="md" className="items-center">
                <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center">
                  <User size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  className="flex-1 text-base text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
              </HStack>
            </View>

            <View className="bg-gray-50 p-2 border border-border-200 rounded-2xl">
              <HStack space="md" className="items-center">
                <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center">
                  <Hash size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Roll No."
                  value={rollNo}
                  onChangeText={setRollNo}
                  keyboardType="default"
                  className="flex-1 text-base text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
              </HStack>
            </View>

            <View className="flex-row items-center justify-center my-4">
              <TouchableOpacity
                onPress={() => setSignUpMethod("email")}
                className={`flex-1 p-3 rounded-2xl mr-2 ${
                  signUpMethod === "email" ? "bg-primary-600" : "bg-gray-100"
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
                className={`flex-1 p-3 rounded-2xl ml-2 ${
                  signUpMethod === "phone" ? "bg-primary-600" : "bg-gray-100"
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

                <View className="bg-gray-50 p-2 border border-border-200 rounded-2xl">
                  <HStack space="md" className="items-center">
                    <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center">
                      <Lock size={20} color="#9CA3AF" />
                    </View>
                    <TextInput
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      className="flex-1 text-base text-gray-900"
                      placeholderTextColor="#9CA3AF"
                    />
                  </HStack>
                </View>

                <Button
                  action="primary"
                  onPress={handleEmailSignUp}
                  disabled={loading}
                  className="w-full h-14 rounded-2xl shadow-md bg-primary-600 mt-4"
                >
                  <HStack space="sm" className="items-center">
                    <ButtonText className="text-white font-semibold">
                      {loading ? "Creating Account..." : "Sign Up with Email"}
                    </ButtonText>
                    <ArrowRight size={20} color="white" />
                  </HStack>
                </Button>
              </>
            ) : !showVerificationInput ? (
              <>
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
                  onPress={handlePhoneSignUp}
                  disabled={loading}
                  className="w-full h-14 rounded-2xl shadow-md bg-primary-600 mt-4"
                >
                  <HStack space="sm" className="items-center">
                    <ButtonText className="text-white font-semibold">
                      {loading ? "Sending Code..." : "Sign Up with Phone"}
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

            <TouchableOpacity
              onPress={() => router.push("/auth/signin")}
              className="flex-row items-center justify-center mt-4"
            >
              <LogIn size={16} color="#9CA3AF" />
              <Text className="text-primary-600 ml-1">
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
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
