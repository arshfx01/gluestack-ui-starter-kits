import React, { useState } from "react";
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import {
  Phone,
  Hash,
  CalendarDays,
  Building2,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Trash2,
} from "lucide-react-native";
import { db } from "@/app/config/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Pressable } from "@/components/ui/pressable";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogBackdrop,
  AlertDialogCloseButton,
} from "@/components/ui/alert-dialog";
import { deleteUser } from "firebase/auth";
import { useRouter } from "expo-router";

const Settings = () => {
  const { user, userProfile } = useAuth();
  const toast = useToast();
  const router = useRouter();

  // Local state for editable fields
  const [phoneNumber, setPhoneNumber] = useState(
    (userProfile as any)?.phoneNumber || ""
  );
  const [rollNo, setRollNo] = useState(userProfile?.rollNo || "");
  const [year, setYear] = useState((userProfile as any)?.year || "");
  const [semester, setSemester] = useState(
    (userProfile as any)?.semester || ""
  );
  const [department, setDepartment] = useState(
    (userProfile as any)?.department || ""
  );
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fullName, setFullName] = useState(userProfile?.fullName || "");
  const [email, setEmail] = useState(userProfile?.email || "");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleUpdateField = async (field: string, value: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      // For phoneNumber, ensure +91 prefix
      let updateValue = value;
      if (field === "phoneNumber") {
        if (!value.startsWith("+91")) {
          updateValue = `+91${value.replace(/^\+?91/, "")}`;
        }
      }
      await updateDoc(userRef, { [field]: updateValue });
      toast.show({
        render: () => (
          <View className="bg-success-500 p-4 rounded-lg">
            <Text className="text-white">{field} updated successfully!</Text>
          </View>
        ),
      });
      // Optionally, refresh userProfile in context (if you have a method for this)
      // Otherwise, reload the page as a fallback
      // window.location.reload();
    } catch (error) {
      toast.show({
        render: () => (
          <View className="bg-error-500 p-4 rounded-lg">
            <Text className="text-white">Failed to update {field}</Text>
          </View>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white "
      style={{ flex: 1 }}
    >
      <ScrollView className="flex-1 h-screen ">
        <View className="p-6 pb-20">
          <Text className="text-xl text-center  mb-3 text-typography-950">
            Profile Settings
          </Text>

          {/* Accordion-style Profile Settings */}
          <View className=" bg-background-50  border border-border-200 shadow-sm  overflow-hidden mb-4 rounded-2xl">
            <View className="  border border-border-200 shadow-sm  overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center px-6 min-h-fit py-4"
                onPress={() =>
                  setExpanded(expanded === "fullname" ? null : "fullname")
                }
                activeOpacity={0.8}
              >
                <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-3">
                  <User size={20} color="#9CA3AF" />
                </View>
                <Text className="flex-1 text-gray-900 font-medium">
                  Full Name
                </Text>
                <Text className="text-gray-500 mr-2">
                  {fullName || "Not set"}
                </Text>
                {expanded === "fullname" ? (
                  <ChevronUp size={20} color="#9CA3AF" />
                ) : (
                  <ChevronDown size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
              {expanded === "fullname" && (
                <View className="p-6 border-t border-border-200">
                  <TextInput
                    className="bg-gray-50 border border-border-200 rounded-xl px-4 py-2 text-base text-gray-900 mb-4"
                    placeholder="Enter full name"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Pressable
                    className="w-full bg-primary-600 rounded-xl py-3 items-center justify-center"
                    onPress={() => handleUpdateField("fullName", fullName)}
                    disabled={loading}
                    style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                  >
                    <Text className="text-white font-semibold text-base">
                      Update
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Email */}
            <View className="  border border-border-200 shadow-sm  overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center px-6 min-h-fit py-4"
                onPress={() =>
                  setExpanded(expanded === "email" ? null : "email")
                }
                activeOpacity={0.8}
              >
                <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-3">
                  <Mail size={20} color="#9CA3AF" />
                </View>
                <Text className="flex-1 text-gray-900 font-medium">Email</Text>
                <Text className="text-gray-500 mr-2">{email || "Not set"}</Text>
                {expanded === "email" ? (
                  <ChevronUp size={20} color="#9CA3AF" />
                ) : (
                  <ChevronDown size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
              {expanded === "email" && (
                <View className="p-6 border-t border-border-200">
                  <TextInput
                    className="bg-gray-50 border border-border-200 rounded-xl px-4 py-2 text-base text-gray-900 mb-4"
                    placeholder="Enter email"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Pressable
                    className="w-full bg-primary-600 rounded-xl py-3 items-center justify-center"
                    onPress={() => {
                      if (!email) {
                        toast.show({
                          render: () => (
                            <View className="bg-error-500 p-4 rounded-lg">
                              <Text className="text-white">
                                Please enter an email
                              </Text>
                            </View>
                          ),
                        });
                        return;
                      }
                      handleUpdateField("email", email);
                    }}
                    disabled={loading}
                    style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                  >
                    <Text className="text-white font-semibold text-base">
                      Update
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
            {/* Phone Number */}
            <View className="  border border-border-200 shadow-sm  overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center px-6 min-h-fit py-4"
                onPress={() =>
                  setExpanded(expanded === "phone" ? null : "phone")
                }
                activeOpacity={0.8}
              >
                <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-3">
                  <Phone size={20} color="#9CA3AF" />
                </View>
                <Text className="flex-1 text-gray-900 font-medium">
                  Phone Number
                </Text>
                <Text className="text-gray-500 mr-2">
                  {phoneNumber || "Not set"}
                </Text>
                {expanded === "phone" ? (
                  <ChevronUp size={20} color="#9CA3AF" />
                ) : (
                  <ChevronDown size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
              {expanded === "phone" && (
                <View className="p-6 border-t border-border-200">
                  <TextInput
                    className="bg-gray-50 border border-border-200 rounded-xl px-4 py-2 text-base text-gray-900 mb-4"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Pressable
                    className="w-full bg-primary-600 rounded-xl py-3 items-center justify-center"
                    onPress={() =>
                      handleUpdateField("phoneNumber", phoneNumber)
                    }
                    disabled={loading}
                    style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                  >
                    <Text className="text-white font-semibold text-base">
                      Update
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Roll Number */}
            <View className="  border border-border-200 shadow-sm  overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center px-6 py-4"
                onPress={() => setExpanded(expanded === "roll" ? null : "roll")}
                activeOpacity={0.8}
              >
                <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-3">
                  <Hash size={20} color="#9CA3AF" />
                </View>
                <Text className="flex-1 text-gray-900 font-medium">
                  Roll Number
                </Text>
                <Text className="text-gray-500 mr-2">
                  {rollNo || "Not set"}
                </Text>
                {expanded === "roll" ? (
                  <ChevronUp size={20} color="#9CA3AF" />
                ) : (
                  <ChevronDown size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
              {expanded === "roll" && (
                <View className="p-6 border-t border-border-200">
                  <TextInput
                    className="bg-gray-50 border border-border-200 rounded-xl px-4 py-2 text-base text-gray-900 mb-4"
                    placeholder="Enter roll number"
                    value={rollNo}
                    onChangeText={setRollNo}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Pressable
                    className="w-full bg-primary-600 rounded-xl py-3 items-center justify-center"
                    onPress={() => handleUpdateField("rollNo", rollNo)}
                    disabled={loading}
                    style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                  >
                    <Text className="text-white font-semibold text-base">
                      Update
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Year & Semester */}
            <View className="  border border-border-200 shadow-sm  overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center px-6 py-4"
                onPress={() =>
                  setExpanded(expanded === "yearsem" ? null : "yearsem")
                }
                activeOpacity={0.8}
              >
                <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-3">
                  <CalendarDays size={20} color="#9CA3AF" />
                </View>
                <Text className="flex-1 text-gray-900 font-medium">
                  Year & Sem
                </Text>
                <Text className="text-gray-500 mr-2">
                  {year || "-"} / {semester || "-"}
                </Text>
                {expanded === "yearsem" ? (
                  <ChevronUp size={20} color="#9CA3AF" />
                ) : (
                  <ChevronDown size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
              {expanded === "yearsem" && (
                <View className="w-full">
                  <HStack
                    space="sm"
                    className=" flex-row items-center w-full space-x-2 p-6 border-t border-border-200"
                  >
                    <TextInput
                      className="bg-gray-50 border border-border-200 rounded-xl px-4 py-2 text-base text-gray-900  flex-1"
                      placeholder="Year"
                      value={year}
                      onChangeText={setYear}
                      placeholderTextColor="#9CA3AF"
                      style={{ maxWidth: 80 }}
                    />
                    <TextInput
                      className="bg-gray-50 border border-border-200 rounded-xl px-4 py-2 text-base text-gray-900  flex-1"
                      placeholder="Semester"
                      value={semester}
                      onChangeText={setSemester}
                      placeholderTextColor="#9CA3AF"
                      style={{ maxWidth: 80 }}
                    />
                  </HStack>
                  <View className="px-6 py-4 border-t border-border-200">
                    <Pressable
                      className="w-full bg-primary-600 rounded-xl py-3 items-center justify-center"
                      onPress={() => {
                        handleUpdateField("year", year);
                        handleUpdateField("semester", semester);
                      }}
                      disabled={loading}
                      style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                    >
                      <Text className="text-white font-semibold text-base">
                        Update
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            {/* Department */}
            <View className="  border border-border-200 shadow-sm  overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center px-6 py-4"
                onPress={() =>
                  setExpanded(expanded === "department" ? null : "department")
                }
                activeOpacity={0.8}
              >
                <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center mr-3">
                  <Building2 size={20} color="#9CA3AF" />
                </View>
                <Text className="flex-1 text-gray-900 font-medium">
                  Department
                </Text>
                <Text className="text-gray-500 mr-2">
                  {department || "Not set"}
                </Text>
                {expanded === "department" ? (
                  <ChevronUp size={20} color="#9CA3AF" />
                ) : (
                  <ChevronDown size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
              {expanded === "department" && (
                <View className="p-6 border-t border-border-200">
                  <TextInput
                    className="bg-gray-50 border border-border-200 rounded-xl px-4 py-2 text-base text-gray-900 mb-4"
                    placeholder="Enter department"
                    value={department}
                    onChangeText={setDepartment}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Pressable
                    className="w-full bg-primary-600 rounded-xl py-3 items-center justify-center"
                    onPress={() => handleUpdateField("department", department)}
                    disabled={loading}
                    style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                  >
                    <Text className="text-white font-semibold text-base">
                      Update
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {/* Full Name */}

          {/* Other Settings Section */}
          <Text className="text-xl text-center my-8 mb-2 text-typography-950">
            Other Settings
          </Text>
          <View className="  border border-border-200 shadow-sm rounded-xl  overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center px-6 min-h-fit py-4"
              onPress={() => setExpanded(expanded === "other" ? null : "other")}
              activeOpacity={0.8}
            >
              <Trash2 size={20} color="#ef4444" className="mr-3" />
              <Text className="flex-1 px-2 text-error-600 font-semibold">
                Delete Account
              </Text>
              {expanded === "other" ? (
                <ChevronUp size={20} color="#9CA3AF" />
              ) : (
                <ChevronDown size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
            {expanded === "other" && (
              <View className="p-6 border-t border-border-200">
                <Text className="text-error-600 font-semibold mb-2">
                  Warning: This action cannot be undone.
                </Text>
                <Text className="text-gray-600 mb-4">
                  Deleting your account will permanently remove all your data
                  from our system.
                </Text>
                <Pressable
                  className="w-full bg-error-600 rounded-xl py-3 items-center justify-center mb-2 flex-row"
                  onPress={() => setShowDeleteDialog(true)}
                >
                  <Trash2 size={18} color="#fff" className="mr-2" />
                  <Text className="text-white px-2 font-semibold text-base">
                    Delete Account
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Delete Account AlertDialog */}
          <AlertDialog
            isOpen={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
          >
            <AlertDialogBackdrop />
            <AlertDialogContent className="p-0 w-[90%] max-w-md">
              <AlertDialogHeader className="border-b px-6 py-6 border-border-200 flex-row items-center justify-between">
                <Text
                  fontWeight="bold"
                  className="text-xl  f text-error-600 flex-1"
                >
                  Delete Account
                </Text>
                <AlertDialogCloseButton
                  onPress={() => setShowDeleteDialog(false)}
                />
              </AlertDialogHeader>
              <AlertDialogBody className="px-6 py-4 border-b border-border-200 ">
                <Text className="text-base text-error-600 font-semibold mb-2">
                  This action is irreversible!
                </Text>
                <Text className="text-base text-gray-700 mb-4">
                  Are you sure you want to delete your account? All your data
                  will be permanently removed.
                </Text>
              </AlertDialogBody>
              <AlertDialogFooter className="px-6 py-4 flex-row justify-end">
                <Pressable
                  className="bg-gray-200 rounded-lg px-4 py-2 mr-2"
                  onPress={() => setShowDeleteDialog(false)}
                >
                  <Text className="text-gray-800 font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                  className="bg-error-600 rounded-lg px-4 py-2 flex-row items-center justify-center"
                  onPress={async () => {
                    setShowDeleteDialog(false);
                    if (!user) return;
                    try {
                      // Delete Firestore user document
                      await deleteDoc(doc(db, "users", user.uid));
                      // Delete Auth user
                      await deleteUser(user);
                      toast.show({
                        render: () => (
                          <View className="bg-success-500 p-4 rounded-lg">
                            <Text className="text-white">
                              Account deleted successfully
                            </Text>
                          </View>
                        ),
                      });
                      // Redirect to auth page
                      router.replace("/auth/teacher-auth" as any);
                    } catch (error) {
                      toast.show({
                        render: () => (
                          <View className="bg-error-500 p-4 rounded-lg">
                            <Text className="text-white">
                              Failed to delete account
                            </Text>
                          </View>
                        ),
                      });
                    }
                  }}
                >
                  <Trash2 size={18} color="#fff" className="mr-2" />
                  <Text className="text-white px-2 font-semibold">Delete</Text>
                </Pressable>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Settings;
