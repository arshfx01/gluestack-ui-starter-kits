import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
import { Mail, Lock, User, Book, Phone } from "lucide-react-native";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/toast";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { teachersCollection } from "../config/collections";
import { VStack } from "@/components/ui/vstack";

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
          className="w-20 h-20 rounded-full mb-4"
        />
        <Text className="text-3xl text-center" style={{ fontFamily: "BGSB" }}>
          {isSignUp ? "Teacher Sign Up" : "Teacher Sign In"}
        </Text>
        <Text
          className="text-gray-500 mt-2 text-center"
          style={{ fontFamily: "BGSB" }}
        >
          {isSignUp
            ? "Create your teacher account"
            : "Sign in to your teacher account"}
        </Text>
      </View>

      <VStack space="md">
        {isSignUp && (
          <>
            <Input>
              <InputSlot>
                <User size={20} color="#666" />
              </InputSlot>
              <InputField
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
              />
            </Input>

            <Input>
              <InputSlot>
                <Book size={20} color="#666" />
              </InputSlot>
              <InputField
                placeholder="Subject"
                value={subject}
                onChangeText={setSubject}
              />
            </Input>

            <Input>
              <InputSlot>
                <Phone size={20} color="#666" />
              </InputSlot>
              <InputField
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </Input>
          </>
        )}

        <Input>
          <InputSlot>
            <Mail size={20} color="#666" />
          </InputSlot>
          <InputField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Input>

        <Input>
          <InputSlot>
            <Lock size={20} color="#666" />
          </InputSlot>
          <InputField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </Input>

        <Button onPress={handleTeacherAuth} disabled={loading} className="mt-4">
          <ButtonText>
            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
          </ButtonText>
        </Button>

        <TouchableOpacity
          onPress={() => setIsSignUp(!isSignUp)}
          className="mt-4"
        >
          <Text className="text-center text-blue-500">
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </VStack>
    </View>
  );
}
